'use client';
import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: 'sm' | 'md' | 'lg';
}

const widths = { sm: 'w-96', md: 'w-[480px]', lg: 'w-[600px]' };

export function Drawer({ open, onClose, title, subtitle, children, width = 'md' }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-ct-950/20 backdrop-blur-[1px] transition-opacity duration-200',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex flex-col bg-white border-l border-ct-200 shadow-2xl transition-transform duration-250',
          widths[width],
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-ct-100 shrink-0">
          <div>
            <h2 className="text-[15px] font-semibold text-ct-900 leading-snug">{title}</h2>
            {subtitle && <p className="text-xs text-ct-400 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ct-400 hover:text-ct-900 hover:bg-ct-100 transition-colors mt-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </>
  );
}
