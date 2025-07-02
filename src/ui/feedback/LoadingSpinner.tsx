import React from 'react';
import { cn } from '@/utils/cn';

interface LoadingSpinnerProps {
  className?: string;
  /** Size in pixels, default 48 (12 * 4) */
  size?: number;
  /** Color using tailwind classes, default will adapt to theme */
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  className,
  size = 48,
  color
}) => {
  // Default color adapts to dark/light theme
  const defaultColor = color || 'border-blue-500 dark:border-blue-400';
  
  return (
    <div
      className={cn(
        "flex justify-center items-center",
        className
      )}
    >
      <div
        className={cn(
          "animate-spin rounded-full border-b-2",
          defaultColor
        )}
        style={{
          width: `${size}px`,
          height: `${size}px`
        }}
      />
    </div>
  );
};
