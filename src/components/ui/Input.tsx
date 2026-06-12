import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-[13px] font-medium text-ct-700 mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full h-9 px-3 border rounded-lg text-sm text-ct-900 placeholder-ct-400 bg-white transition-shadow',
            'focus:outline-none focus:ring-2 focus:ring-ct-900/10 focus:border-ct-400',
            error ? 'border-status-danger' : 'border-ct-300',
            className,
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-status-danger-text">{error}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';
