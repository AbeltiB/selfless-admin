import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-14 px-6 text-center rounded-xl border border-dashed border-ct-300 bg-ct-50/50',
        className,
      )}
    >
      {Icon && (
        <div className="p-3 bg-white border border-ct-200 rounded-xl mb-4 shadow-sm">
          <Icon className="w-6 h-6 text-ct-400" />
        </div>
      )}
      <h3 className="text-sm font-semibold text-ct-900 mb-1">{title}</h3>
      {description && <p className="text-[13px] text-ct-500 max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}
