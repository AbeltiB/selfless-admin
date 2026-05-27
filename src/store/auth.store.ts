import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { JwtStaffPayload } from 'selfless-sdk';

interface AuthState {
  user: JwtStaffPayload | null;
  token: string | null;
  setAuth: (token: string, user: JwtStaffPayload) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (token, user) => set({ token, user }),
      clearAuth: () => set({ token: null, user: null }),
      isAuthenticated: () => !!get().token,
    }),
    { name: 'selfless-auth' },
  ),
);
