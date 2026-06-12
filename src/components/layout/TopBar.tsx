'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Bell } from 'lucide-react';
import type { JwtStaffPayload } from 'selfless-sdk';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/queues': 'Queues',
  '/appointments': 'Appointments',
  '/counters': 'Counters',
  '/workflows': 'Workflows',
  '/services': 'Services',
  '/branches': 'Branches',
  '/organizations': 'Organizations',
  '/users': 'Users',
  '/analytics': 'Analytics',
};

interface TopBarProps {
  user?: JwtStaffPayload | null;
}

export function TopBar({ user: _user }: TopBarProps) {
  const pathname = usePathname();
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const tick = () => setTime(format(new Date(), 'HH:mm:ss'));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const title =
    Object.entries(PAGE_TITLES).find(
      ([path]) => pathname === path || pathname.startsWith(path + '/'),
    )?.[1] ?? 'Dashboard';

  return (
    <header className="h-14 bg-white border-b border-ct-200 flex items-center px-6 gap-3 shrink-0">
      <h2 className="text-[15px] font-semibold text-ct-900 tracking-tight flex-1">{title}</h2>

      <span className="text-[13px] text-ct-400 font-mono tnum tabular-nums">{time}</span>

      <button className="relative p-2 rounded-lg text-ct-400 hover:text-ct-900 hover:bg-ct-100 transition-colors">
        <Bell className="w-[18px] h-[18px]" />
      </button>
    </header>
  );
}
