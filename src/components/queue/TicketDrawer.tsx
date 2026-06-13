'use client';
import { TicketStatus, TicketEventType, TICKET_STATUS_LABELS } from 'selfless-sdk';
import { useTicket } from '@/hooks/useTicket';
import { Drawer } from '@/components/ui/Drawer';
import { TicketBadge } from './TicketBadge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { formatDate, formatWait, cn } from '@/lib/utils';
import {
  Clock, User, MapPin, Layers, Hash, Calendar,
  CheckCircle, XCircle, PhoneCall, Timer, ArrowRight,
  FileText, AlertCircle,
} from 'lucide-react';

const EVENT_ICONS: Partial<Record<TicketEventType, React.ElementType>> = {
  [TicketEventType.CREATED]: Hash,
  [TicketEventType.CALLED]: PhoneCall,
  [TicketEventType.SERVING_STARTED]: Timer,
  [TicketEventType.COMPLETED]: CheckCircle,
  [TicketEventType.CANCELLED]: XCircle,
  [TicketEventType.REJECTED]: XCircle,
  [TicketEventType.NO_SHOW]: AlertCircle,
  [TicketEventType.TRANSFERRED]: ArrowRight,
  [TicketEventType.ON_HOLD]: Clock,
  [TicketEventType.STEP_ADVANCED]: Layers,
  [TicketEventType.NOTE_ADDED]: FileText,
};

const EVENT_COLORS: Partial<Record<TicketEventType, string>> = {
  [TicketEventType.CREATED]: 'bg-blue-100 text-blue-600',
  [TicketEventType.CALLED]: 'bg-amber-100 text-amber-600',
  [TicketEventType.SERVING_STARTED]: 'bg-emerald-100 text-emerald-600',
  [TicketEventType.COMPLETED]: 'bg-emerald-100 text-emerald-600',
  [TicketEventType.CANCELLED]: 'bg-ct-100 text-ct-400',
  [TicketEventType.REJECTED]: 'bg-red-100 text-red-500',
  [TicketEventType.NO_SHOW]: 'bg-red-100 text-red-500',
  [TicketEventType.TRANSFERRED]: 'bg-violet-100 text-violet-600',
  [TicketEventType.ON_HOLD]: 'bg-orange-100 text-orange-500',
  [TicketEventType.STEP_ADVANCED]: 'bg-blue-100 text-blue-600',
  [TicketEventType.NOTE_ADDED]: 'bg-ct-100 text-ct-500',
};

const EVENT_LABELS: Record<TicketEventType, string> = {
  [TicketEventType.CREATED]: 'Ticket created',
  [TicketEventType.CALLED]: 'Customer called',
  [TicketEventType.SERVING_STARTED]: 'Service started',
  [TicketEventType.COMPLETED]: 'Completed',
  [TicketEventType.CANCELLED]: 'Cancelled',
  [TicketEventType.REJECTED]: 'Rejected',
  [TicketEventType.NO_SHOW]: 'No show',
  [TicketEventType.TRANSFERRED]: 'Transferred',
  [TicketEventType.ON_HOLD]: 'Put on hold',
  [TicketEventType.RESUMED]: 'Resumed',
  [TicketEventType.AWAITING_PAYMENT]: 'Awaiting payment',
  [TicketEventType.AWAITING_DOCUMENT]: 'Awaiting document',
  [TicketEventType.NOTE_ADDED]: 'Note added',
  [TicketEventType.COUNTER_ASSIGNED]: 'Counter assigned',
  [TicketEventType.STEP_ADVANCED]: 'Step advanced',
  [TicketEventType.EXPIRED]: 'Expired',
};

interface TicketDrawerProps {
  ticketId: string | null;
  onClose: () => void;
  onStatusChange?: (ticketId: string, status: TicketStatus) => void;
  onTransfer?: (ticketId: string) => void;
}

