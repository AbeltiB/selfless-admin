import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';
import { TicketStatus, QueueStatus, UserRole, TICKET_STATUS_LABELS } from 'selfless-sdk';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Status colors are semantic and theme-independent: soft tinted bg +
// strong text + matching border, consistent with the Badge component.
export const TICKET_STATUS_COLORS: Record<TicketStatus, string> = {
  [TicketStatus.CREATED]:          'bg-blue-50 text-blue-700 border border-blue-200',
  [TicketStatus.WAITING]:          'bg-blue-50 text-blue-700 border border-blue-200',
  [TicketStatus.CALLED]:           'bg-amber-50 text-amber-700 border border-amber-200',
  [TicketStatus.IN_SERVICE]:       'bg-emerald-50 text-emerald-700 border border-emerald-200',
  [TicketStatus.ON_HOLD]:          'bg-orange-50 text-orange-700 border border-orange-200',
  [TicketStatus.TRANSFERRED]:      'bg-violet-50 text-violet-700 border border-violet-200',
  [TicketStatus.AWAITING_PAYMENT]: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  [TicketStatus.AWAITING_DOCUMENT]:'bg-cyan-50 text-cyan-700 border border-cyan-200',
  [TicketStatus.COMPLETED]:        'bg-emerald-50 text-emerald-700 border border-emerald-200',
  [TicketStatus.REJECTED]:         'bg-red-50 text-red-700 border border-red-200',
  [TicketStatus.NO_SHOW]:          'bg-red-50 text-red-700 border border-red-200',
  [TicketStatus.CANCELLED]:        'bg-ct-100 text-ct-500 border border-ct-200',
  [TicketStatus.EXPIRED]:          'bg-ct-100 text-ct-400 border border-ct-200',
  [TicketStatus.ABANDONED]:        'bg-ct-100 text-ct-400 border border-ct-200',
};

export const QUEUE_STATUS_COLORS: Record<QueueStatus, string> = {
  [QueueStatus.OPEN]:   'bg-emerald-50 text-emerald-700 border border-emerald-200',
  [QueueStatus.CLOSED]: 'bg-red-50 text-red-700 border border-red-200',
  [QueueStatus.PAUSED]: 'bg-amber-50 text-amber-700 border border-amber-200',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]:    'Super Admin',
  [UserRole.ORG_ADMIN]:      'Org Admin',
  [UserRole.BRANCH_MANAGER]: 'Branch Manager',
  [UserRole.SUPERVISOR]:     'Supervisor',
  [UserRole.OFFICER]:        'Officer',
  [UserRole.CUSTOMER]:       'Customer',
};

export { TICKET_STATUS_LABELS };

export function formatWait(seconds?: number): string {
  if (!seconds) return '—';
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy HH:mm');
}

export function timeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}
