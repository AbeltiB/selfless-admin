'use client';
import { useEffect, useRef } from 'react';
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket';
import type { Socket } from 'socket.io-client';

export function useSocket(branchId?: string) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = connectSocket(branchId);
    return () => {
      disconnectSocket();
    };
  }, [branchId]);

  return socketRef.current ?? getSocket();
}

export function useSocketEvent<T = unknown>(event: string, handler: (data: T) => void) {
  useEffect(() => {
    const socket = getSocket();
    socket.on(event, handler);
    return () => {
      socket.off(event, handler);
    };
  }, [event, handler]);
}
