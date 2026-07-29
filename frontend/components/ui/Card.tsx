import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glassmorphism?: boolean;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  glassmorphism = true,
  hoverEffect = false,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'rounded-xl border p-6 transition-all duration-300',
          glassmorphism
            ? 'bg-slate-900/60 backdrop-blur-md border-slate-800/80 shadow-xl'
            : 'bg-slate-900 border-slate-800 shadow-md',
          hoverEffect && 'hover:-translate-y-1 hover:border-indigo-500/50 hover:shadow-indigo-500/10',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={twMerge('mb-4 pb-3 border-b border-slate-800', className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className, ...props }) => (
  <h3 className={twMerge('text-lg font-semibold text-slate-100', className)} {...props}>
    {children}
  </h3>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={twMerge('text-slate-300 text-sm leading-relaxed', className)} {...props}>
    {children}
  </div>
);
