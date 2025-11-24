import { useMemo } from 'react';
import { useCpuStore } from './stores/cpuStore';
import { useSystemData } from './hooks/useSystemData';
import CPUDetail from './modules/CPU/CPUDetail';

export default function App() {
  const now = useMemo(() => new Date().toLocaleString(), []);
  useSystemData('cpu', 1000);
  const latest = useCpuStore((s) => s.latest);
  const history = useCpuStore((s) => s.history);

  return (
    <div className="min-h-screen bg-background-primary text-foreground-primary">
      <header className="border-b border-border-default bg-background-secondary/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cpu-500 to-cpu-700 shadow-glass" />
            <div>
              <p className="text-lg font-semibold">Stats (Tauri)</p>
              <p className="text-sm text-foreground-secondary">MVP scaffold — {now}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-foreground-secondary">
            <span>Design system: Tailwind tokens</span>
            <span className="h-1 w-1 rounded-full bg-success-bg" />
            <span>Ready for Phase 1</span>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
        <CPUDetail data={latest} history={history} />
      </main>
    </div>
  );
}
