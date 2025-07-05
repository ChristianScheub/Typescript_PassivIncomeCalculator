import React from 'react';
import { ChevronRight, Trash } from 'lucide-react';
import clsx from 'clsx';
import { TFunction } from 'i18next';
import { Button } from '../shared';

// LoadingSpinner component
const LoadingSpinner: React.FC = () => (
  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
);

// Helper function to get button text based on status
export const getButtonText = (status: string, t: TFunction, loadingKey: string, successKey: string, defaultKey: string): string => {
  if (status === 'loading' || status === 'saving' || status === 'clearing') {
    return t(loadingKey);
  }
  if (status === 'success' || status === 'saved') {
    return t(successKey);
  }
  return t(defaultKey);
};

// Helper function to get clear button icon
export const getClearButtonIcon = (status: ClearStatus) => {
  if (status === 'clearing') {
    return <LoadingSpinner />;
  }
  if (status === 'success') {
    return <span className="text-green-500">✓</span>;
  }
  return <Trash className="h-4 w-4 mr-2" />;
};

type ClearStatus = 'idle' | 'clearing' | 'success';

interface ClearButtonProps {
  status: ClearStatus;
  onClick: () => void;
  titleKey: string;
  descKey: string;
  t: TFunction;
}

export const ClearButton: React.FC<ClearButtonProps> = ({ status, onClick, titleKey, descKey, t }) => {
  const icon = getClearButtonIcon(status);
  
  return (
    <div>
      <Button
        variant="outline"
        className={clsx("w-full justify-between", {
          'bg-green-50 dark:bg-green-900/20 border-green-500': status === 'success'
        })}
        onClick={onClick}
        disabled={status === "clearing"}
      >
        <div className="text-left">
          <span className="flex items-center mb-1">
            {icon}
            {t(titleKey)}
          </span>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t(descKey)}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 flex-shrink-0" />
      </Button>
    </div>
  );
};

export default ClearButton;
export type { ClearStatus };
