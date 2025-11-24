import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { CpuSnapshot } from '@/stores/cpuStore';

type Props = {
  data?: CpuSnapshot;
  history: CpuSnapshot[];
};

function formatMaybe(value: number | undefined | null, suffix = '', digits = 1) {
  if (value === undefined || value === null || Number.isNaN(value)) return 'N/A';
  return `${value.toFixed(digits)}${suffix}`;
}

const ringSizes = {
  outer: 140,
  outerLarge: 180,
  outerSmall: 120,
  thickness: 12,
  thicknessLarge: 14,
  thicknessSmall: 10
};

function IconButton({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle bg-background-tertiary/80 text-foreground-secondary transition hover:border-border-default hover:text-foreground-primary"
      aria-label={label}
    >
      {children}
    </button>
  );
}

function colorForTemp(temp?: number | null) {
  if (temp === undefined || temp === null || Number.isNaN(temp)) return '#4b5563';
  if (temp < 55) return '#22c55e';
  if (temp < 75) return '#eab308';
  return '#ef4444';
}

function colorForCoreUsage(usage: number): string {
  if (usage < 10) return '#10b981'; // green - low usage
  if (usage < 30) return '#3b82f6'; // blue - moderate
  if (usage < 60) return '#eab308'; // yellow - high
  if (usage < 85) return '#f97316'; // orange - very high
  return '#ef4444'; // red - critical
}

function CircularGauge({
  label,
  value,
  unit,
  forceColor,
  digits = 0,
  size = 'normal',
  maxValue = 100
}: {
  label: string;
  value?: number | null;
  unit?: string;
  forceColor?: string;
  digits?: number;
  size?: 'small' | 'normal' | 'large';
  maxValue?: number;
}) {
  const hasValue = value !== undefined && value !== null && !Number.isNaN(value);
  const pct = hasValue ? Math.min(100, Math.max(0, ((value as number) / maxValue) * 100)) : 0;
  const accentColor = forceColor ?? '#3b82f6';

  const outerSize = size === 'large' ? ringSizes.outerLarge : size === 'small' ? ringSizes.outerSmall : ringSizes.outer;
  const thickness = size === 'large' ? ringSizes.thicknessLarge : size === 'small' ? ringSizes.thicknessSmall : ringSizes.thickness;
  const fontSize = size === 'large' ? 'text-4xl' : size === 'small' ? 'text-2xl' : 'text-3xl';

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative flex items-center justify-center rounded-full"
        style={{
          width: outerSize,
          height: outerSize,
          filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15))'
        }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(
              from 0deg,
              ${accentColor} 0%,
              ${accentColor} ${pct}%,
              rgba(255,255,255,0.08) ${pct}%
            )`,
            padding: thickness / 2,
            boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div
            className="h-full w-full rounded-full"
            style={{
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
            }}
          />
        </div>
        <div className={`relative z-10 ${fontSize} font-semibold text-foreground-primary`}>
          {hasValue ? `${value?.toFixed(digits)}${unit ?? ''}` : 'N/A'}
        </div>
      </div>
      <p className="text-sm text-foreground-secondary">{label}</p>
    </div>
  );
}

function DualSegmentGauge({
  label,
  totalValue,
  systemValue,
  userValue,
  unit,
  digits = 0
}: {
  label: string;
  totalValue?: number | null;
  systemValue?: number | null;
  userValue?: number | null;
  unit?: string;
  digits?: number;
}) {
  const hasValue = totalValue !== undefined && totalValue !== null && !Number.isNaN(totalValue);
  const systemPct = systemValue != null ? Math.min(100, Math.max(0, systemValue)) : 0;
  const userPct = userValue != null ? Math.min(100, Math.max(0, userValue)) : 0;

  const outerSize = ringSizes.outerLarge;
  const thickness = ringSizes.thicknessLarge;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative flex items-center justify-center rounded-full"
        style={{
          width: outerSize,
          height: outerSize,
          filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15))'
        }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(
              #ef4444 0%,
              #ef4444 ${systemPct}%,
              #3b82f6 ${systemPct}%,
              #3b82f6 ${systemPct + userPct}%,
              rgba(255,255,255,0.1) ${systemPct + userPct}%
            )`,
            padding: thickness / 2,
            boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div
            className="h-full w-full rounded-full"
            style={{
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
            }}
          />
        </div>
        <div className="relative z-10 text-4xl font-semibold text-foreground-primary">
          {hasValue ? `${totalValue?.toFixed(digits)}${unit ?? ''}` : 'N/A'}
        </div>
      </div>
      <p className="text-sm text-foreground-secondary">{label}</p>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded px-1.5 py-1 text-xs transition-colors hover:bg-background-tertiary/30">
      <span className="text-foreground-secondary">{label}</span>
      <span className="font-semibold text-foreground-primary">{value}</span>
    </div>
  );
}

