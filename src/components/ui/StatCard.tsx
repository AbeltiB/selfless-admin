import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple';
  trend?: { value: number; label: string };
}

const colors = {
  blue:   { ring: 'bg-ct-100',    icon: 'text-ct-600'                              },
  green:  { ring: 'bg-emerald-100', icon: 'text-emerald-600'                       },
  amber:  { ring: 'bg-amber-100',  icon: 'text-amber-600'                          },
  red:    { ring: 'bg-red-100',    icon: 'text-red-600'                             },
  purple: { ring: 'bg-purple-100', icon: 'text-purple-600'                         },
};

export function StatCard({ title, value, subtitle, icon: Icon, color = 'blue', trend }: StatCardProps) {
  const c = colors[color];
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
          {trend && (
            <p className={cn('text-xs mt-1', trend.value >= 0 ? 'text-status-success-text' : 'text-status-danger-text')}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-xl', c.ring)}>
          <Icon className={cn('w-7 h-7', c.icon)} />
        </div>
      </div>
    </div>
  );
}
