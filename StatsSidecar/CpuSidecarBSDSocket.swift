import Foundation

/**
 * Alternative HTTP server using BSD sockets (more control, simpler for HTTP/1.1)
 * Use this if NWConnection continues to have issues with body delivery
 */
final class CpuSidecarBSDSocket {
    private var serverSocket: Int32 = -1
    private let port: UInt16 = 8973
    private var isRunning = false
    private let queue = DispatchQueue(label: "cpu-sidecar-bsd", qos: .userInitiated)

    var dataProvider: () -> CpuPayload = {
        SidecarStore.shared.snapshot()
    }

    func start() {
        queue.async { [weak self] in
            self?.startServer()
        }
    }

    func stop() {
        isRunning = false
        if serverSocket >= 0 {
            close(serverSocket)
            serverSocket = -1
        }
    }

    private func startServer() {
        // Create socket
        serverSocket = socket(AF_INET, SOCK_STREAM, 0)
        guard serverSocket >= 0 else {
            print("Sidecar BSD: Failed to create socket")
            return
        }

        // Set SO_REUSEADDR to avoid "Address already in use"
        var reuseAddr: Int32 = 1
        setsockopt(serverSocket, SOL_SOCKET, SO_REUSEADDR, &reuseAddr, socklen_t(MemoryLayout<Int32>.size))

        // Bind to port
        var addr = sockaddr_in()
        addr.sin_family = sa_family_t(AF_INET)
        addr.sin_port = port.bigEndian
        addr.sin_addr.s_addr = inet_addr("127.0.0.1")

        let bindResult = withUnsafePointer(to: &addr) {
            $0.withMemoryRebound(to: sockaddr.self, capacity: 1) {
                bind(serverSocket, $0, socklen_t(MemoryLayout<sockaddr_in>.size))
            }
        }

        guard bindResult == 0 else {
            print("Sidecar BSD: Failed to bind to port \(port)")
            close(serverSocket)
            return
        }

        // Listen
        guard listen(serverSocket, 5) == 0 else {
            print("Sidecar BSD: Failed to listen")
            close(serverSocket)
            return
        }

        print("CPU sidecar (BSD) listening on 127.0.0.1:\(port)")
        isRunning = true

        // Accept loop
        while isRunning {
            var clientAddr = sockaddr_in()
            var clientAddrLen = socklen_t(MemoryLayout<sockaddr_in>.size)

            let clientSocket = withUnsafeMutablePointer(to: &clientAddr) {
                $0.withMemoryRebound(to: sockaddr.self, capacity: 1) {
                    accept(serverSocket, $0, &clientAddrLen)
                }
            }

            guard clientSocket >= 0 else {
                if isRunning {
                    print("Sidecar BSD: Accept failed")
                }
                continue
            }

            // Handle client in background
            DispatchQueue.global(qos: .userInitiated).async { [weak self] in
                self?.handleClient(socket: clientSocket)
            }
        }
    }

    private func handleClient(socket: Int32) {
        defer {
            close(socket)
            print("Sidecar BSD: Client connection closed")
        }

        // Read request
        var buffer = [UInt8](repeating: 0, count: 4096)
        let bytesRead = recv(socket, &buffer, buffer.count, 0)
        print("Sidecar BSD: Received \(bytesRead) bytes")

        // Parse request method for CORS preflight
        let requestData = Data(bytes: buffer, count: max(0, bytesRead))
        let requestString = String(data: requestData, encoding: .utf8) ?? ""
        print("Sidecar BSD: Request snippet: \(requestString.prefix(100))")

        // Handle OPTIONS (CORS preflight)
        if requestString.uppercased().hasPrefix("OPTIONS") {
            let preflight = """
            HTTP/1.1 204 No Content\r
            Access-Control-Allow-Origin: *\r
            Access-Control-Allow-Methods: GET, OPTIONS\r
            Access-Control-Allow-Headers: *\r
            Content-Length: 0\r
            Connection: close\r
            \r

            """
            if let preflightData = preflight.data(using: .utf8) {
                preflightData.withUnsafeBytes { bufferPtr in
                    send(socket, bufferPtr.baseAddress!, preflightData.count, 0)
                }
                print("Sidecar BSD: Sent CORS preflight response")
            }
            return
        }

        // Generate response
        print("Sidecar BSD: Calling dataProvider()")
        let payload = dataProvider()
        print("Sidecar BSD: dataProvider() returned - totalUsage=\(payload.totalUsage), \(payload.perCoreUsage.count) cores, \(payload.topProcesses.count) processes")
        guard let bodyData = try? JSONEncoder().encode(payload) else {
            print("Sidecar BSD: Failed to encode payload")
            return
        }

        let bodyString = String(data: bodyData, encoding: .utf8) ?? ""
        print("Sidecar BSD: Sending payload: \(bodyString)")

        let headers = """
        HTTP/1.1 200 OK\r
        Content-Type: application/json\r
        Access-Control-Allow-Origin: *\r
        Access-Control-Allow-Methods: GET, OPTIONS\r
        Access-Control-Allow-Headers: *\r
        Content-Length: \(bodyData.count)\r
        Connection: close\r
        \r

        """

        guard let headerData = headers.data(using: .utf8) else {
            print("Sidecar BSD: Failed to create headers")
            return
        }

        // Combine headers + body
        var fullResponse = Data()
        fullResponse.append(headerData)
        fullResponse.append(bodyData)

        print("Sidecar BSD: Sending \(fullResponse.count) bytes (\(headerData.count) header + \(bodyData.count) body)")

        // Send response
        let bytesSent = fullResponse.withUnsafeBytes { bufferPtr in
            send(socket, bufferPtr.baseAddress!, fullResponse.count, 0)
        }

        if bytesSent == fullResponse.count {
            print("Sidecar BSD: Successfully sent all \(bytesSent) bytes")
        } else {
            print("Sidecar BSD: Warning - sent \(bytesSent) of \(fullResponse.count) bytes")
        }

        // Shutdown write side to signal EOF
        shutdown(socket, SHUT_WR)
        print("Sidecar BSD: Shutdown write side")

        // Small delay to let client read
        usleep(50_000) // 50ms
    }
}