function LegendChip({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-border-subtle bg-background-primary/60 px-2 py-0.5">
      <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-[11px] text-foreground-secondary">{label}</span>
    </div>
  );
}

function formatDuration(seconds: number | undefined | null): string {
  if (seconds === undefined || seconds === null) return 'N/A';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  if (d > 0) return `${d}d ${h}h`;
  return `${h}h`;
}

function TopProcesses({ processes }: { processes: Array<{ name: string; cpuUsage: number; pid: number }> }) {
  return (
    <div className="space-y-1.5 rounded-lg border border-border-subtle bg-background-primary/70 p-3">
      <h4 className="text-sm font-semibold text-foreground-primary">
        Top processes <span className="text-xs font-normal text-foreground-secondary">({processes.length} tracked)</span>
      </h4>
      <div className="space-y-0.5">
        {processes.slice(0, 8).map((p) => (
          <div key={p.pid} className="flex items-center justify-between gap-3 rounded px-2 py-0.5 text-xs hover:bg-background-tertiary/50">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-foreground-secondary">□</span>
              <span className="truncate text-foreground-primary">{p.name}</span>
            </div>
            <span className="shrink-0 font-semibold text-foreground-primary">{p.cpuUsage.toFixed(1)}%</span>
          </div>
        ))}
        {!processes.length && <p className="text-xs text-foreground-secondary">No process data yet</p>}
      </div>
    </div>
  );
}

