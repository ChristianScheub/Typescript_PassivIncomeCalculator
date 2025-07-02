import React from 'react';
import { cn } from '@/utils/cn';
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

// Orientation-specific class generators
const horizontalButtonGroup = {
  getClasses: () => "flex-row",
  getSpacingClasses: (size: string) => {
    if (size === 'sm') return "space-x-2";
    if (size === 'lg') return "space-x-4";
    return "space-x-3";
  },
  getAttachedClasses: () => "space-x-0"
};

const verticalButtonGroup = {
  getClasses: () => "flex-col",
  getSpacingClasses: (size: string) => {
    if (size === 'sm') return "space-y-2";
    if (size === 'lg') return "space-y-4";
    return "space-y-3";
  },
  getAttachedClasses: () => "space-y-0"
};

const getAttachedBorderClasses = () => {
  return "[&>*:not(:first-child)]:border-l-0 [&>*:not(:last-child)]:rounded-r-none [&>*:not(:first-child)]:rounded-l-none";
};

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  orientation = 'horizontal',
  size = 'default',
  attached = false,
  className
}) => {
  // Select the appropriate strategy object based on orientation
  const strategy = orientation === 'horizontal' ? horizontalButtonGroup : verticalButtonGroup;
  
  const orientationClasses = strategy.getClasses();
  const spacingClasses = attached 
    ? strategy.getAttachedClasses()
    : strategy.getSpacingClasses(size);
  const attachedBorderClasses = attached ? getAttachedBorderClasses() : "";
  
  return (
    <fieldset
      className={cn(
        "flex border-0 p-0 m-0",
        orientationClasses,
        spacingClasses,
        attachedBorderClasses,
        className
      )}
    >
      {children}
    </fieldset>
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
