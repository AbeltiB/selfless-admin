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
  blue: { bg: 'bg-blue-50', icon: 'text-blue-600', ring: 'bg-blue-100' },
  green: { bg: 'bg-green-50', icon: 'text-green-600', ring: 'bg-green-100' },
  amber: { bg: 'bg-amber-50', icon: 'text-amber-600', ring: 'bg-amber-100' },
  red: { bg: 'bg-red-50', icon: 'text-red-600', ring: 'bg-red-100' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600', ring: 'bg-purple-100' },
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  trend,
}: StatCardProps) {
  const c = colors[color];
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
          {trend && (
            <p className={cn('text-xs mt-1', trend.value >= 0 ? 'text-green-600' : 'text-red-600')}>
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
