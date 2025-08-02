import { ISetupWizardService } from './interfaces/ISetupWizardService';
import { 
  getStepsConfiguration,
  calculateProgress,
  getNavigationOptions,
  getAssetTemplates,
  getPopularAssetTemplates,
  importDataFromFile,
  validateImportedData,
  saveWizardData,
  getRecommendedNextStep
} from './methods/setupWizardMethods';

// Create setupWizardService as a functional object
const setupWizardService: ISetupWizardService = {
  getStepsConfiguration,
  calculateProgress,
  getNavigationOptions,
  getAssetTemplates,
  getPopularAssetTemplates,
  importDataFromFile,
  validateImportedData,
  saveWizardData,
  getRecommendedNextStep
};

// Export the service interface and implementation
export { setupWizardService };

// Export default instance for direct use
export default setupWizardService;

// Export individual methods for direct use if needed
export {
  getStepsConfiguration,
  calculateProgress,
  getNavigationOptions,
  getAssetTemplates,
  getPopularAssetTemplates,
  importDataFromFile,
  validateImportedData,
  saveWizardData,
  getRecommendedNextStep
};

// Export sub-services
export { default as stepValidationService } from './methods/stepValidationService';