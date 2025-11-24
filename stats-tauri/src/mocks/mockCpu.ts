import { CPUData } from '@/types/cpu';

let tick = 0;

export function nextCpuMock(): CPUData {
  tick += 1;
  const base = 20 + 10 * Math.sin(tick / 5);
  const perCore = Array.from({ length: 8 }, (_, i) => base + i * 0.5 + Math.random() * 5);
  const total = perCore.reduce((a, b) => a + b, 0) / perCore.length;

  return {
    totalUsage: Math.min(100, Math.max(0, total)),
    perCoreUsage: perCore.map((v) => Math.min(100, Math.max(0, v))),
    systemLoad: undefined,
    userLoad: undefined,
    efficiencyUsage: undefined,
    performanceUsage: undefined,
    efficiencyFrequency: undefined,
    performanceFrequency: undefined,
    idleLoad: Math.max(0, 100 - total),
    temperature: 42 + Math.sin(tick / 8) * 3,
    frequency: 3200,
    load1m: total,
    load5m: total * 0.9,
    load15m: total * 0.8,
    uptimeSeconds: 4 * 24 * 3600 + tick * 5,
    physicalCores: 8,
    logicalCores: 8,
    topProcesses: [
      { pid: 1, name: 'Mocked', cpuUsage: 8, memoryUsage: 120_000_000 },
      { pid: 2, name: 'Renderer', cpuUsage: 6, memoryUsage: 80_000_000 }
    ],
    timestamp: new Date().toISOString()
  };
}
