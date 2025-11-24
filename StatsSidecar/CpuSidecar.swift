import Foundation
import Network

final class CpuSidecar {
    private var listener: NWListener?
    private let queue = DispatchQueue(label: "cpu-sidecar")
    private let port: NWEndpoint.Port = 8973

    // Populated by SidecarStore (updated from CPU module callbacks)
    var dataProvider: () -> CpuPayload = {
        SidecarStore.shared.snapshot()
    }

    func start() {
        do {
            listener = try NWListener(using: .tcp, on: port)
        } catch {
            print("Sidecar listener error: \(error)")
            return
        }

        listener?.newConnectionHandler = { [weak self] connection in
            self?.prepare(connection: connection)
        }
        listener?.start(queue: queue)
        print("CPU sidecar listening on 127.0.0.1:\(port)")
    }

    private func prepare(connection: NWConnection) {
        connection.stateUpdateHandler = { [weak self, weak connection] state in
            guard let connection = connection else { return }
            print("Sidecar connection state: \(state)")
            switch state {
            case .ready:
                print("Sidecar connection ready, sending response")
                self?.sendResponse(on: connection)
            case .failed(let error):
                print("Sidecar connection failed: \(error)")
                connection.cancel()
            case .cancelled:
                print("Sidecar connection cancelled (state handler)")
                // Don't call cancel() again - already cancelled
            default:
                break
            }
        }
        connection.start(queue: queue)
        print("Sidecar connection started")
    }

    private func sendResponse(on connection: NWConnection) {
        print("Sidecar sendResponse called")

        // Read the incoming request (headers not parsed; just consume) then reply.
        connection.receive(minimumIncompleteLength: 0, maximumLength: 4096) { [weak self] data, context, isComplete, error in
            if let error = error {
                print("Sidecar connection receive error: \(error)")
                connection.cancel()
                return
            }
            let received = data?.count ?? 0
            let requestString = data.flatMap { String(data: $0, encoding: .utf8) } ?? ""
            print("Sidecar received \(received) bytes, complete=\(isComplete), context=\(String(describing: context))")
            print("Sidecar request snippet: \(requestString.prefix(100))")
            guard let self = self else {
                print("Sidecar self deallocated")
                return
            }

            // CORS preflight
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
                    connection.send(content: preflightData, isComplete: true, completion: .contentProcessed { _ in
                        print("Sidecar sent CORS preflight response")
                    })
                }
                return
            }

            let payload = self.dataProvider()
            guard let bodyData = try? JSONEncoder().encode(payload) else {
                print("Sidecar failed to encode payload")
                connection.cancel()
                return
            }
            let bodyString = String(data: bodyData, encoding: .utf8) ?? ""
            print("Sidecar payload to send: \(bodyString)")

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
                print("Sidecar failed to create header data")
                connection.cancel()
                return
            }

            // Combine headers + body into single response
            var fullResponse = Data()
            fullResponse.append(headerData)
            fullResponse.append(bodyData)

            print("Sidecar assembled response: \(headerData.count) header + \(bodyData.count) body = \(fullResponse.count) total bytes")
            print("Sidecar full response hex (first 200 bytes): \(fullResponse.prefix(200).map { String(format: "%02x", $0) }.joined())")

            // Send entire response in one shot
            print("Sidecar calling send() with isComplete=false")
            connection.send(content: fullResponse, isComplete: false, completion: .contentProcessed { sendError in
                if let sendError = sendError {
                    print("Sidecar send error: \(sendError)")
                    connection.cancel()
                    return
                }
                print("Sidecar send() completed, now sending EOF")

                // Now signal EOF
                connection.send(content: nil, isComplete: true, completion: .contentProcessed { eofError in
                    if let eofError = eofError {
                        print("Sidecar EOF send error: \(eofError)")
                    } else {
                        print("Sidecar EOF sent successfully")
                    }
                    // Let NWConnection handle connection cleanup - DO NOT call cancel()
                    print("Sidecar response complete, waiting for natural connection close")
                })
            })
        }
    }
}
