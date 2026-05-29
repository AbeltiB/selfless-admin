'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Ticket,
  Building2,
  Building,
  ListTodo,
  Users,
  BarChart2,
  GitBranch,
  Monitor,
  CalendarClock,
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
  { label: 'Dashboard',     href: '/dashboard',     icon: LayoutDashboard },
  { label: 'Queues',        href: '/queues',         icon: Ticket },
  { label: 'Appointments',  href: '/appointments',   icon: CalendarClock },
  { label: 'Counters',      href: '/counters',       icon: Monitor },
  { label: 'Workflows',     href: '/workflows',      icon: GitBranch,  roles: [UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.BRANCH_MANAGER] },
  { label: 'Services',      href: '/services',       icon: ListTodo },
  { label: 'Branches',      href: '/branches',       icon: Building2,  roles: [UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.BRANCH_MANAGER] },
  { label: 'Organizations', href: '/organizations',  icon: Building,   roles: [UserRole.SUPER_ADMIN] },
  { label: 'Users',         href: '/users',          icon: Users,      roles: [UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.BRANCH_MANAGER] },
  { label: 'Analytics',     href: '/analytics',      icon: BarChart2 },
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
      className="flex flex-col h-full text-white"
      style={{ width: '260px', minWidth: '260px', backgroundColor: '#1A2B4A' }}
    >
      {/* Logo */}
      <div className="px-6 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-ct-600 rounded-lg flex items-center justify-center font-bold text-lg text-white">
            S
          </div>
          <div>
            <h1 className="font-semibold text-white text-base leading-none">SelfLess</h1>
            <p className="text-xs mt-0.5" style={{ color: '#93C5FD', opacity: 0.7 }}>Admin Portal</p>
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
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-ct-600 text-white'
                  : 'text-ct-300 opacity-75 hover:opacity-100 hover:text-white',
              )}
              style={!isActive ? { ':hover': { backgroundColor: 'rgba(255,255,255,0.06)' } } as React.CSSProperties : undefined}
              onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = ''; }}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white"
            style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
          >
            {user?.email?.charAt(0)?.toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.email ?? 'User'}</p>
            <p className="text-xs truncate" style={{ color: '#93C5FD', opacity: 0.7 }}>
              {user?.role ? ROLE_LABELS[user.role] : ''}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-ct-300 opacity-75 hover:opacity-100 hover:text-white transition-all"
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.06)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = ''; }}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