export function TicketDrawer({ ticketId, onClose, onStatusChange, onTransfer }: TicketDrawerProps) {
  const { data: ticket, isLoading } = useTicket(ticketId);

  const actions: { label: string; status: TicketStatus; variant: 'primary' | 'success' | 'danger' | 'secondary' | 'ghost' }[] = [];
  if (ticket) {
    if (ticket.status === TicketStatus.WAITING) {
      actions.push({ label: 'Call', status: TicketStatus.CALLED, variant: 'primary' });
      actions.push({ label: 'Cancel', status: TicketStatus.CANCELLED, variant: 'ghost' });
    } else if (ticket.status === TicketStatus.CALLED) {
      actions.push({ label: 'Serve', status: TicketStatus.IN_SERVICE, variant: 'success' });
      actions.push({ label: 'No Show', status: TicketStatus.NO_SHOW, variant: 'danger' });
    } else if (ticket.status === TicketStatus.IN_SERVICE) {
      actions.push({ label: 'Complete', status: TicketStatus.COMPLETED, variant: 'success' });
      actions.push({ label: 'Hold', status: TicketStatus.ON_HOLD, variant: 'secondary' });
    } else if (ticket.status === TicketStatus.ON_HOLD) {
      actions.push({ label: 'Resume', status: TicketStatus.IN_SERVICE, variant: 'primary' });
      actions.push({ label: 'Cancel', status: TicketStatus.CANCELLED, variant: 'ghost' });
    }
  }

  const canTransfer = ticket && [TicketStatus.IN_SERVICE, TicketStatus.ON_HOLD].includes(ticket.status);

  return (
    <Drawer
      open={!!ticketId}
      onClose={onClose}
      title={ticket ? `Ticket ${ticket.queueNumber}` : 'Ticket Details'}
      subtitle={ticket ? `${ticket.service?.name} · ${ticket.branch?.name}` : undefined}
      width="md"
    >
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Spinner />
        </div>
      )}

      {ticket && (
        <div className="flex flex-col gap-0">
          {/* Status + actions */}
          <div className="px-5 py-4 flex items-center justify-between border-b border-ct-100">
            <TicketBadge status={ticket.status} />
            <div className="flex items-center gap-2">
              {canTransfer && onTransfer && (
                <Button size="sm" variant="secondary" onClick={() => onTransfer(ticket.id)}>
                  Transfer
                </Button>
              )}
              {actions.map((a) => (
                <Button
                  key={a.status}
                  size="sm"
                  variant={a.variant}
                  onClick={() => { onStatusChange?.(ticket.id, a.status); onClose(); }}
                >
                  {a.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Info grid */}
          <div className="px-5 py-4 grid grid-cols-2 gap-x-6 gap-y-3 border-b border-ct-100">
            <InfoRow icon={Hash} label="Queue #" value={ticket.queueNumber} mono />
            <InfoRow icon={Calendar} label="Issued" value={formatDate(ticket.issuedAt)} />
            <InfoRow icon={Layers} label="Service" value={ticket.service?.name} />
            <InfoRow icon={MapPin} label="Branch" value={ticket.branch?.name} />
            {ticket.currentStep && (
              <InfoRow icon={ArrowRight} label="Current Step" value={ticket.currentStep.name} />
            )}
            {ticket.currentCounter && (
              <InfoRow icon={MapPin} label="Counter" value={`${ticket.currentCounter.name} (${ticket.currentCounter.code})`} />
            )}
            {ticket.operator && (
              <InfoRow icon={User} label="Operator" value={ticket.operator.name} />
            )}
            {ticket.waitSeconds != null && (
              <InfoRow icon={Clock} label="Wait" value={formatWait(ticket.waitSeconds)} />
            )}
            {ticket.serviceSeconds != null && (
              <InfoRow icon={Timer} label="Service Time" value={formatWait(ticket.serviceSeconds)} />
            )}
            {ticket.priority > 0 && (
              <InfoRow icon={AlertCircle} label="Priority" value={`P${ticket.priority}`} />
            )}
          </div>

          {/* Customer */}
          {ticket.customer && (
            <div className="px-5 py-4 border-b border-ct-100">
              <p className="text-xs font-medium text-ct-400 uppercase tracking-wider mb-2">Customer</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-ct-100 flex items-center justify-center text-sm font-medium text-ct-600">
                  {ticket.customer.firstName[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-ct-900">
                    {ticket.customer.firstName} {ticket.customer.lastName ?? ''}
                  </p>
                  {ticket.customer.phone && (
                    <p className="text-xs text-ct-500">{ticket.customer.phone}</p>
                  )}
                  {ticket.customer.telegramUsername && (
                    <p className="text-xs text-ct-400">@{ticket.customer.telegramUsername}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {ticket.notes && (
            <div className="px-5 py-4 border-b border-ct-100">
              <p className="text-xs font-medium text-ct-400 uppercase tracking-wider mb-1">Notes</p>
              <p className="text-sm text-ct-700">{ticket.notes}</p>
            </div>
          )}

          {/* Timeline */}
          <div className="px-5 py-4">
            <p className="text-xs font-medium text-ct-400 uppercase tracking-wider mb-3">Timeline</p>
            <ol className="relative border-l border-ct-200 space-y-4 ml-2">
              {ticket.events.map((event) => {
                const Icon = EVENT_ICONS[event.eventType] ?? Hash;
                const color = EVENT_COLORS[event.eventType] ?? 'bg-ct-100 text-ct-400';
                return (
                  <li key={event.id} className="ml-5">
                    <span className={cn('absolute -left-[18px] flex h-7 w-7 items-center justify-center rounded-full', color)}>
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <div className="pb-1">
                      <p className="text-sm font-medium text-ct-900">{EVENT_LABELS[event.eventType] ?? event.eventType}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-ct-400">{formatDate(event.createdAt)}</span>
                        {event.actor && (
                          <span className="text-xs text-ct-500">by {event.actor.name}</span>
                        )}
                      </div>
                      {event.fromStatus && event.toStatus && (
                        <p className="text-xs text-ct-400 mt-0.5">
                          {TICKET_STATUS_LABELS[event.fromStatus as TicketStatus] ?? event.fromStatus}
                          {' → '}
                          {TICKET_STATUS_LABELS[event.toStatus as TicketStatus] ?? event.toStatus}
                        </p>
                      )}
                      {(event.metadata as any)?.notes && (
                        <p className="text-xs text-ct-500 mt-0.5 italic">{(event.metadata as any).notes}</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      )}
    </Drawer>
  );
}

function InfoRow({ icon: Icon, label, value, mono }: { icon: React.ElementType; label: string; value?: string | number | null; mono?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-3.5 h-3.5 text-ct-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-[10px] text-ct-400 uppercase tracking-wider leading-none mb-0.5">{label}</p>
        <p className={cn('text-sm text-ct-800', mono && 'font-mono')}>{value}</p>
      </div>
    </div>
  );
}
