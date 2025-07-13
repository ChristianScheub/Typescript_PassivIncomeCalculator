import React from "react";
import { useTranslation } from "react-i18next";
import StepIndicator from "./StepIndicator";
import StepNavigation from "./StepNavigation";
import {
  WizardProgress,
  StepNavigationOptions,
} from "@/types/domains/setupWizard";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../shared";

interface SetupWizardLayoutProps {
  children: React.ReactNode;
  progress: WizardProgress;
  navigationOptions: StepNavigationOptions;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  isLoading?: boolean;
  title?: string;
  description?: string;
  showProgressIndicator?: boolean;
  className?: string;
}

const SetupWizardLayout: React.FC<SetupWizardLayoutProps> = ({
  children,
  progress,
  navigationOptions,
  onNext,
  onBack,
  onSkip,
  isLoading = false,
  title,
  description,
  showProgressIndicator = true,
  className = "",
}) => {
  const { t } = useTranslation();
  const currentStepConfig = progress.stepsConfig[progress.currentStepIndex];
  const displayTitle = title || (currentStepConfig?.title ? t(currentStepConfig.title) : '');
  const displayDescription = description || (currentStepConfig?.description ? t(currentStepConfig.description) : '');

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header - Mobile Optimized */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {t("setupWizard.general.title")}
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              {t("setupWizard.general.subtitle")}
            </p>
          </div>

          {/* Progress Indicator */}
          {showProgressIndicator && (
            <div className="mt-6 sm:mt-8">
              <StepIndicator progress={progress} />
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Mobile First */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Card className="shadow-sm sm:shadow-lg">
          {/* Step Header */}
          {displayTitle !== "Welcome" && (
            <CardHeader className="text-center border-b border-gray-200">
              <CardTitle>{displayTitle}</CardTitle>
              {displayDescription && (
                <CardDescription className="text-sm sm:text-base">
                  {displayDescription}
                </CardDescription>
              )}
            </CardHeader>
          )}

          {/* Step Content - Mobile Optimized */}
          <CardContent className="py-6 sm:py-8">
            <div className="max-w-2xl mx-auto">{children}</div>
          </CardContent>

          {/* Navigation - Mobile First */}
          <CardFooter className="flex-col">
            <StepNavigation
              navigationOptions={navigationOptions}
              onNext={onNext}
              onBack={onBack}
              onSkip={onSkip}
              isLoading={isLoading}
            />
          </CardFooter>
        </Card>
      </div>

      {/* Auto-save Indicator - Mobile Optimized */}
      {isLoading && (
        <div className="fixed bottom-4 right-4 bg-blue-100 border border-blue-300 rounded-lg px-3 sm:px-4 py-2 shadow-lg">
          <div className="flex items-center">
            <svg
              className="animate-spin h-4 w-4 text-blue-600 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="text-blue-800 text-sm">{t('setupWizard.progress.saving')}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SetupWizardLayout;
