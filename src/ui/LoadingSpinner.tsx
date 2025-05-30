import React from 'react';
import { cn } from '../utils/cn';

interface LoadingSpinnerProps {
  className?: string;
  /** Size in pixels, default 48 (12 * 4) */
  size?: number;
  /** Color using tailwind classes, default border-blue-500 */
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  className,
  size = 48,
  color = 'border-blue-500'
}) => {
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
          color
        )}
        style={{
          width: `${size}px`,
          height: `${size}px`
        }}
      />
    </div>
  );
};
