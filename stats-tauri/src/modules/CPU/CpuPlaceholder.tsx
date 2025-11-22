import { useMemo } from 'react';
import { useCpuStore } from '@/stores/cpuStore';
import { useSystemData } from '@/hooks/useSystemData';

export function CpuPlaceholder() {
  useSystemData('cpu', 1000);
  const { latest, history } = useCpuStore((s) => ({ latest: s.latest, history: s.history }));

  const average = useMemo(() => {
    if (!history.length) return 0;
    const sum = history.reduce((acc, point) => acc + point.totalUsage, 0);
    return Math.round((sum / history.length) * 10) / 10;
  }, [history]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-md border border-border-subtle bg-background-tertiary/70 p-3">
        <div>
          <p className="text-sm text-foreground-secondary">Overall Usage</p>
          <p className="text-2xl font-semibold text-cpu-500">
            {latest ? `${latest.totalUsage.toFixed(1)}%` : '--%'}
          </p>
        </div>
        <div className="text-right text-xs text-foreground-secondary">
          <p>Avg: {average ? `${average}%` : '--'}</p>
          <p>Cores: {latest?.logicalCores ?? '--'}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm text-foreground-secondary">
        <div className="rounded-md border border-border-subtle bg-background-tertiary/70 p-3">
          <p className="text-foreground-primary">Per-core</p>
          <p className="text-xs">
            {latest ? `${latest.perCoreUsage.length} cores sampled` : 'Awaiting data'}
          </p>
        </div>
        <div className="rounded-md border border-border-subtle bg-background-tertiary/70 p-3">
          <p className="text-foreground-primary">Top processes</p>
          <p className="text-xs">
            {latest?.topProcesses?.length ? `${latest.topProcesses.length} tracked` : 'Awaiting data'}
          </p>
        </div>
      </div>
    </div>
  );
}
