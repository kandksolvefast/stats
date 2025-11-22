import { useEffect } from 'react';
import { useCpuStore, CpuSnapshot } from '@/stores/cpuStore';
import { CPUData } from '@/types/cpu';
import { nextCpuMock } from '@/mocks/mockCpu';

/**
 * Placeholder hook for subscribing to Tauri events per module.
 * Wire this to `invoke` + `listen` in Phase 1 CPU implementation.
 */
export function useSystemData(module: string, intervalMs = 1000) {
  const setCpu = useCpuStore((s) => s.setSnapshot);

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    let mockTimer: number | undefined;

    const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;

    async function start() {
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
