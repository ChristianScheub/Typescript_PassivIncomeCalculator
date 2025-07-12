import React from 'react';
import { useTranslation } from 'react-i18next';
import { StepNavigationOptions } from '@/types/domains/setupWizard';

interface StepNavigationProps {
  navigationOptions: StepNavigationOptions;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  isLoading?: boolean;
  nextButtonText?: string;
  backButtonText?: string;
  skipButtonText?: string;
  className?: string;
}

const StepNavigation: React.FC<StepNavigationProps> = ({
  navigationOptions,
  onNext,
  onBack,
  onSkip,
  isLoading = false,
  nextButtonText,
  backButtonText,
  skipButtonText,
  className = ''
}) => {
  const { t } = useTranslation();
  
  const defaultNextText = nextButtonText || t('setupWizard.general.navigation.next');
  const defaultBackText = backButtonText || t('setupWizard.general.navigation.back');
  const defaultSkipText = skipButtonText || t('setupWizard.general.navigation.skip');
  return (
    <div className={`pt-6 border-t border-gray-200 ${className}`}>
      {/* Mobile First Layout */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        
        {/* Back Button */}
        <div className="order-2 sm:order-1">
          {navigationOptions.canGoBack ? (
            <button
              type="button"
              onClick={onBack}
              disabled={isLoading}
              className="w-full sm:w-auto px-4 py-3 sm:py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {defaultBackText}
            </button>
          ) : (
            <div className="hidden sm:block"></div>
          )}
        </div>

        {/* Skip Button - Center on mobile, center on desktop */}
        <div className="order-3 sm:order-2">
          {navigationOptions.canSkip && (
            <button
              type="button"
              onClick={onSkip}
              disabled={isLoading}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-center"
            >
              {defaultSkipText}
            </button>
          )}
        </div>

        {/* Next Button - Primary action, first on mobile */}
        <div className="order-1 sm:order-3">
          {navigationOptions.canGoNext ? (
            <button
              type="button"
              onClick={onNext}
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-3 sm:py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  {defaultNextText}
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          ) : (
            <div className="hidden sm:block"></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StepNavigation;