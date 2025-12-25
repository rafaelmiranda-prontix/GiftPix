import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 disabled:cursor-not-allowed',
  {
    variants: {
      intent: {
        primary:
          'bg-blue-600 text-white shadow-sm hover:bg-blue-500 focus-visible:outline-blue-700 focus-visible:ring-4 focus-visible:ring-blue-200',
        secondary:
          'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 focus-visible:outline-blue-700 focus-visible:ring-4 focus-visible:ring-blue-100',
        ghost: 'bg-transparent text-slate-900 hover:bg-blue-50',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-11 px-5 text-base',
      },
    },
    defaultVariants: {
      intent: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, intent, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ intent, size }), className)} {...props} />
  )
);
Button.displayName = 'Button';

export { buttonVariants };
