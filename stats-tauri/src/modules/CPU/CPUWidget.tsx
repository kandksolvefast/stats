import { CpuSnapshot } from '@/stores/cpuStore';
import { CPUData } from '@/types/cpu';
import { useMemo } from 'react';

type Props = {
  data?: CpuSnapshot | CPUData;
};

export function CPUWidget({ data }: Props) {
  const coreSummary = useMemo(() => {
    if (!data?.perCoreUsage?.length) return { count: 0, avg: 0 };
    const count = data.perCoreUsage.length;
    const avg = data.perCoreUsage.reduce((a, b) => a + b, 0) / count;
    return { count, avg: Number(avg.toFixed(1)) };
  }, [data]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-md border border-border-subtle bg-background-tertiary/70 p-3">
        <div>
          <p className="text-sm text-foreground-secondary">Overall Usage</p>
          <p className="text-3xl font-semibold text-cpu-500">
            {data ? `${data.totalUsage.toFixed(1)}%` : '--%'}
          </p>
        </div>
        <div className="text-right text-xs text-foreground-secondary">
          <p>Avg: {data ? `${coreSummary.avg}%` : '--'}</p>
          <p>Cores: {data ? coreSummary.count : '--'}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm text-foreground-secondary">
        <div className="rounded-md border border-border-subtle bg-background-tertiary/70 p-3">
          <p className="text-foreground-primary">Per-core</p>
          <p className="text-xs">
            {data?.perCoreUsage?.length ? `${data.perCoreUsage.length} cores sampled` : 'Awaiting data'}
          </p>
        </div>
        <div className="rounded-md border border-border-subtle bg-background-tertiary/70 p-3">
          <p className="text-foreground-primary">Top processes</p>
          <p className="text-xs">
            {data?.topProcesses?.length ? `${data.topProcesses.length} tracked` : 'Awaiting data'}
          </p>
        </div>
      </div>
    </div>
  );
}
