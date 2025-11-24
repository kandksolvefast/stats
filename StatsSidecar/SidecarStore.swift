import Foundation
import Kit
#if canImport(CPU)
import CPU
#endif

final class SidecarStore {
    static let shared = SidecarStore()
    private let lock = NSLock()
    private let instanceID = UUID()
    private var payload = CpuPayload(
        temperature: nil,
        totalUsage: 0,
        system: nil,
        user: nil,
        idle: nil,
        efficiencyUsage: nil,
        performanceUsage: nil,
        efficiencyFrequencyMHz: nil,
        performanceFrequencyMHz: nil,
        allCoresFrequencyMHz: nil,
        perCoreUsage: [],
        load1m: nil,
        load5m: nil,
        load15m: nil,
        uptimeSeconds: nil,
        physicalCores: nil,
        logicalCores: nil,
        topProcesses: []
    )

    func snapshot() -> CpuPayload {
        lock.lock(); defer { lock.unlock() }
        return payload
    }

    func update(load: CPU_Load) {
        lock.lock(); defer { lock.unlock() }
        payload.totalUsage = load.totalUsage * 100
        payload.system = load.systemLoad * 100
        payload.user = load.userLoad * 100
        payload.idle = load.idleLoad * 100
        payload.efficiencyUsage = load.usageECores.map { $0 * 100 }
        payload.performanceUsage = load.usagePCores.map { $0 * 100 }
        payload.perCoreUsage = load.usagePerCore.map { $0 * 100 }
        if let phys = SystemKit.shared.device.info.cpu?.physicalCores {
            payload.physicalCores = Int(phys)
        }
        if let logical = SystemKit.shared.device.info.cpu?.logicalCores {
            payload.logicalCores = Int(logical)
        }
        if let boot = SystemKit.shared.device.bootDate {
            payload.uptimeSeconds = UInt64(Date().timeIntervalSince(boot))
        }
    }

    func update(avg: CPU_AverageLoad) {
        lock.lock(); defer { lock.unlock() }
        payload.load1m = avg.load1
        payload.load5m = avg.load5
        payload.load15m = avg.load15
    }

    func update(temp: Double?) {
        lock.lock(); defer { lock.unlock() }
        payload.temperature = temp
    }

    func update(freq: CPU_Frequency) {
        lock.lock(); defer { lock.unlock() }
        payload.efficiencyFrequencyMHz = UInt64(freq.eCore)
        payload.performanceFrequencyMHz = UInt64(freq.pCore)
        payload.allCoresFrequencyMHz = UInt64(freq.value)
    }

    func update(processes: [TopProcess]) {
        lock.lock(); defer { lock.unlock() }
        let mapped = processes.map { CpuTopProcess(pid: $0.pid, name: $0.name, cpuUsage: $0.usage, memoryUsage: 0) }
        payload.topProcesses = mapped
    }
}
