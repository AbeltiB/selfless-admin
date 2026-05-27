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
      const { accountType, accessToken, user, customer } = res.data.data;

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

    // Expose callback before injecting widget script
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
      const axiosErr = err as { response?: { data?: { message?: string; error?: { message?: string } } } };
      setError(axiosErr.response?.data?.message || axiosErr.response?.data?.error?.message || 'Login failed — check API is running');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-900/30">
            <span className="text-white text-2xl font-bold">S</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">SelfLess</h1>
          <p className="text-slate-400 mt-2 text-sm">Service Orchestration Platform</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-semibold text-slate-800 mb-1">Sign in</h2>
          <p className="text-sm text-slate-500 mb-6">Access the admin portal</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
              <span className="mt-0.5">⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* Telegram Login Widget */}
          {BOT_USERNAME ? (
            <>
              <div className="flex justify-center mb-4">
                {tgLoading ? (
                  <div className="flex items-center gap-2 py-2.5 px-5 bg-[#54a9eb] text-white rounded-lg text-sm font-medium">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in with Telegram...
                  </div>
                ) : (
                  <div ref={tgContainerRef} />
                )}
              </div>

              <div className="flex items-center gap-3 mb-4">
                <hr className="flex-1 border-slate-200" />
                <span className="text-xs text-slate-400">or sign in with email</span>
                <hr className="flex-1 border-slate-200" />
              </div>
            </>
          ) : (
            <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs">
              Telegram login not configured. Set <code>NEXT_PUBLIC_TELEGRAM_BOT_USERNAME</code> to enable it.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="admin@selfless.io"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 pr-10 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600 transition-colors"
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
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <p className="text-center text-xs text-slate-400">
              Demo credentials: admin@selfless.io / Admin@123
            </p>
          </div>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          &copy; {new Date().getFullYear()} SelfLess Platform. All rights reserved.
        </p>
      </div>
    </div>
  );
}
