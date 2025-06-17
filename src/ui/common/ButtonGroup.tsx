import React from 'react';
import { cn } from '../../utils/cn';
import { Button } from './Button';

interface ButtonGroupProps {
  /** Buttons to display */
  children: React.ReactNode;
  /** Layout orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Size of the group */
  size?: 'sm' | 'default' | 'lg';
  /** Whether buttons should be attached (no gap) */
  attached?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  orientation = 'horizontal',
  size = 'default',
  attached = false,
  className
}) => {
  const isHorizontal = orientation === 'horizontal';
  
  return (
    <div
      className={cn(
        "flex",
        isHorizontal ? "flex-row" : "flex-col",
        attached ? (isHorizontal ? "space-x-0" : "space-y-0") : (
          size === 'sm' 
            ? (isHorizontal ? "space-x-2" : "space-y-2")
            : size === 'lg'
            ? (isHorizontal ? "space-x-4" : "space-y-4") 
            : (isHorizontal ? "space-x-3" : "space-y-3")
        ),
        attached && "[&>*:not(:first-child)]:border-l-0 [&>*:not(:last-child)]:rounded-r-none [&>*:not(:first-child)]:rounded-l-none",
        className
      )}
      role="group"
    >
      {children}
    </div>
  );
};

// Specialized components for common use cases
export const SaveCancelGroup: React.FC<{
  onSave: () => void;
  onCancel: () => void;
  saveLabel?: string;
  cancelLabel?: string;
  saveLoading?: boolean;
  saveDisabled?: boolean;
  className?: string;
}> = ({
  onSave,
  onCancel,
  saveLabel = "Save",
  cancelLabel = "Cancel", 
  saveLoading,
  saveDisabled,
  className
}) => {
  return (
    <ButtonGroup className={cn("justify-end", className)}>
      <Button
        variant="outline"
        onClick={onCancel}
      >
        {cancelLabel}
      </Button>
      <Button
        onClick={onSave}
        disabled={saveDisabled}
        loading={saveLoading}
      >
        {saveLabel}
      </Button>
    </ButtonGroup>
  );
};
