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
  idleLoad: number;
  temperature?: number;
  frequency?: number; // MHz
  physicalCores: number;
  logicalCores: number;
  topProcesses: ProcessInfo[];
  timestamp: string; // ISO string
}
