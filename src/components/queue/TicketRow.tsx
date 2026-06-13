'use client';
import type { Ticket } from 'selfless-sdk';
import { TicketStatus } from 'selfless-sdk';
import { TicketBadge } from './TicketBadge';
import { formatWait, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface TicketRowProps {
  ticket: Ticket;
  onStatusChange?: (ticketId: string, status: TicketStatus) => void;
  onView?: (ticketId: string) => void;
}

export function TicketRow({ ticket, onStatusChange, onView }: TicketRowProps) {
  const actions: { label: string; status: TicketStatus; variant: 'primary' | 'success' | 'danger' | 'secondary' | 'ghost' }[] = [];

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

  const customerName = (ticket as any).customer
    ? `${(ticket as any).customer.firstName} ${(ticket as any).customer.lastName ?? ''}`.trim()
    : 'Walk-in';

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-4 py-3 text-sm font-mono font-semibold text-slate-800">
        <button
          className="hover:underline text-left"
          onClick={() => onView?.(ticket.id)}
        >
          {ticket.queueNumber}
        </button>
      </td>
      <td className="px-4 py-3 text-sm text-slate-700">{customerName}</td>
      <td className="px-4 py-3">
        <TicketBadge status={ticket.status} />
      </td>
      <td className="px-4 py-3 text-sm text-slate-500">{formatWait(ticket.waitSeconds)}</td>
      <td className="px-4 py-3 text-sm text-slate-500">
        {ticket.calledAt ? formatDate(ticket.calledAt) : '—'}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={() => onView?.(ticket.id)}>
            View
          </Button>
          {actions.map((action) => (
            <Button
              key={action.status}
              size="sm"
              variant={action.variant}
              onClick={() => onStatusChange?.(ticket.id, action.status)}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </td>
    </tr>
  );
}
