import { 
  StepDataCollection, 
  WizardValidationResult 
} from '@/types/domains/setupWizard';
import { WizardStep } from '@/types/shared/base/enums';

export const validateStep = (step: WizardStep, stepData: StepDataCollection): WizardValidationResult => {
  switch (step) {
    case WizardStep.WELCOME:
      return validateWelcomeStep(stepData);
    case WizardStep.ASSET_DEFINITIONS:
      return validateAssetDefinitionsStep(stepData);
    case WizardStep.TRANSACTIONS:
      return validateTransactionsStep(stepData);
    case WizardStep.LIABILITIES:
      return validateLiabilitiesStep(stepData);
    case WizardStep.INCOME:
      return validateIncomeStep(stepData);
    default:
      return { isValid: true, errors: [], warnings: [] };
  }
};

export const validateWelcomeStep = (stepData: StepDataCollection): WizardValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Welcome step is always valid, but we can add warnings
  if (stepData.welcome.importData && !stepData.welcome.importFile) {
    warnings.push('Import data option selected but no file provided');
  }
  
  if (stepData.welcome.importData && stepData.welcome.importFile && !stepData.welcome.importType) {
    warnings.push('Import file provided but no import type selected');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const validateAssetDefinitionsStep = (stepData: StepDataCollection): WizardValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check if step is skipped
  if (stepData.assetDefinitions.skipStep) {
    return { isValid: true, errors: [], warnings: ['Asset definitions step was skipped'] };
  }
  
  const hasTemplates = stepData.assetDefinitions.selectedTemplates.length > 0;
  const hasCustomAssets = stepData.assetDefinitions.customAssets.length > 0;
  
  if (!hasTemplates && !hasCustomAssets) {
    warnings.push('No assets defined. Consider adding some assets to track your portfolio.');
  }
  
  // Validate custom assets
  stepData.assetDefinitions.customAssets.forEach((asset, index) => {
    if (!asset.name.trim()) {
      errors.push(`Custom asset ${index + 1}: Name is required`);
    }
    if (!asset.symbol.trim()) {
      errors.push(`Custom asset ${index + 1}: Symbol is required`);
    }
    if (!asset.type) {
      errors.push(`Custom asset ${index + 1}: Type is required`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const validateTransactionsStep = (stepData: StepDataCollection): WizardValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check if step is skipped
  if (stepData.transactions.skipStep) {
    return { isValid: true, errors: [], warnings: ['Transactions step was skipped'] };
  }
  
  // Check if there are assets defined
  const hasAssets = stepData.assetDefinitions.selectedTemplates.length > 0 || 
                   stepData.assetDefinitions.customAssets.length > 0;
  
  if (!hasAssets) {
    warnings.push('No assets defined. Transactions require assets to be defined first.');
    return { isValid: true, errors, warnings };
  }
  
  // Validate transactions
  stepData.transactions.transactions.forEach((transaction, index) => {
    if (!transaction.assetId) {
      errors.push(`Transaction ${index + 1}: Asset is required`);
    }
    if (!transaction.type) {
      errors.push(`Transaction ${index + 1}: Transaction type is required`);
    }
    if (transaction.amount <= 0) {
      errors.push(`Transaction ${index + 1}: Amount must be greater than 0`);
    }
    if (!transaction.date) {
      errors.push(`Transaction ${index + 1}: Date is required`);
    }
    if ((transaction.type === 'buy' || transaction.type === 'sell') && !transaction.quantity) {
      warnings.push(`Transaction ${index + 1}: Quantity is recommended for buy/sell transactions`);
    }
  });
  
  if (stepData.transactions.transactions.length === 0) {
    warnings.push('No transactions added. Consider adding some transactions to track your portfolio activity.');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const validateLiabilitiesStep = (stepData: StepDataCollection): WizardValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check if step is skipped
  if (stepData.liabilities.skipStep) {
    return { isValid: true, errors: [], warnings: ['Liabilities step was skipped'] };
  }
  
  // Validate liabilities
  stepData.liabilities.liabilities.forEach((liability, index) => {
    if (!liability.name.trim()) {
      errors.push(`Liability ${index + 1}: Name is required`);
    }
    if (liability.amount <= 0) {
      errors.push(`Liability ${index + 1}: Amount must be greater than 0`);
    }
    if (liability.interestRate && liability.interestRate < 0) {
      errors.push(`Liability ${index + 1}: Interest rate cannot be negative`);
    }
    if (liability.monthlyPayment && liability.monthlyPayment <= 0) {
      errors.push(`Liability ${index + 1}: Monthly payment must be greater than 0 if specified`);
    }
  });
  
  if (stepData.liabilities.liabilities.length === 0) {
    warnings.push('No liabilities added. This is optional but can help with complete financial tracking.');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const validateIncomeStep = (stepData: StepDataCollection): WizardValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check if step is skipped
  if (stepData.income.skipStep) {
    return { isValid: true, errors: [], warnings: ['Income step was skipped'] };
  }
  
  // Validate income sources
  stepData.income.incomes.forEach((income, index) => {
    if (!income.name.trim()) {
      errors.push(`Income source ${index + 1}: Name is required`);
    }
    if (income.monthlyAmount <= 0) {
      errors.push(`Income source ${index + 1}: Monthly amount must be greater than 0`);
    }
    if (!income.type) {
      errors.push(`Income source ${index + 1}: Income type is required`);
    }
  });
  
  if (stepData.income.incomes.length === 0) {
    warnings.push('No income sources added. This is optional but recommended for complete financial planning.');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const validateAllSteps = (stepData: StepDataCollection): WizardValidationResult => {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  
  const steps = [
    WizardStep.WELCOME,
    WizardStep.ASSET_DEFINITIONS,
    WizardStep.TRANSACTIONS,
    WizardStep.LIABILITIES,
    WizardStep.INCOME
  ];
  
  steps.forEach(step => {
    const validation = validateStep(step, stepData);
    allErrors.push(...validation.errors);
    allWarnings.push(...validation.warnings);
  });
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings
  };
};