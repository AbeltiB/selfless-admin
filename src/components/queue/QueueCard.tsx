'use client';
import { QueueStatus } from 'selfless-sdk';
import type { Queue } from 'selfless-sdk';
import { cn, QUEUE_STATUS_COLORS, formatWait } from '@/lib/utils';
import { Users, CheckCircle, Clock, PlayCircle } from 'lucide-react';
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

  const waitingCount = realtimeStat?.waitingCount ?? queue.waitingCount ?? 0;
  const servingCount = realtimeStat?.servingCount ?? queue.servingCount ?? 0;
  const avgWait = realtimeStat?.avgWaitSeconds ?? queue.avgWaitSeconds;
  const status = (realtimeStat?.status as QueueStatus) ?? queue.status;

  return (
    <div
      onClick={() => onSelect?.(queue)}
      className={cn(
        'bg-white rounded-xl border-2 p-5 cursor-pointer transition-all hover:shadow-md',
        selected ? 'border-blue-500 shadow-md' : 'border-slate-200',
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">
            {queue.service?.name ?? 'Queue'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">{queue.prefix} series</p>
        </div>
        <span
          className={cn(
            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
            QUEUE_STATUS_COLORS[status],
          )}
        >
          {status}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
            <Users className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{waitingCount}</p>
          <p className="text-xs text-slate-500">Waiting</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
            <PlayCircle className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{servingCount}</p>
          <p className="text-xs text-slate-500">Serving</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-amber-600 mb-1">
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-sm font-bold text-slate-800">{formatWait(avgWait)}</p>
          <p className="text-xs text-slate-500">Avg Wait</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
          <span>Current #{queue.currentNumber}</span>
        </div>
        {status === QueueStatus.OPEN && onCallNext && (
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onCallNext(queue.id);
            }}
          >
            Call Next
          </Button>
        )}
      </div>
    </div>
  );
}
