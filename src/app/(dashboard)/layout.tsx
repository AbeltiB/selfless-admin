'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import { useQueueStore } from '@/store/queue.store';
import { SOCKET_EVENTS } from 'selfless-sdk';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const updateStats = useQueueStore((s) => s.updateStats);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) return;
    const socket = connectSocket();
    socket.on(SOCKET_EVENTS.QUEUE_STATS_UPDATED, updateStats);
    return () => {
      socket.off(SOCKET_EVENTS.QUEUE_STATS_UPDATED, updateStats);
      disconnectSocket();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isAuthenticated()) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar userRole={user?.role} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar user={user} />
        <main className="flex-1 overflow-y-auto p-6 bg-slate-100">{children}</main>
      </div>
    </div>
  );
}
