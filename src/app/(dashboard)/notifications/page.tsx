'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { formatDate, cn } from '@/lib/utils';
import { NotificationChannel } from 'selfless-sdk';
import { Bell, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

interface Notification {
  id: string;
  channel: NotificationChannel;
  recipientId: string | null;
  subject: string | null;
  body: string;
  status: string;
  metadata: Record<string, unknown> | null;
  sentAt: string | null;
  error: string | null;
  createdAt: string;
}

const CHANNEL_OPTIONS = [
  { value: '', label: 'All channels' },
  ...Object.values(NotificationChannel).map((c) => ({ value: c, label: c })),
];

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'SENT', label: 'Sent' },
  { value: 'FAILED', label: 'Failed' },
];

const STATUS_ICONS = {
  SENT: CheckCircle,
  FAILED: XCircle,
  PENDING: Clock,
};

const STATUS_COLORS = {
  SENT: 'text-emerald-500',
  FAILED: 'text-red-500',
  PENDING: 'text-amber-500',
};

const CHANNEL_BADGE: Record<string, 'info' | 'warning' | 'muted' | 'success'> = {
  [NotificationChannel.TELEGRAM]: 'info',
  [NotificationChannel.EMAIL]: 'success',
  [NotificationChannel.SMS]: 'warning',
  [NotificationChannel.PUSH]: 'muted',
};

const PAGE_SIZE = 50;

export default function NotificationsPage() {
  const [channel, setChannel] = useState('');
  const [status, setStatus] = useState('');
  const [offset, setOffset] = useState(0);

  const { data, isLoading, refetch } = useQuery<{ items: Notification[]; total: number }>({
    queryKey: ['notifications', channel, status, offset],
    queryFn: async () => {
      const res = await api.get('/notifications', {
        params: { channel: channel || undefined, status: status || undefined, limit: PAGE_SIZE, offset },
      });
      return res.data.data ?? res.data;
    },
    refetchInterval: 30000,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ct-900">Notification Log</h2>
          <p className="text-sm text-ct-500 mt-0.5">Sent and failed notifications — refreshes every 30s</p>
        </div>
        <Button size="sm" variant="secondary" onClick={() => refetch()}>Refresh</Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="w-44">
          <Select
            value={channel}
            onChange={(e) => { setChannel(e.target.value); setOffset(0); }}
            options={CHANNEL_OPTIONS}
            placeholder="All channels"
          />
        </div>
        <div className="w-44">
          <Select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setOffset(0); }}
            options={STATUS_OPTIONS}
            placeholder="All statuses"
          />
        </div>
        {(channel || status) && (
          <Button size="sm" variant="ghost" onClick={() => { setChannel(''); setStatus(''); setOffset(0); }}>
            Clear
          </Button>
        )}
        <span className="text-sm text-ct-400 ml-auto">{total.toLocaleString()} total</span>
      </div>

      {/* Table */}
      {isLoading ? (
        <PageSpinner />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications found"
          description="Notification history will appear here once messages are sent"
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-ct-50 border-b border-ct-200">
                <th className="px-5 py-3 text-left text-xs font-medium text-ct-500 uppercase tracking-wider w-8">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-ct-500 uppercase tracking-wider">Channel</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-ct-500 uppercase tracking-wider">Recipient</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-ct-500 uppercase tracking-wider">Message</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-ct-500 uppercase tracking-wider">Sent At</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-ct-500 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ct-100">
              {items.map((n) => {
                const Icon = STATUS_ICONS[n.status as keyof typeof STATUS_ICONS] ?? Clock;
                const iconColor = STATUS_COLORS[n.status as keyof typeof STATUS_COLORS] ?? 'text-ct-400';
                return (
                  <tr key={n.id} className="hover:bg-ct-50 transition-colors">
                    <td className="px-5 py-3">
                      <Icon className={cn('w-4 h-4', iconColor)} />
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={CHANNEL_BADGE[n.channel] ?? 'muted'}>{n.channel}</Badge>
                    </td>
                    <td className="px-5 py-3 text-ct-600 text-xs font-mono truncate max-w-[120px]">
                      {n.recipientId ?? '—'}
                    </td>
                    <td className="px-5 py-3 max-w-xs">
                      {n.subject && (
                        <p className="font-medium text-ct-900 text-xs truncate">{n.subject}</p>
                      )}
                      <p className="text-ct-500 text-xs truncate">{n.body}</p>
                      {n.error && (
                        <p className="text-red-500 text-xs mt-0.5 truncate" title={n.error}>
                          Error: {n.error}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-ct-500 text-xs whitespace-nowrap">
                      {n.sentAt ? formatDate(n.sentAt) : '—'}
                    </td>
                    <td className="px-5 py-3 text-ct-400 text-xs whitespace-nowrap">
                      {formatDate(n.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            size="sm"
            variant="secondary"
            disabled={offset === 0}
            onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-ct-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            size="sm"
            variant="secondary"
            disabled={offset + PAGE_SIZE >= total}
            onClick={() => setOffset(offset + PAGE_SIZE)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
