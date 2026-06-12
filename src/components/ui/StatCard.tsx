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
  blue:   'bg-blue-50 text-blue-600',
  green:  'bg-emerald-50 text-emerald-600',
  amber:  'bg-amber-50 text-amber-600',
  red:    'bg-red-50 text-red-600',
  purple: 'bg-violet-50 text-violet-600',
};

export function StatCard({ title, value, subtitle, icon: Icon, color = 'blue', trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-ct-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] font-medium text-ct-500">{title}</p>
        <div className={cn('p-1.5 rounded-lg', colors[color])}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-[28px] font-semibold text-ct-900 leading-none tracking-tight tnum">
        {value}
      </p>
      {(subtitle || trend) && (
        <div className="flex items-center gap-2 mt-2">
          {trend && (
            <span
              className={cn(
                'text-xs font-medium tnum',
                trend.value >= 0 ? 'text-status-success-text' : 'text-status-danger-text',
              )}
            >
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </span>
          )}
          {subtitle && <span className="text-xs text-ct-400">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
