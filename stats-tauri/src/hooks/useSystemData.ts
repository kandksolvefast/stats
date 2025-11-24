import { useEffect } from 'react';
import { useCpuStore, CpuSnapshot } from '@/stores/cpuStore';
import { CPUData } from '@/types/cpu';
import { nextCpuMock } from '@/mocks/mockCpu';

const SIDECAR_URL =
  (import.meta as any).env?.VITE_CPU_SIDECAR_URL || 'http://127.0.0.1:8973/cpu';

function mapSidecarPayload(payload: any): CpuSnapshot {
  const now = Date.now();
  const totalUsage = payload.totalUsage != null ? Number(payload.totalUsage) : 0;

  // Keep as undefined if not provided by sidecar
  const systemLoad =
    payload.system != null ? Number(payload.system) :
    payload.systemLoad != null ? Number(payload.systemLoad) :
    undefined;
  const userLoad =
    payload.user != null ? Number(payload.user) :
    payload.userLoad != null ? Number(payload.userLoad) :
    undefined;
  const idleLoad =
    payload.idle != null ? Number(payload.idle) :
    payload.idleLoad != null ? Number(payload.idleLoad) :
    undefined;

  const efficiencyUsage = payload.efficiencyUsage ?? payload.usageECores ?? undefined;
  const performanceUsage = payload.performanceUsage ?? payload.usagePCores ?? undefined;
  const allCoresFrequency =
    payload.allCoresFrequencyMHz ??
    payload.frequency ??
    payload.allFrequency ??
    payload.frequencyMHz ??
    undefined;
  const efficiencyFrequency = payload.efficiencyFrequencyMHz ?? payload.efficiencyFrequency ?? undefined;
  const performanceFrequency = payload.performanceFrequencyMHz ?? payload.performanceFrequency ?? undefined;

  return {
    totalUsage,
    perCoreUsage: payload.perCoreUsage ?? [],
    systemLoad,
    userLoad,
    idleLoad,
    temperature: payload.temperature ?? undefined,
    frequency: allCoresFrequency,
    allCoresFrequency,
    efficiencyUsage,
    performanceUsage,
    efficiencyFrequency,
    performanceFrequency,
    load1m: payload.load1m ?? undefined,
    load5m: payload.load5m ?? undefined,
    load15m: payload.load15m ?? undefined,
    uptimeSeconds: payload.uptimeSeconds ?? undefined,
    physicalCores: payload.physicalCores ?? payload.physical ?? 0,
    logicalCores: payload.logicalCores ?? payload.logical ?? 0,
    topProcesses: payload.topProcesses ?? [],
    timestamp: now
  };
}

/**
 * Placeholder hook for subscribing to Tauri events per module.
 * Wire this to `invoke` + `listen` in Phase 1 CPU implementation.
 */
export function useSystemData(module: string, intervalMs = 1000) {
  const setCpu = useCpuStore((s) => s.setSnapshot);

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    let mockTimer: number | undefined;
    let sidecarTimer: number | undefined;
    let usingSidecar = false;

    const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;

    async function start() {
      // Try sidecar first
      try {
        const res = await fetch(SIDECAR_URL, { cache: 'no-cache' });
        if (res.ok) {
          const json = await res.json();
          const snapshot = mapSidecarPayload(json);
          setCpu(snapshot);
          usingSidecar = true;
          sidecarTimer = window.setInterval(async () => {
            try {
              const r = await fetch(SIDECAR_URL, { cache: 'no-cache' });
              if (!r.ok) return;
              const j = await r.json();
              const snap = mapSidecarPayload(j);
              setCpu(snap);
            } catch {
              // ignore
            }
          }, intervalMs);
          return;
        }
      } catch {
        // ignore and fallback
      }

      if (!isTauri) {
        // Browser-only mock data
        mockTimer = window.setInterval(() => {
          const data = nextCpuMock();
          const { timestamp, ...rest } = data;
          const snapshot: CpuSnapshot = {
            ...rest,
            timestamp: new Date(timestamp).getTime()
          };
          setCpu(snapshot);
        }, intervalMs);
        return;
      }

      try {
        const { invoke } = await import('@tauri-apps/api/tauri');
        const { listen } = await import('@tauri-apps/api/event');
        await invoke('start_monitoring', { module, interval: intervalMs });
        unlisten = await listen<CPUData>('cpu_update', (event) => {
          const { timestamp, ...rest }: CPUData = event.payload;
          const snapshot: CpuSnapshot = {
            ...rest,
            timestamp: new Date(timestamp).getTime()
          };
          setCpu(snapshot);
        });
      } catch (err) {
        console.error(`[useSystemData] Failed to start monitoring ${module}`, err);
      }
    }

    start();

    return () => {
      if (unlisten) {
        unlisten();
      }
      if (mockTimer) {
        clearInterval(mockTimer);
      }
      if (sidecarTimer) {
        clearInterval(sidecarTimer);
      }
      if (isTauri) {
        import('@tauri-apps/api/tauri').then(({ invoke }) =>
          invoke('stop_monitoring', { module }).catch((err) =>
            console.error(`[useSystemData] Failed to stop monitoring ${module}`, err)
          )
        );
      }
    };
  }, [module, intervalMs, setCpu]);
}
