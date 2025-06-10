import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ViewHeaderProps {
  /** The title of the view */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Optional back button handler */
  onBack?: () => void;
  /** Content to display on the right side of the header */
  rightContent?: React.ReactNode;
  /** Whether to show the header in mobile layout (stacked) */
  isMobile?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export const ViewHeader: React.FC<ViewHeaderProps> = ({
  title,
  subtitle,
  onBack,
  rightContent,
  isMobile = false,
  className = ''
}) => {
  const { t } = useTranslation();

  // Consistent layout: Back button above title, actions on the right
  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              {!isMobile && t('common.back')}
            </button>
          )}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {title}
          </h1>
          {subtitle && (
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {rightContent && (
          <div className="flex gap-2">
            {rightContent}
          </div>
        )}
      </div>
    </div>
  );
};
