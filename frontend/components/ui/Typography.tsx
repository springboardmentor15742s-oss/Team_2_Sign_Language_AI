import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4;
}

export const Heading: React.FC<HeadingProps> = ({ level = 1, children, className, ...props }) => {
  const styles: Record<1 | 2 | 3 | 4, string> = {
    1: 'text-4xl md:text-5xl font-extrabold tracking-tight text-white',
    2: 'text-3xl font-bold tracking-tight text-slate-100',
    3: 'text-2xl font-semibold text-slate-200',
    4: 'text-xl font-medium text-slate-300',
  };

  const Tag = `h${level}` as React.ElementType;

  return (
    <Tag className={twMerge(clsx(styles[level], className))} {...props}>
      {children}
    </Tag>
  );
};

export const Paragraph: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ children, className, ...props }) => (
  <p className={twMerge('text-slate-400 text-base leading-relaxed', className)} {...props}>
    {children}
  </p>
);
