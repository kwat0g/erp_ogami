import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-3 py-1 text-xs font-medium transition-all duration-200 shadow-sm',
  {
    variants: {
      variant: {
        default: 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100',
        secondary: 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100',
        destructive: 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100',
        outline: 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
        success: 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100',
        warning: 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
