import React from 'react';
import { NavLink } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface NavLinkItemProps {
  /** Navigation path */
  to: string;
  /** Icon component */
  icon: LucideIcon;
  /** Display label */
  label: string;
  /** Layout variant */
  variant: 'desktop' | 'mobile';
  /** Whether this should match exactly */
  end?: boolean;
}

export const NavLinkItem: React.FC<NavLinkItemProps> = ({
  to,
  icon: Icon,
  label,
  variant,
  end = false
}) => {
  const baseClasses = "flex items-center transition-colors duration-200";
  
  const variantClasses = {
    desktop: "px-3 py-2 rounded-lg text-sm font-medium w-full hover:bg-gray-100 dark:hover:bg-gray-700",
    mobile: "flex-col justify-center h-16 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
  };
  
  const activeClasses = "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20";
  const inactiveClasses = "text-gray-700 dark:text-gray-300";

  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          baseClasses,
          variantClasses[variant],
          isActive ? activeClasses : inactiveClasses
        )
      }
    >
      <Icon className={cn(
        variant === 'desktop' ? "w-5 h-5 mr-3" : "w-6 h-6 mb-1"
      )} />
      {variant === 'desktop' ? (
        <span>{label}</span>
      ) : (
        <span className="text-center leading-tight">{label}</span>
      )}
    </NavLink>
  );
};
