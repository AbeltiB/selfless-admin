'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Ticket,
  Building2,
  ListTodo,
  Users,
  BarChart2,
  LogOut,
} from 'lucide-react';
import { cn, ROLE_LABELS } from '@/lib/utils';
import { UserRole } from 'selfless-sdk';
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: UserRole[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Queues', href: '/queues', icon: Ticket },
  { label: 'Branches', href: '/branches', icon: Building2 },
  { label: 'Services', href: '/services', icon: ListTodo },
  {
    label: 'Users',
    href: '/users',
    icon: Users,
    roles: [UserRole.ADMIN, UserRole.SUPERVISOR],
  },
  { label: 'Analytics', href: '/analytics', icon: BarChart2 },
];

interface SidebarProps {
  userRole?: UserRole;
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const filteredItems = navItems.filter(
    (item) => !item.roles || (userRole && item.roles.includes(userRole)),
  );

  return (
    <aside
      className="flex flex-col h-full bg-slate-800 text-white"
      style={{ width: '260px', minWidth: '260px' }}
    >
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg">
            S
          </div>
          <div>
            <h1 className="font-bold text-white text-lg leading-none">SelfLess</h1>
            <p className="text-slate-400 text-xs mt-0.5">Admin Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white',
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div className="px-3 py-4 border-t border-slate-700">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-sm font-semibold">
            {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name ?? 'User'}</p>
            <p className="text-xs text-slate-400 truncate">
              {user?.role ? ROLE_LABELS[user.role] : ''}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
