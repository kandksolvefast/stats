export interface ProcessInfo {
  pid: number;
  name: string;
  cpuUsage: number; // 0-100
  memoryUsage: number; // bytes
}

export interface CPUData {
  totalUsage: number; // 0-100
  perCoreUsage: number[]; // 0-100 per core
  systemLoad?: number; // optional until available
  userLoad?: number; // optional until available
  idleLoad?: number; // optional until available
  temperature?: number;
  frequency?: number; // MHz
  efficiencyUsage?: number;
  performanceUsage?: number;
  efficiencyFrequency?: number;
  performanceFrequency?: number;
  allCoresFrequency?: number;
  load1m?: number;
  load5m?: number;
  load15m?: number;
  uptimeSeconds?: number;
  physicalCores: number;
  logicalCores: number;
  topProcesses: ProcessInfo[];
  timestamp: string; // ISO string
}
