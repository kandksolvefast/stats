import Foundation

struct CpuTopProcess: Codable {
    let pid: Int
    let name: String
    let cpuUsage: Double
    let memoryUsage: UInt64
}

struct CpuPayload: Codable {
    var temperature: Double?
    var totalUsage: Double
    var system: Double?
    var user: Double?
    var idle: Double?
    var efficiencyUsage: Double?
    var performanceUsage: Double?
    var efficiencyFrequencyMHz: UInt64?
    var performanceFrequencyMHz: UInt64?
    var allCoresFrequencyMHz: UInt64?
    var perCoreUsage: [Double]
    var load1m: Double?
    var load5m: Double?
    var load15m: Double?
    var uptimeSeconds: UInt64?
    var physicalCores: Int?
    var logicalCores: Int?
    var topProcesses: [CpuTopProcess]
}
