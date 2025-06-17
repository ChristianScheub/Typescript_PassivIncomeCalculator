import React from 'react';
import { Button, ButtonProps } from './Button';
import { cn } from '../../utils/cn';

export interface IconButtonProps extends Omit<ButtonProps, 'children' | 'startIcon' | 'endIcon'> {
  /** Icon to display */
  icon: React.ReactNode;
  /** Accessible label for screen readers */
  'aria-label': string;
  /** Optional tooltip text */
  tooltip?: string;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, className, size = "icon", variant = "ghost", rounded = "full", ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn("flex-shrink-0", className)}
        size={size}
        variant={variant}
        rounded={rounded}
        {...props}
      >
        {icon}
      </Button>
    );
  }
);
IconButton.displayName = "IconButton";

export { IconButton };
