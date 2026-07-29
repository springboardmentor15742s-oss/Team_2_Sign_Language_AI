import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Section: React.FC<React.HTMLAttributes<HTMLElement>> = ({ children, className, ...props }) => (
  <section className={twMerge(clsx('py-16 md:py-24 relative overflow-hidden', className))} {...props}>
    {children}
  </section>
);
