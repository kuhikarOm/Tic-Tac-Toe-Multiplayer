import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'cyan' | 'magenta' | 'glass' | 'danger' | 'ghost' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'cyan',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'relative inline-flex items-center justify-center font-bold tracking-wide transition-all duration-200 select-none rounded-xl active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 focus:outline-none';

  const sizeStyles = {
    sm: 'px-3.5 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-7 py-3.5 text-base gap-2.5',
  };

  const variantStyles = {
    cyan: 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/40 hover:bg-neon-cyan/25 hover:border-neon-cyan hover:shadow-neon-cyan hover:-translate-y-0.5',
    magenta: 'bg-neon-magenta/15 text-neon-magenta border border-neon-magenta/40 hover:bg-neon-magenta/25 hover:border-neon-magenta hover:shadow-neon-magenta hover:-translate-y-0.5',
    glass: 'glass-panel text-gray-200 border-white/10 hover:border-white/20 hover:bg-white/10 hover:-translate-y-0.5',
    danger: 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30 hover:border-red-500 hover:-translate-y-0.5',
    ghost: 'text-gray-400 hover:text-white hover:bg-white/5',
    gold: 'bg-neon-yellow/15 text-neon-yellow border border-neon-yellow/40 hover:bg-neon-yellow/25 hover:border-neon-yellow hover:shadow-[0_0_15px_rgba(255,230,0,0.4)] hover:-translate-y-0.5',
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, sizeStyles[size], variantStyles[variant], className))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </span>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
