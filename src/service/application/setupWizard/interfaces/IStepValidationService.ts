import { 
  StepDataCollection, 
  WizardValidationResult 
} from '@/types/domains/setupWizard';
import { WizardStep } from '@/types/shared/base/enums';

export interface IStepValidationService {
  /**
   * Validate a specific step's data
   */
  validateStep(step: WizardStep, stepData: StepDataCollection): WizardValidationResult;
  
  /**
   * Validate welcome step data
   */
  validateWelcomeStep(stepData: StepDataCollection): WizardValidationResult;
  
  /**
   * Validate asset definitions step data
   */
  validateAssetDefinitionsStep(stepData: StepDataCollection): WizardValidationResult;
  
  /**
   * Validate transactions step data
   */
  validateTransactionsStep(stepData: StepDataCollection): WizardValidationResult;
  
  /**
   * Validate liabilities step data
   */
  validateLiabilitiesStep(stepData: StepDataCollection): WizardValidationResult;
  
  /**
   * Validate income step data
   */
  validateIncomeStep(stepData: StepDataCollection): WizardValidationResult;
  
  /**
   * Validate all steps data for completion
   */
  validateAllSteps(stepData: StepDataCollection): WizardValidationResult;
}