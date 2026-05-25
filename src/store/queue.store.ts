import { create } from 'zustand';

interface QueueStat {
  queueId: string;
  branchId: string;
  serviceId: string;
  serviceName: string;
  status: string;
  waitingCount: number;
  servingCount: number;
  completedCount: number;
  avgWaitSeconds: number;
  currentNumber?: number;
}

interface QueueState {
  stats: Record<string, QueueStat>;
  lastUpdate: Date | null;
  updateStats: (stat: QueueStat) => void;
}

export const useQueueStore = create<QueueState>((set) => ({
  stats: {},
  lastUpdate: null,
  updateStats: (stat) =>
    set((state) => ({
      stats: { ...state.stats, [stat.queueId]: stat },
      lastUpdate: new Date(),
    })),
}));
