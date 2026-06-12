import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variants = {
  primary:
    'bg-ct-900 hover:bg-ct-700 text-white shadow-sm disabled:bg-ct-300 disabled:text-ct-500',
  secondary:
    'bg-white hover:bg-ct-50 text-ct-900 border border-ct-300 shadow-sm disabled:text-ct-400',
  danger:
    'bg-status-danger hover:bg-red-600 text-white shadow-sm disabled:opacity-50',
  ghost:
    'bg-transparent hover:bg-ct-100 text-ct-500 hover:text-ct-900 disabled:text-ct-300',
  success:
    'bg-status-success hover:bg-emerald-600 text-white shadow-sm disabled:opacity-50',
};

const sizes = {
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-9 px-4 text-sm',
  lg: 'h-11 px-6 text-[15px]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors select-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ct-400 focus-visible:ring-offset-2',
        'active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="w-3.5 h-3.5 border-2 border-current/25 border-t-current rounded-full animate-spin" />
      )}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';
