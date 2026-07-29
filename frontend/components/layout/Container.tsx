import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Container: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={twMerge(clsx('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8', className))} {...props}>
    {children}
  </div>
);
