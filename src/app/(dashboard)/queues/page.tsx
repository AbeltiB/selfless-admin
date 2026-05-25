'use client';
import { useState } from 'react';
import { useBranches } from '@/hooks/useBranches';
import { useQueues, useQueueTickets, useCallNext, useUpdateTicketStatus } from '@/hooks/useQueues';
import { QueueCard } from '@/components/queue/QueueCard';
import { TicketRow } from '@/components/queue/TicketRow';
import { CallNextButton } from '@/components/queue/CallNextButton';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { QUEUE_STATUS_COLORS, cn } from '@/lib/utils';
import type { Queue } from 'selfless-sdk';
import { QueueStatus, TicketStatus } from 'selfless-sdk';
import { Ticket } from 'lucide-react';

export default function QueuesPage() {
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [selectedQueue, setSelectedQueue] = useState<Queue | null>(null);

  const { data: branches = [], isLoading: branchesLoading } = useBranches();
  const { data: queues = [], isLoading: queuesLoading } = useQueues(selectedBranchId || undefined);
  const { data: tickets = [], isLoading: ticketsLoading } = useQueueTickets(selectedQueue?.id);

  const callNextMutation = useCallNext(selectedQueue?.id ?? '');
  const updateStatusMutation = useUpdateTicketStatus(selectedQueue?.id ?? '');

  const handleCallNext = () => {
    if (!selectedQueue) return;
    callNextMutation.mutate();
  };

  const handleStatusChange = (ticketId: string, status: TicketStatus) => {
    updateStatusMutation.mutate({ ticketId, status });
  };

  const servingTicket = tickets.find((t) => t.status === TicketStatus.SERVING);
  const calledTicket = tickets.find((t) => t.status === TicketStatus.CALLED);
  const waitingCount = tickets.filter((t) => t.status === TicketStatus.WAITING).length;

  return (
    <div className="space-y-6">
      {/* Branch selector */}
      <div className="flex items-center gap-4">
        <div className="w-64">
          <Select
            label="Branch"
            value={selectedBranchId}
            onChange={(e) => {
              setSelectedBranchId(e.target.value);
              setSelectedQueue(null);
            }}
            placeholder="All branches"
            options={branches.map((b) => ({ value: b.id, label: b.name }))}
          />
        </div>
        {branchesLoading && <span className="text-sm text-slate-500">Loading branches...</span>}
      </div>

      {/* Queue list */}
      {queuesLoading ? (
        <PageSpinner />
      ) : queues.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="No queues found"
          description={
            selectedBranchId
              ? 'No queues are open for this branch'
              : 'Select a branch or open a new queue from the Dashboard'
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {queues.map((queue) => (
            <QueueCard
              key={queue.id}
              queue={queue}
              selected={selectedQueue?.id === queue.id}
              onSelect={setSelectedQueue}
            />
          ))}
        </div>
      )}

      {/* Active queue panel */}
      {selectedQueue && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Control panel */}
          <Card className="lg:col-span-1 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-slate-800 text-lg">
                  {selectedQueue.service?.name ?? 'Queue'}
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">{selectedQueue.prefix} series</p>
              </div>
              <span
                className={cn(
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  QUEUE_STATUS_COLORS[selectedQueue.status],
                )}
              >
                {selectedQueue.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 py-3 border-y border-slate-100">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{waitingCount}</p>
                <p className="text-xs text-slate-500 mt-0.5">Waiting</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-800">{selectedQueue.currentNumber}</p>
                <p className="text-xs text-slate-500 mt-0.5">Current #</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {tickets.filter((t) => t.status === TicketStatus.COMPLETED).length}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Done</p>
              </div>
            </div>

            {/* Currently serving */}
            {(servingTicket || calledTicket) && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs font-medium text-green-700 mb-1">
                  {servingTicket ? 'Currently Serving' : 'Called'}
                </p>
                <p className="text-2xl font-bold text-green-800 font-mono">
                  {(servingTicket ?? calledTicket)?.ticketNumber}
                </p>
                <p className="text-xs text-green-600 mt-0.5">
                  {(servingTicket ?? calledTicket)?.customer?.name ?? 'Walk-in customer'}
                </p>
              </div>
            )}

            {/* Call next button */}
            {selectedQueue.status === QueueStatus.OPEN && (
              <div className="flex justify-center pt-2">
                <CallNextButton
                  onCall={handleCallNext}
                  loading={callNextMutation.isPending}
                  disabled={waitingCount === 0}
                />
              </div>
            )}
            {selectedQueue.status !== QueueStatus.OPEN && (
              <div className="p-3 bg-slate-50 rounded-lg text-center">
                <p className="text-sm text-slate-500">
                  Queue is {selectedQueue.status.toLowerCase()}
                </p>
              </div>
            )}
          </Card>

          {/* Ticket list */}
          <Card className="lg:col-span-2 p-0 overflow-hidden">
            <CardHeader className="px-6 pt-5 pb-4 border-b border-slate-100">
              <CardTitle>Tickets</CardTitle>
              <div className="flex gap-2">
                <Badge variant="info">{waitingCount} waiting</Badge>
                <Badge variant="success">
                  {tickets.filter((t) => t.status === TicketStatus.SERVING).length} serving
                </Badge>
              </div>
            </CardHeader>
            {ticketsLoading ? (
              <PageSpinner />
            ) : tickets.length === 0 ? (
              <EmptyState
                icon={Ticket}
                title="No tickets"
                description="Waiting for customers to join the queue"
                className="py-12"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Ticket #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Wait
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Called At
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tickets.map((ticket) => (
                      <TicketRow
                        key={ticket.id}
                        ticket={ticket}
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {!selectedQueue && queues.length > 0 && (
        <div className="flex items-center justify-center py-12 text-slate-500">
          <p className="text-sm">Select a queue above to manage its tickets</p>
        </div>
      )}
    </div>
  );
}
