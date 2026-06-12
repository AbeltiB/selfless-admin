import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted';
}

const variants = {
  default: 'bg-ct-100 text-ct-700 border-ct-200',
  success: 'bg-status-success-bg text-status-success-text border-emerald-200',
  warning: 'bg-status-warning-bg text-status-warning-text border-amber-200',
  danger:  'bg-status-danger-bg text-status-danger-text border-red-200',
  info:    'bg-blue-50 text-blue-700 border-blue-200',
  muted:   'bg-ct-50 text-ct-400 border-ct-200',
};

export function Badge({ children, className, variant = 'default' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
