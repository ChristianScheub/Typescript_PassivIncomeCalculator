import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const inputVariants = cva(
  "flex w-full border rounded-md bg-background text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500",
        error: "border-red-500 dark:border-red-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-red-500 focus:border-red-500",
        success: "border-green-500 dark:border-green-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-green-500 focus:border-green-500"
      },
      size: {
        default: "px-3 py-2 h-10",
        sm: "px-2 py-1 h-8 text-xs",
        lg: "px-4 py-3 h-12"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

// Fix InputProps: Omit 'size' from InputHTMLAttributes to avoid conflict with VariantProps
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>, VariantProps<typeof inputVariants> {
  size?: 'default' | 'sm' | 'lg';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size = 'default', type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

// eslint-disable-next-line react-refresh/only-export-components
export { Input, inputVariants };
