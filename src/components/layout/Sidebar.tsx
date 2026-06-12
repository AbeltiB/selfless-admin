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

interface NavSection {
  title?: string;
  items: NavItem[];
}

const MANAGERS = [UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.BRANCH_MANAGER];

const navSections: NavSection[] = [
  {
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Analytics', href: '/analytics', icon: BarChart2 },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Queues',       href: '/queues',       icon: Ticket },
      { label: 'Appointments', href: '/appointments', icon: CalendarClock },
      { label: 'Counters',     href: '/counters',     icon: Monitor },
    ],
  },
  {
    title: 'Configuration',
    items: [
      { label: 'Services',      href: '/services',      icon: ListTodo },
      { label: 'Workflows',     href: '/workflows',     icon: GitBranch, roles: MANAGERS },
      { label: 'Branches',      href: '/branches',      icon: Building2, roles: MANAGERS },
      { label: 'Organizations', href: '/organizations', icon: Building,  roles: [UserRole.SUPER_ADMIN] },
      { label: 'Users',         href: '/users',         icon: Users,     roles: MANAGERS },
    ],
  },
];

interface SidebarProps {
  userRole?: UserRole;
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const visibleSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => !item.roles || (userRole && item.roles.includes(userRole)),
      ),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <aside className="flex flex-col h-full w-[248px] min-w-[248px] bg-white border-r border-ct-200">
      {/* Logo */}
      <div className="px-5 pt-5 pb-4">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-ct-900 rounded-lg flex items-center justify-center text-white text-sm font-bold tracking-tight">
            S
          </div>
          <div>
            <h1 className="text-[15px] font-semibold text-ct-900 leading-none tracking-tight">
              SelfLess
            </h1>
            <p className="text-[11px] text-ct-400 mt-0.5 leading-none">Admin</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pb-4 overflow-y-auto">
        {visibleSections.map((section, i) => (
          <div key={i} className={cn(i > 0 && 'mt-5')}>
            {section.title && (
              <p className="px-2.5 mb-1.5 text-[11px] font-medium text-ct-400 uppercase tracking-wider">
                {section.title}
              </p>
            )}
            <div className="space-y-px">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(item.href + '/');
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-colors',
                      isActive
                        ? 'bg-ct-100 text-ct-900'
                        : 'text-ct-500 hover:text-ct-900 hover:bg-ct-50',
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-[18px] h-[18px] shrink-0',
                        isActive ? 'text-ct-900' : 'text-ct-400',
                      )}
                      strokeWidth={isActive ? 2.25 : 2}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 py-3 border-t border-ct-200">
        <div className="flex items-center gap-2.5 px-2.5 py-1.5">
          <div className="w-7 h-7 rounded-full bg-ct-900 flex items-center justify-center text-[11px] font-semibold text-white shrink-0">
            {user?.email?.charAt(0)?.toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-ct-900 truncate leading-tight">
              {user?.email ?? 'User'}
            </p>
            <p className="text-[11px] text-ct-400 truncate leading-tight">
              {user?.role ? ROLE_LABELS[user.role] : ''}
            </p>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="p-1.5 rounded-md text-ct-400 hover:text-ct-900 hover:bg-ct-100 transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
