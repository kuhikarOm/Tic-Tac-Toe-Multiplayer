import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  className,
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full text-left space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-wider text-gray-400"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 text-gray-400 pointer-events-none flex items-center justify-center">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          className={twMerge(
            clsx(
              'w-full bg-surface/80 border text-gray-100 placeholder-gray-500 rounded-xl px-4 py-3 text-sm transition-all duration-200 outline-none focus:ring-2',
              leftIcon ? 'pl-11' : 'pl-4',
              error
                ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20'
                : 'border-surface-border focus:border-neon-cyan focus:ring-neon-cyan/20 focus:shadow-[0_0_15px_rgba(0,240,255,0.15)]',
              className
            )
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-red-400 font-medium tracking-wide flex items-center gap-1 mt-1 animate-fadeIn">
          <span>⚠️</span> {error}
        </p>
      )}
    </div>
  );
};
