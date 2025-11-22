import { describe, it, expect, beforeEach } from 'vitest';
import { useCpuStore } from '../cpuStore';

describe('cpuStore', () => {
  beforeEach(() => {
    useCpuStore.setState({ latest: undefined, history: [] });
  });

  it('stores latest snapshot and caps history to 60 items', () => {
    const set = useCpuStore.getState().setSnapshot;

    for (let i = 0; i < 65; i++) {
      set({
        totalUsage: i,
        perCoreUsage: [i],
        idleLoad: 100 - i,
        physicalCores: 1,
        logicalCores: 1,
        topProcesses: [],
        timestamp: Date.now(),
        systemLoad: undefined,
        userLoad: undefined,
        temperature: undefined,
        frequency: undefined
      });
    }

    const state = useCpuStore.getState();
    expect(state.latest?.totalUsage).toBe(64);
    expect(state.history.length).toBeLessThanOrEqual(60);
  });
});
