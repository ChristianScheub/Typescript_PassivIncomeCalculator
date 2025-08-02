import { IStepValidationService } from '../../interfaces/IStepValidationService';
import { 
  validateStep,
  validateWelcomeStep,
  validateAssetDefinitionsStep,
  validateTransactionsStep,
  validateLiabilitiesStep,
  validateIncomeStep,
  validateAllSteps
} from './methods/stepValidationMethods';

// Create stepValidationService as a functional object
const stepValidationService: IStepValidationService = {
  validateStep,
  validateWelcomeStep,
  validateAssetDefinitionsStep,
  validateTransactionsStep,
  validateLiabilitiesStep,
  validateIncomeStep,
  validateAllSteps
};

// Export the service interface and implementation
export { stepValidationService };

// Export default instance for direct use
export default stepValidationService;

// Export individual methods for direct use if needed
export {
  validateStep,
  validateWelcomeStep,
  validateAssetDefinitionsStep,
  validateTransactionsStep,
  validateLiabilitiesStep,
  validateIncomeStep,
  validateAllSteps
};