export default function CPUDetail({ data, history }: Props) {
  const derived = useMemo(() => {
    const now = Date.now();
    const lastTs = data?.timestamp ?? 0;
    const elapsed = Math.max(0, (now - lastTs) / 1000);

    const lastUpdated =
      elapsed < 5
        ? 'Just now'
        : elapsed < 60
        ? `${Math.floor(elapsed)}s ago`
        : `${Math.floor(elapsed / 60)}m ago`;

    const historyPoints = history.map((h, idx) => ({
      idx,
      usage: Math.min(100, Math.max(0, h.totalUsage ?? 0))
    }));

    return {
      lastUpdated,
      historyPoints
    };
  }, [data, history]);

  const lastUpdated = derived.lastUpdated;

  return (
    <div className="space-y-3 rounded-2xl border border-border-default bg-gradient-to-br from-background-secondary to-background-primary/80 p-5 shadow-xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-foreground-primary">CPU</h2>
          <span className="rounded-full border border-border-subtle px-2 py-0.5 text-xs text-foreground-secondary">
            Live
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-foreground-secondary">Updated {lastUpdated}</span>
          <IconButton label="Chart view">
            <span className="text-lg">📈</span>
          </IconButton>
          <IconButton label="Settings">
            <span className="text-lg">⚙️</span>
          </IconButton>
        </div>
      </div>

      {/* Three circular gauges at top */}
      <div className="flex items-center justify-center gap-6 rounded-xl border border-border-subtle bg-background-tertiary/70 p-4">
        <CircularGauge
          label="🌡️ Temperature"
          value={data?.temperature}
          unit="°C"
          forceColor={colorForTemp(data?.temperature)}
          digits={0}
          size="small"
        />
        <DualSegmentGauge
          label="CPU Usage"
          totalValue={data?.totalUsage}
          systemValue={data?.systemLoad}
          userValue={data?.userLoad}
          unit="%"
          digits={1}
        />
        <CircularGauge label="1m Load" value={data?.load1m} digits={2} forceColor="#6366f1" size="small" maxValue={5} />
      </div>

      {/* Usage history chart */}
      <div className="space-y-2 rounded-xl border border-border-subtle bg-background-tertiary/70 p-4">
        <div className="flex items-center justify-between text-sm font-semibold text-foreground-primary">
          <span>Usage history</span>
          <span className="text-xs text-foreground-secondary">{derived.historyPoints.length} samples</span>
        </div>
        <div className="h-28 w-full overflow-hidden rounded-lg border border-border-subtle bg-background-primary/60">
          <ResponsiveContainer>
            <AreaChart data={derived.historyPoints}>
              <defs>
                <linearGradient id="cpuHistory" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis dataKey="idx" hide />
              <YAxis hide domain={[0, 100]} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)' }}
                labelStyle={{ color: '#9ca3af' }}
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Usage']}
              />
              <Area
                type="monotone"
                dataKey="usage"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#cpuHistory)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Per-core usage - compact bars */}
      <div className="space-y-2 rounded-xl border border-border-subtle bg-background-tertiary/70 p-4">
        <h4 className="text-sm font-semibold text-foreground-primary">Per-core usage</h4>
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${data?.perCoreUsage?.length || 14}, minmax(0, 1fr))`
          }}
        >
          {(data?.perCoreUsage ?? []).map((core, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1">
              <div className="h-16 w-full rounded-sm bg-border-subtle" style={{ overflow: 'hidden' }}>
                <div
                  className="w-full transition-all"
                  style={{
                    height: `${Math.min(100, core)}%`,
                    marginTop: 'auto',
                    backgroundColor: colorForCoreUsage(core)
                  }}
                />
              </div>
              <span className="text-[10px] text-foreground-secondary">C{idx + 1}</span>
              <span className="text-[10px] font-semibold text-foreground-primary">{core.toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Details section - more compact */}
      <div key={`details-${data?.timestamp}`} className="space-y-2 rounded-xl border border-border-subtle bg-background-tertiary/70 p-3">
        <h3 className="text-sm font-semibold text-foreground-primary">Details</h3>

        <div className="flex flex-wrap gap-1.5">
          <LegendChip color="#ef4444" label="System" />
          <LegendChip color="#3b82f6" label="User" />
          <LegendChip color="#9ca3af" label="Idle" />
          <LegendChip color="#22d3ee" label="Efficiency" />
          <LegendChip color="#6366f1" label="Performance" />
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <StatRow
            label="System"
            value={data?.systemLoad != null ? `${data.systemLoad.toFixed(1)}%` : 'N/A'}
          />
          <StatRow
            label="User"
            value={data?.userLoad != null ? `${data.userLoad.toFixed(1)}%` : 'N/A'}
          />
          <StatRow label="Idle" value={data?.idleLoad != null ? `${data.idleLoad.toFixed(1)}%` : 'N/A'} />
          <StatRow
            label="Efficiency cores"
            value={data?.efficiencyUsage != null ? `${data.efficiencyUsage.toFixed(1)}%` : 'N/A'}
          />
          <StatRow
            label="Performance cores"
            value={data?.performanceUsage != null ? `${data.performanceUsage.toFixed(1)}%` : 'N/A'}
          />
          <StatRow
            label="Cores"
            value={data ? `${data.logicalCores}L / ${data.physicalCores}P` : '—'}
          />
          <StatRow label="Uptime" value={formatDuration(data?.uptimeSeconds)} />
        </div>
      </div>

      {/* Average load & Frequency side by side */}
      <div key={`load-freq-${data?.timestamp}`} className="grid gap-2.5 sm:grid-cols-2">
        <div className="space-y-1.5 rounded-lg border border-border-subtle bg-background-primary/70 p-3">
          <h4 className="text-sm font-semibold text-foreground-primary">Average load</h4>
          <div className="space-y-0.5">
            <StatRow label="1 min" value={data?.load1m != null ? data.load1m.toFixed(2) : 'N/A'} />
            <StatRow label="5 min" value={data?.load5m != null ? data.load5m.toFixed(2) : 'N/A'} />
            <StatRow label="15 min" value={data?.load15m != null ? data.load15m.toFixed(2) : 'N/A'} />
          </div>
        </div>

        <div className="space-y-1.5 rounded-lg border border-border-subtle bg-background-primary/70 p-3">
          <h4 className="text-sm font-semibold text-foreground-primary">Frequency</h4>
          <div className="space-y-0.5">
            <StatRow
              label="All cores"
              value={data?.allCoresFrequency ? `${data.allCoresFrequency} MHz` : 'N/A'}
            />
            <StatRow
              label="Efficiency"
              value={data?.efficiencyFrequency ? `${data.efficiencyFrequency} MHz` : 'N/A'}
            />
            <StatRow
              label="Performance"
              value={data?.performanceFrequency ? `${data.performanceFrequency} MHz` : 'N/A'}
            />
          </div>
        </div>
      </div>

      {/* Top processes */}
      <TopProcesses key={`processes-${data?.timestamp}`} processes={data?.topProcesses ?? []} />
    </div>
  );
}
