import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'indigo' | 'green' | 'yellow' | 'red' | 'gray';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'indigo', className, ...props }) => {
  const variants = {
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    yellow: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    red: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    gray: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  return (
    <span
      className={twMerge(
        clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border', variants[variant], className)
      )}
      {...props}
    >
      {children}
    </span>
  );
};
