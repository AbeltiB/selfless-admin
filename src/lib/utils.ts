import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';
import { TicketStatus, QueueStatus, UserRole, TICKET_STATUS_LABELS } from 'selfless-sdk';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const TICKET_STATUS_COLORS: Record<TicketStatus, string> = {
  [TicketStatus.PENDING]: 'bg-gray-100 text-gray-700',
  [TicketStatus.WAITING]: 'bg-blue-100 text-blue-700',
  [TicketStatus.CALLED]: 'bg-amber-100 text-amber-700',
  [TicketStatus.SERVING]: 'bg-green-100 text-green-700',
  [TicketStatus.ON_HOLD]: 'bg-orange-100 text-orange-700',
  [TicketStatus.TRANSFERRED]: 'bg-purple-100 text-purple-700',
  [TicketStatus.COMPLETED]: 'bg-emerald-100 text-emerald-700',
  [TicketStatus.NO_SHOW]: 'bg-red-100 text-red-700',
  [TicketStatus.CANCELLED]: 'bg-slate-100 text-slate-500',
  [TicketStatus.EXPIRED]: 'bg-slate-100 text-slate-400',
};

export const QUEUE_STATUS_COLORS: Record<QueueStatus, string> = {
  [QueueStatus.OPEN]: 'bg-green-100 text-green-700',
  [QueueStatus.CLOSED]: 'bg-red-100 text-red-700',
  [QueueStatus.PAUSED]: 'bg-amber-100 text-amber-700',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Admin',
  [UserRole.SUPERVISOR]: 'Supervisor',
  [UserRole.BRANCH_MANAGER]: 'Branch Manager',
  [UserRole.OPERATOR]: 'Operator',
  [UserRole.STAFF]: 'Staff',
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
