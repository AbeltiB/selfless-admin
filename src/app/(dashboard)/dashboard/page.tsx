'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useQueueStore } from '@/store/queue.store';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { QueueCard } from '@/components/queue/QueueCard';
import { TicketBadge } from '@/components/queue/TicketBadge';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { useOpenQueue } from '@/hooks/useQueues';
import { useBranches } from '@/hooks/useBranches';
import {
  Users,
  PlayCircle,
  CheckCircle2,
  Clock,
  Ticket as TicketIcon,
  Plus,
} from 'lucide-react';
import type { Queue, Ticket } from 'selfless-sdk';
import { formatWait, formatDate } from '@/lib/utils';
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalWaiting: number;
  totalServing: number;
  totalCompleted: number;
  avgWaitSeconds: number;
}

export default function DashboardPage() {
  const queueStats = useQueueStore((s) => s.stats);
  const [openQueueModal, setOpenQueueModal] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');

  const { data: branches = [] } = useBranches();
  const openQueueMutation = useOpenQueue();

  // Fetch all queues
  const { data: queues = [], isLoading: queuesLoading } = useQuery<Queue[]>({
    queryKey: ['queues'],
    queryFn: async () => {
      const res = await api.get('/queues');
      return res.data.data ?? res.data;
    },
    refetchInterval: 30000,
  });

  // Fetch recent tickets
  const { data: recentTickets = [] } = useQuery<Ticket[]>({
    queryKey: ['recent-tickets'],
    queryFn: async () => {
      const res = await api.get('/tickets', { params: { limit: 10, sort: 'createdAt:desc' } });
      return res.data.data ?? res.data;
    },
    refetchInterval: 15000,
  });

  // Fetch analytics stats
  const { data: analyticsData } = useQuery<{ data: DashboardStats }>({
    queryKey: ['analytics-dashboard'],
    queryFn: async () => {
      const res = await api.get('/analytics/dashboard');
      return res.data;
    },
    refetchInterval: 60000,
  });

  // Aggregate stats from realtime store or fallback to API
  const realtimeStats = Object.values(queueStats);
  const totalWaiting =
    realtimeStats.length > 0
      ? realtimeStats.reduce((a, s) => a + s.waitingCount, 0)
      : analyticsData?.data?.totalWaiting ?? 0;
  const totalServing =
    realtimeStats.length > 0
      ? realtimeStats.reduce((a, s) => a + s.servingCount, 0)
      : analyticsData?.data?.totalServing ?? 0;
  const totalCompleted =
    realtimeStats.length > 0
      ? realtimeStats.reduce((a, s) => a + s.completedCount, 0)
      : analyticsData?.data?.totalCompleted ?? 0;
  const avgWait =
    realtimeStats.length > 0
      ? Math.round(realtimeStats.reduce((a, s) => a + s.avgWaitSeconds, 0) / realtimeStats.length)
      : analyticsData?.data?.avgWaitSeconds ?? 0;

  // Services for selected branch
  const { data: branchServices = [] } = useQuery({
    queryKey: ['services', selectedBranchId],
    queryFn: async () => {
      const res = await api.get('/services', { params: { branchId: selectedBranchId } });
      return res.data.data ?? res.data;
    },
    enabled: !!selectedBranchId,
  });

  const handleOpenQueue = async () => {
    if (!selectedBranchId || !selectedServiceId) {
      toast.error('Please select a branch and service');
      return;
    }
    await openQueueMutation.mutateAsync({
      branchId: selectedBranchId,
      serviceId: selectedServiceId,
      date: new Date().toISOString().split('T')[0],
    });
    setOpenQueueModal(false);
    setSelectedBranchId('');
    setSelectedServiceId('');
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Waiting"
          value={totalWaiting}
          icon={Users}
          color="blue"
          subtitle="Across all queues"
        />
        <StatCard
          title="Currently Serving"
          value={totalServing}
          icon={PlayCircle}
          color="green"
          subtitle="Active service sessions"
        />
        <StatCard
          title="Completed Today"
          value={totalCompleted}
          icon={CheckCircle2}
          color="purple"
          subtitle="Successfully served"
        />
        <StatCard
          title="Avg Wait Time"
          value={formatWait(avgWait)}
          icon={Clock}
          color="amber"
          subtitle="Current average"
        />
      </div>

      {/* Live Queues + Quick Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">Live Queues</h2>
        <Button onClick={() => setOpenQueueModal(true)}>
          <Plus className="w-4 h-4" />
          Open Queue
        </Button>
      </div>

      {queuesLoading ? (
        <PageSpinner />
      ) : queues.length === 0 ? (
        <EmptyState
          icon={TicketIcon}
          title="No active queues"
          description="Open a new queue to start serving customers"
          action={
            <Button onClick={() => setOpenQueueModal(true)}>
              <Plus className="w-4 h-4" />
              Open Queue
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {queues.map((queue) => (
            <QueueCard
              key={queue.id}
              queue={queue}
              onCallNext={(queueId) => {
                void api.post(`/queues/${queueId}/call-next`).then(() => {
                  toast.success('Next ticket called');
                });
              }}
            />
          ))}
        </div>
      )}

      {/* Recent Tickets */}
      <Card className="p-0 overflow-hidden">
        <CardHeader className="px-6 pt-5 pb-0 mb-0">
          <CardTitle>Recent Tickets</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Ticket #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Wait Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Issued At
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentTickets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No tickets yet
                  </td>
                </tr>
              ) : (
                recentTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-mono font-semibold text-slate-800">
                      {ticket.queueNumber}
                    </td>
                    <td className="px-6 py-3 text-slate-700">
                      {'Walk-in'}
                    </td>
                    <td className="px-6 py-3">
                      <TicketBadge status={ticket.status} />
                    </td>
                    <td className="px-6 py-3 text-slate-500">{formatWait(ticket.waitSeconds)}</td>
                    <td className="px-6 py-3 text-slate-500">{formatDate(ticket.issuedAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Open Queue Modal */}
      <Modal
        open={openQueueModal}
        onClose={() => setOpenQueueModal(false)}
        title="Open New Queue"
        size="sm"
      >
        <div className="space-y-4">
          <Select
            label="Branch"
            value={selectedBranchId}
            onChange={(e) => {
              setSelectedBranchId(e.target.value);
              setSelectedServiceId('');
            }}
            placeholder="Select a branch"
            options={branches.map((b) => ({ value: b.id, label: b.name }))}
          />
          <Select
            label="Service"
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(e.target.value)}
            placeholder="Select a service"
            disabled={!selectedBranchId}
            options={(branchServices as { id: string; name: string }[]).map((s) => ({
              value: s.id,
              label: s.name,
            }))}
          />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setOpenQueueModal(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              loading={openQueueMutation.isPending}
              onClick={handleOpenQueue}
            >
              Open Queue
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
