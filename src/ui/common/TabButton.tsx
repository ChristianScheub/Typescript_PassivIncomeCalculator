import React from 'react';
import { Button, ButtonProps } from './Button';
import { cn } from '@/utils/cn';

interface TabButtonProps extends Omit<ButtonProps, 'variant'> {
  /** Whether this tab is currently active */
  isActive?: boolean;
  /** Tab content */
  children: React.ReactNode;
}

export const TabButton: React.FC<TabButtonProps> = ({
  isActive = false,
  children,
  className,
  ...props
}) => {
  return (
    <Button
      variant={isActive ? "default" : "ghost"}
      size="sm"
      className={cn(
        "transition-colors duration-200",
        isActive 
          ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm" 
          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
};
interface TabGroupProps {
  /** Tab buttons to display */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export const TabGroup: React.FC<TabGroupProps> = ({ children, className }) => {
  return (
    <div className={cn("flex justify-center", className)}>
      <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-1 space-x-1">
        {children}
      </div>
    </div>
  );
};
