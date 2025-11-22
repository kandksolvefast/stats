import { useMemo } from 'react';
import { CpuPlaceholder } from './modules/CPU/CpuPlaceholder';
import { CPUWidget } from './modules/CPU/CPUWidget';
import { useCpuStore } from './stores/cpuStore';
import { Panel } from './components/Panel';

export default function App() {
  const now = useMemo(() => new Date().toLocaleString(), []);
  const latest = useCpuStore((s) => s.latest);

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
        <div className="grid gap-6 lg:grid-cols-3">
          <Panel title="CPU Module" subtitle="End-to-end MVP target" accent="cpu">
            <CPUWidget data={latest} />
          </Panel>
          <Panel title="Project State" subtitle="Zustand + events" accent="network">
            <p className="text-sm text-foreground-secondary">
              Wiring ready for hooks/stores; connect Tauri events to Zustand stores per module.
            </p>
          </Panel>
          <Panel title="Next Steps" subtitle="See docs/status.md" accent="disk">
            <ul className="list-disc space-y-1 pl-4 text-sm text-foreground-secondary">
              <li>Initialize Tauri commands & event streaming</li>
              <li>Implement CPU reader and tests</li>
              <li>Hook React widgets to stores</li>
            </ul>
          </Panel>
        </div>
      </main>
    </div>
  );
}
