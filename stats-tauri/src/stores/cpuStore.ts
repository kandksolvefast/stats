import { create } from 'zustand';
import { CPUData } from '@/types/cpu';

export type CpuSnapshot = Omit<CPUData, 'timestamp'> & { timestamp: number };

type CpuState = {
  latest?: CpuSnapshot;
  history: CpuSnapshot[];
  setSnapshot: (payload: CpuSnapshot) => void;
};

export const useCpuStore = create<CpuState>((set) => ({
  history: [],
  setSnapshot: (payload) =>
    set((state) => ({
      latest: payload,
      history: [...state.history.slice(-59), payload]
    }))
}));
