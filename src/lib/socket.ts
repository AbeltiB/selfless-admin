import { io, Socket } from 'socket.io-client';
import { authStorage } from './auth';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(
      process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:4000',
      {
        autoConnect: false,
        withCredentials: true,
        transports: ['websocket', 'polling'],
      },
    );
  }
  return socket;
}

export function connectSocket(branchId?: string) {
  const s = getSocket();
  if (!s.connected) {
    s.auth = { token: authStorage.getToken() };
    s.connect();
  }
  if (branchId) {
    s.emit('branch:join', { branchId });
  }
  return s;
}

export function disconnectSocket() {
  if (socket?.connected) socket.disconnect();
}
