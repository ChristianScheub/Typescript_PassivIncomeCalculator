import React from 'react';
import { Button } from '../shared/Button';
import { LucideIcon } from 'lucide-react';

export interface HeaderButton {
  /** Unique identifier for the button */
  id: string;
  /** Icon component to display */
  icon: LucideIcon;
  /** Button label text (for desktop) */
  label: string;
  /** Button click handler */
  onClick: () => void;
  /** Whether the button is currently loading/disabled */
  loading?: boolean;
  /** Button variant */
  variant?: 'default' | 'outline' | 'secondary';
  /** Custom tooltip (for mobile icons) */
  tooltip?: string;
}

interface HeaderButtonGroupProps {
  /** Array of buttons to display */
  buttons: HeaderButton[];
  /** Whether to show in desktop mode (with labels) */
  isDesktop?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export const HeaderButtonGroup: React.FC<HeaderButtonGroupProps> = ({
  buttons,
  isDesktop = true,
  className = ''
}) => {
  return (
    <div className={`flex space-x-2 ${className}`}>
      {buttons.map(({ id, icon: Icon, label, onClick, loading = false, variant = 'outline', tooltip }) => (
        <Button
          key={id}
          variant={variant}
          onClick={onClick}
          loading={loading}
          title={!isDesktop ? tooltip || label : undefined}
          startIcon={<Icon className="h-4 w-4" />}
          size={isDesktop ? "default" : "icon"}
        >
          {isDesktop ? label : null}
        </Button>
      ))}
    </div>
  );
};
