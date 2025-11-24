import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import CPUDetail from '../CPUDetail';
import { CpuSnapshot } from '@/stores/cpuStore';

beforeAll(() => {
  // Minimal ResizeObserver to satisfy Recharts in tests
  (globalThis as any).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

vi.mock('recharts', async () => {
  const React = await import('react');
  const Stub = ({ children }: any) => <div>{children}</div>;
  return {
    ResponsiveContainer: Stub,
    AreaChart: () => <div data-testid="chart" />,
    Area: () => null,
    Tooltip: () => null,
    XAxis: () => null,
    YAxis: () => null
  };
});

describe('CPUDetail', () => {
  const sample: CpuSnapshot = {
    totalUsage: 45.5,
    perCoreUsage: [40, 50],
    idleLoad: 54.5,
    physicalCores: 2,
    logicalCores: 2,
    topProcesses: [
      { pid: 1, name: 'A', cpuUsage: 10, memoryUsage: 1000 },
      { pid: 2, name: 'B', cpuUsage: 5, memoryUsage: 500 }
    ],
    timestamp: Date.now(),
    systemLoad: undefined,
    userLoad: undefined,
    temperature: undefined,
    frequency: 3200
  };

  it('renders usage and top processes', () => {
    render(<CPUDetail data={sample} history={[sample]} />);

    expect(screen.getAllByText(/45\.5%/).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Top processes').length).toBeGreaterThan(0);
    expect(screen.getByText('A')).toBeTruthy();
  });
});
