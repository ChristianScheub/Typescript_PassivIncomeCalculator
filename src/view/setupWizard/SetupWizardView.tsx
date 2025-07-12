import React from 'react';
import SetupWizardLayout from '@ui/setupWizard/SetupWizardLayout';
import { WizardStep, WizardProgress, StepNavigationOptions, StepDataCollection, AssetTemplate, CustomAssetDefinition, SimplifiedTransaction, SimplifiedLiability, SimplifiedIncome, ImportValidationResult } from '@/types/domains/setupWizard';

// Step Components
import WelcomeStep from './steps/WelcomeStep';
import AssetDefinitionsStep from './steps/AssetDefinitionsStep';
import TransactionsStep from './steps/TransactionsStep';
import LiabilitiesStep from './steps/LiabilitiesStep';
import IncomeStep from './steps/IncomeStep';
import CompletionStep from './steps/CompletionStep';

interface SetupWizardViewProps {
  currentStep: WizardStep;
  progress: WizardProgress;
  navigationOptions: StepNavigationOptions;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  isLoading?: boolean;
  
  // Step data
  stepData: StepDataCollection;
  
  // Welcome step props
  onUpdateWelcomeStepData?: (data: Partial<any>) => void;
  onFileSelect?: (file: File, type: 'csv' | 'json') => void;
  onValidationResult?: (result: ImportValidationResult) => void;
  
  // Asset definitions step props
  availableTemplates?: AssetTemplate[];
  popularTemplates?: AssetTemplate[];
  onUpdateAssetDefinitionsStepData?: (data: Partial<any>) => void;
  onAddTemplate?: (template: AssetTemplate) => void;
  onRemoveTemplate?: (templateId: string) => void;
  onAddCustomAsset?: (asset: CustomAssetDefinition) => void;
  onRemoveCustomAsset?: (index: number) => void;
  
  // Transactions step props
  availableAssets?: (AssetTemplate | CustomAssetDefinition)[];
  onUpdateTransactionsStepData?: (data: Partial<any>) => void;
  onAddTransaction?: (transaction: SimplifiedTransaction) => void;
  onRemoveTransaction?: (index: number) => void;
  
  // Liabilities step props
  onUpdateLiabilitiesStepData?: (data: Partial<any>) => void;
  onAddLiability?: (liability: SimplifiedLiability) => void;
  onRemoveLiability?: (index: number) => void;
  
  // Income step props
  onUpdateIncomeStepData?: (data: Partial<any>) => void;
  onAddIncome?: (income: SimplifiedIncome) => void;
  onRemoveIncome?: (index: number) => void;
  
  // Completion step props
  onComplete?: () => void;
}

const SetupWizardView: React.FC<SetupWizardViewProps> = ({
  currentStep,
  progress,
  navigationOptions,
  onNext,
  onBack,
  onSkip,
  isLoading = false,
  stepData,
  // Welcome step props
  onUpdateWelcomeStepData = () => {},
  onFileSelect = () => {},
  onValidationResult = () => {},
  // Asset definitions step props
  availableTemplates = [],
  popularTemplates = [],
  onUpdateAssetDefinitionsStepData = () => {},
  onAddTemplate = () => {},
  onRemoveTemplate = () => {},
  onAddCustomAsset = () => {},
  onRemoveCustomAsset = () => {},
  // Transactions step props
  availableAssets = [],
  onUpdateTransactionsStepData = () => {},
  onAddTransaction = () => {},
  onRemoveTransaction = () => {},
  // Liabilities step props
  onUpdateLiabilitiesStepData = () => {},
  onAddLiability = () => {},
  onRemoveLiability = () => {},
  // Income step props
  onUpdateIncomeStepData = () => {},
  onAddIncome = () => {},
  onRemoveIncome = () => {},
  // Completion step props
  onComplete = () => {}
}) => {
  const renderCurrentStep = () => {
    switch (currentStep) {
      case WizardStep.WELCOME:
        return (
          <WelcomeStep
            stepData={stepData.welcome}
            onUpdateStepData={onUpdateWelcomeStepData}
            onFileSelect={onFileSelect}
            onValidationResult={onValidationResult}
          />
        );
      case WizardStep.ASSET_DEFINITIONS:
        return (
          <AssetDefinitionsStep
            stepData={stepData.assetDefinitions}
            availableTemplates={availableTemplates}
            popularTemplates={popularTemplates}
            onUpdateStepData={onUpdateAssetDefinitionsStepData}
            onAddTemplate={onAddTemplate}
            onRemoveTemplate={onRemoveTemplate}
            onAddCustomAsset={onAddCustomAsset}
            onRemoveCustomAsset={onRemoveCustomAsset}
          />
        );
      case WizardStep.TRANSACTIONS:
        return (
          <TransactionsStep
            stepData={stepData.transactions}
            availableAssets={availableAssets}
            onUpdateStepData={onUpdateTransactionsStepData}
            onAddTransaction={onAddTransaction}
            onRemoveTransaction={onRemoveTransaction}
            onFileSelect={onFileSelect}
          />
        );
      case WizardStep.LIABILITIES:
        return (
          <LiabilitiesStep
            stepData={stepData.liabilities}
            onUpdateStepData={onUpdateLiabilitiesStepData}
            onAddLiability={onAddLiability}
            onRemoveLiability={onRemoveLiability}
          />
        );
      case WizardStep.INCOME:
        return (
          <IncomeStep
            stepData={stepData.income}
            onUpdateStepData={onUpdateIncomeStepData}
            onAddIncome={onAddIncome}
            onRemoveIncome={onRemoveIncome}
          />
        );
      case WizardStep.COMPLETION:
        return (
          <CompletionStep
            stepData={stepData}
            onComplete={onComplete}
            isLoading={isLoading}
          />
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <SetupWizardLayout
      progress={progress}
      navigationOptions={navigationOptions}
      onNext={onNext}
      onBack={onBack}
      onSkip={onSkip}
      isLoading={isLoading}
    >
      {renderCurrentStep()}
    </SetupWizardLayout>
  );
};

export default SetupWizardView;