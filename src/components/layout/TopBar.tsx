'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Bell } from 'lucide-react';
import type { JwtStaffPayload } from 'selfless-sdk';
import { ROLE_LABELS } from '@/lib/utils';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/queues': 'Queue Management',
  '/appointments': 'Appointments',
  '/counters': 'Counters',
  '/workflows': 'Workflows',
  '/services': 'Service Management',
  '/branches': 'Branch Management',
  '/organizations': 'Organizations',
  '/users': 'User Management',
  '/analytics': 'Analytics',
};

interface TopBarProps {
  user?: JwtStaffPayload | null;
}

export function TopBar({ user }: TopBarProps) {
  const pathname = usePathname();
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const tick = () => setTime(format(new Date(), 'HH:mm:ss'));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const title =
    Object.entries(PAGE_TITLES).find(([path]) => pathname === path || pathname.startsWith(path + '/'))?.[1] ??
    'Dashboard';

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 gap-4 shrink-0">
      <h2 className="text-xl font-semibold text-slate-800 flex-1">{title}</h2>

      {/* Clock */}
      <div className="flex items-center gap-2 text-sm text-slate-500 font-mono bg-ct-50 px-3 py-1.5 rounded-lg border border-ct-200">
        <span>{time}</span>
      </div>

      {/* Notifications placeholder */}
      <button className="relative p-2 rounded-lg hover:bg-ct-50 text-slate-400 hover:text-ct-600 transition-colors">
        <Bell className="w-5 h-5" />
      </button>

      {/* User info */}
      <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
        <div className="w-9 h-9 bg-ct-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
          {user?.email?.charAt(0)?.toUpperCase() ?? 'U'}
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-slate-800 leading-none">{user?.email ?? 'User'}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {user?.role ? ROLE_LABELS[user.role] : ''}
          </p>
        </div>
      </div>
    </header>
  );
}
