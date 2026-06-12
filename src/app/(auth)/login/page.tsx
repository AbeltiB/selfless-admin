'use client';
import { useState, FormEvent, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { authStorage } from '@/lib/auth';
import type { TelegramAuthData } from 'selfless-sdk';
import toast from 'react-hot-toast';

const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

declare global {
  interface Window {
    onTelegramAuth: (data: TelegramAuthData) => void;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState('admin@selfless.io');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tgLoading, setTgLoading] = useState(false);
  const [error, setError] = useState('');
  const tgContainerRef = useRef<HTMLDivElement>(null);

  const handleTelegramAuth = async (data: TelegramAuthData) => {
    setTgLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/telegram', data);
      const { accountType, accessToken, user } = res.data.data;

      if (accountType === 'staff') {
        authStorage.setToken(accessToken);
        authStorage.setUser(user);
        setAuth(accessToken, user);
        toast.success('Welcome back!');
        router.push('/dashboard');
      } else {
        setError('This Telegram account is not linked to a staff account. Contact your administrator.');
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Telegram login failed');
    } finally {
      setTgLoading(false);
    }
  };

  useEffect(() => {
    if (!BOT_USERNAME || !tgContainerRef.current) return;

    window.onTelegramAuth = handleTelegramAuth;

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', BOT_USERNAME);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    script.async = true;

    tgContainerRef.current.innerHTML = '';
    tgContainerRef.current.appendChild(script);

    return () => {
      delete (window as any).onTelegramAuth;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      const { accessToken, user } = res.data.data;
      authStorage.setToken(accessToken);
      authStorage.setUser(user);
      setAuth(accessToken, user);
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: { message?: string; error?: { message?: string } } };
      };
      setError(
        axiosErr.response?.data?.message ||
          axiosErr.response?.data?.error?.message ||
          'Could not reach the server. Please try again in a moment.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ct-50 p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-11 h-11 bg-ct-900 rounded-xl flex items-center justify-center text-white text-lg font-bold mb-4 shadow-sm">
            S
          </div>
          <h1 className="text-xl font-semibold text-ct-900 tracking-tight">Sign in to SelfLess</h1>
          <p className="text-[13px] text-ct-400 mt-1">Service orchestration platform</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-ct-200 shadow-sm p-6">
          {error && (
            <div className="mb-4 px-3 py-2.5 rounded-lg bg-status-danger-bg border border-red-200 text-status-danger-text text-[13px]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-ct-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 px-3 border border-ct-300 rounded-lg text-sm text-ct-900 placeholder-ct-400 focus:outline-none focus:ring-2 focus:ring-ct-900/10 focus:border-ct-400 transition-shadow"
                placeholder="you@company.com"
                required
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-ct-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 px-3 pr-10 border border-ct-300 rounded-lg text-sm text-ct-900 focus:outline-none focus:ring-2 focus:ring-ct-900/10 focus:border-ct-400 transition-shadow"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-ct-400 hover:text-ct-700 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-ct-900 hover:bg-ct-700 disabled:bg-ct-300 disabled:text-ct-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Telegram */}
          {BOT_USERNAME && (
            <>
              <div className="flex items-center gap-3 my-5">
                <hr className="flex-1 border-ct-200" />
                <span className="text-[11px] text-ct-400 uppercase tracking-wider">or</span>
                <hr className="flex-1 border-ct-200" />
              </div>
              <div className="flex justify-center">
                {tgLoading ? (
                  <div className="flex items-center gap-2 h-10 px-5 bg-[#54a9eb] text-white rounded-lg text-sm font-medium">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in with Telegram…
                  </div>
                ) : (
                  <div ref={tgContainerRef} />
                )}
              </div>
            </>
          )}
        </div>

        <p className="text-center text-ct-400 text-xs mt-6">
          Demo: admin@selfless.io / Admin@123
        </p>
      </div>
    </div>
  );
}
