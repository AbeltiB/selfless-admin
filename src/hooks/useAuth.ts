'use client';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { authStorage } from '@/lib/auth';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export function useAuth() {
  const router = useRouter();
  const { user, token, setAuth, clearAuth, isAuthenticated } = useAuthStore();

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { accessToken, user: userData } = res.data.data;
    authStorage.setToken(accessToken);
    authStorage.setUser(userData);
    setAuth(accessToken, userData);
    return userData;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    }
    authStorage.clearToken();
    clearAuth();
    toast.success('Logged out');
    router.push('/login');
  };

  return { user, token, isAuthenticated, login, logout };
}
