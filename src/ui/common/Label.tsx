import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  {
    variants: {
      variant: {
        default: "text-gray-700 dark:text-gray-300",
        error: "text-red-600 dark:text-red-400",
        success: "text-green-600 dark:text-green-400"
      },
      size: {
        default: "text-sm",
        sm: "text-xs",
        lg: "text-base"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement>, VariantProps<typeof labelVariants> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <label
        className={cn(labelVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Label.displayName = "Label";

export { Label, labelVariants };
