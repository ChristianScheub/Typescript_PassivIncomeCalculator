import { 
  StepDataCollection, 
  StepNavigationOptions,
  WizardProgress,
  ImportDataResult,
  ImportValidationResult,
  AssetTemplate
} from '@/types/domains/setupWizard';
import { WizardStep } from '@/types/shared/base/enums';

export interface ISetupWizardService {
  /**
   * Get the configuration for wizard steps
   */
  getStepsConfiguration(): StepConfig[];
  
  /**
   * Calculate wizard progress based on current state
   */
  calculateProgress(currentStep: WizardStep, completedSteps: WizardStep[], skippedSteps: WizardStep[]): WizardProgress;
  
  /**
   * Get navigation options for a specific step
   */
  getNavigationOptions(step: WizardStep, stepData: StepDataCollection): StepNavigationOptions;
  
  /**
   * Get predefined asset templates
   */
  getAssetTemplates(): AssetTemplate[];
  
  /**
   * Get popular asset templates
   */
  getPopularAssetTemplates(): AssetTemplate[];
  
  /**
   * Import data from file
   */
  importDataFromFile(file: File, type: 'csv' | 'json'): Promise<ImportDataResult>;
  
  /**
   * Validate imported data
   */
  validateImportedData(data: ImportDataResult['data']): ImportValidationResult;
  
  /**
   * Save wizard data to the main application state
   */
  saveWizardData(stepData: StepDataCollection): Promise<boolean>;
  
  /**
   * Get recommended next step based on current state
   */
  getRecommendedNextStep(currentStep: WizardStep, stepData: StepDataCollection): WizardStep | null;
}

export interface StepConfig {
  step: WizardStep;
  title: string;
  description: string;
  isOptional: boolean;
  isConditional: boolean;
  conditionKey?: keyof StepDataCollection;
}