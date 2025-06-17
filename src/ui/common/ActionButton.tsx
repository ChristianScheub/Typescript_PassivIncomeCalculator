import React from 'react';
import { Button, ButtonProps } from './Button';
import { cn } from '../../utils/cn';

interface BaseActionButtonProps {
  /** Button text */
  children: React.ReactNode;
  /** Loading state */
  loading?: boolean;
  /** Icon to display */
  icon?: React.ReactNode;
  className?: string;
}

interface PrimaryActionButtonProps extends BaseActionButtonProps {
  variant: 'primary';
  onClick: () => void;
}

interface SecondaryActionButtonProps extends BaseActionButtonProps {
  variant: 'secondary';
  onClick: () => void;
}

interface DestructiveActionButtonProps extends BaseActionButtonProps {
  variant: 'destructive';
  onClick: () => void;
}

interface CancelActionButtonProps extends BaseActionButtonProps {
  variant: 'cancel';
  onClick: () => void;
}

type ActionButtonProps = 
  | PrimaryActionButtonProps 
  | SecondaryActionButtonProps 
  | DestructiveActionButtonProps 
  | CancelActionButtonProps;

export const ActionButton: React.FC<ActionButtonProps> = ({ 
  variant, 
  children, 
  icon, 
  loading, 
  className,
  onClick 
}) => {
  const getButtonVariant = (): ButtonProps['variant'] => {
    switch (variant) {
      case 'primary':
        return 'default';
      case 'secondary':
        return 'outline';
      case 'destructive':
        return 'destructive';
      case 'cancel':
        return 'ghost';
      default:
        return 'default';
    }
  };

  return (
    <Button
      variant={getButtonVariant()}
      onClick={onClick}
      loading={loading}
      startIcon={icon}
      className={cn(
        variant === 'cancel' && "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200",
        className
      )}
    >
      {children}
    </Button>
  );
};

// Convenience components for common patterns
export const SaveButton: React.FC<Omit<PrimaryActionButtonProps, 'variant'>> = (props) => (
  <ActionButton variant="primary" {...props} />
);

export const CancelButton: React.FC<Omit<CancelActionButtonProps, 'variant'>> = (props) => (
  <ActionButton variant="cancel" {...props} />
);

export const DeleteButton: React.FC<Omit<DestructiveActionButtonProps, 'variant'>> = (props) => (
  <ActionButton variant="destructive" {...props} />
);
