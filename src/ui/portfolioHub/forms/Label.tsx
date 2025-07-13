import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

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

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement>, VariantProps<typeof labelVariants> {
  /**
   * The ID of the form control that this label is associated with.
   * This is required for accessibility - use either htmlFor or wrap the control as a child.
   */
  htmlFor?: string;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, variant, size, htmlFor, children, ...props }, ref) => {
    // Development warning for accessibility
    if (process.env.NODE_ENV === 'development') {
      if (!htmlFor && !children) {
        console.warn(
          'Label component should either have an htmlFor prop pointing to a form control ID, ' +
          'or wrap the form control as a child for proper accessibility.'
        );
      }
    }

    return (
      <label
        className={cn(labelVariants({ variant, size, className }))}
        htmlFor={htmlFor}
        ref={ref}
        {...props}
      >
        {children}
      </label>
    );
  }
);
Label.displayName = "Label";

// eslint-disable-next-line react-refresh/only-export-components
export { Label, labelVariants };