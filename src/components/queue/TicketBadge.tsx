import { TicketStatus, TICKET_STATUS_LABELS } from 'selfless-sdk';
import { TICKET_STATUS_COLORS, cn } from '@/lib/utils';

export function TicketBadge({ status }: { status: TicketStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        TICKET_STATUS_COLORS[status],
      )}
    >
      {TICKET_STATUS_LABELS[status]}
    </span>
  );
}
