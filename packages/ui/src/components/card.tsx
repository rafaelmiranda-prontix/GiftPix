import * as React from 'react';
import { cn } from '../lib/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = ({ className, ...props }: CardProps) => (
  <div
    className={cn(
      'rounded-2xl border border-slate-200 bg-white/60 p-6 shadow-sm backdrop-blur',
      className
    )}
    {...props}
  />
);
