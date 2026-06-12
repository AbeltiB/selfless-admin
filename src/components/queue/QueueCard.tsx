'use client';
import { QueueStatus } from 'selfless-sdk';
import type { Queue } from 'selfless-sdk';
import { cn, QUEUE_STATUS_COLORS, formatWait } from '@/lib/utils';
import { Users, Clock, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useQueueStore } from '@/store/queue.store';

interface QueueCardProps {
  queue: Queue;
  onCallNext?: (queueId: string) => void;
  onSelect?: (queue: Queue) => void;
  selected?: boolean;
}

export function QueueCard({ queue, onCallNext, onSelect, selected }: QueueCardProps) {
  const realtimeStat = useQueueStore((s) => s.stats[queue.id]);
  const q = queue as any;

  const waitingCount = realtimeStat?.waitingCount ?? q.waitingCount ?? 0;
  const servingCount = realtimeStat?.servingCount ?? q.servingCount ?? 0;
  const avgWait = realtimeStat?.avgWaitSeconds ?? q.avgWaitSeconds;
  const status = (realtimeStat?.status as QueueStatus) ?? queue.status;

  return (
    <div
      onClick={() => onSelect?.(queue)}
      className={cn(
        'bg-white rounded-xl border p-5 cursor-pointer transition-all',
        selected
          ? 'border-ct-900 ring-1 ring-ct-900'
          : 'border-ct-200 hover:border-ct-300 hover:shadow-sm',
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="min-w-0">
          <h3 className="font-semibold text-ct-900 text-sm truncate tracking-tight">
            {q.service?.name ?? 'Queue'}
          </h3>
          <p className="text-xs text-ct-400 mt-0.5">
            {queue.prefix} series · now #{queue.currentNumber}
          </p>
        </div>
        <span
          className={cn(
            'inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium shrink-0',
            QUEUE_STATUS_COLORS[status],
          )}
        >
          {status}
        </span>
      </div>

      <div className="grid grid-cols-3 divide-x divide-ct-100 rounded-lg bg-ct-50 py-3 mb-4">
        <div className="text-center px-2">
          <p className="text-xl font-semibold text-ct-900 tnum leading-none">{waitingCount}</p>
          <p className="text-[11px] text-ct-400 mt-1.5 flex items-center justify-center gap-1">
            <Users className="w-3 h-3" /> Waiting
          </p>
        </div>
        <div className="text-center px-2">
          <p className="text-xl font-semibold text-ct-900 tnum leading-none">{servingCount}</p>
          <p className="text-[11px] text-ct-400 mt-1.5 flex items-center justify-center gap-1">
            <PlayCircle className="w-3 h-3" /> Serving
          </p>
        </div>
        <div className="text-center px-2">
          <p className="text-xl font-semibold text-ct-900 tnum leading-none">
            {formatWait(avgWait)}
          </p>
          <p className="text-[11px] text-ct-400 mt-1.5 flex items-center justify-center gap-1">
            <Clock className="w-3 h-3" /> Avg wait
          </p>
        </div>
      </div>

      {status === QueueStatus.OPEN && onCallNext && (
        <Button
          size="sm"
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            onCallNext(queue.id);
          }}
        >
          Call Next
        </Button>
      )}
    </div>
  );
}
