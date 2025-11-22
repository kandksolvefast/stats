import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSystemData } from '../useSystemData';
import { useCpuStore } from '@/stores/cpuStore';

vi.mock('@/mocks/mockCpu', () => {
  const data = {
    totalUsage: 25,
    perCoreUsage: [10, 20],
    systemLoad: undefined,
    userLoad: undefined,
    idleLoad: 75,
    temperature: undefined,
    frequency: 3200,
    physicalCores: 2,
    logicalCores: 2,
    topProcesses: [],
    timestamp: new Date().toISOString()
  };
  return {
    nextCpuMock: vi.fn(() => data)
  };
});

describe('useSystemData (mock mode)', () => {
  beforeEach(() => {
    useCpuStore.setState({ latest: undefined, history: [] });
    // Ensure Tauri bridge is absent
    // @ts-expect-error
    delete (globalThis as any).__TAURI__;
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('populates store with mock data when Tauri is unavailable', async () => {
    const { result, unmount } = renderHook(() => useSystemData('cpu', 10));

    await act(async () => {
      vi.advanceTimersByTime(20);
    });

    const state = useCpuStore.getState();
    expect(state.latest).toBeDefined();
    expect(state.latest?.perCoreUsage.length).toBeGreaterThan(0);

    unmount();
  });
});
