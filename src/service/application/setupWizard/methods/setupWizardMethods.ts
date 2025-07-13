import { 
  StepDataCollection, 
  StepNavigationOptions,
  WizardProgress,
  ImportDataResult,
  ImportValidationResult,
  AssetTemplate
} from '@/types/domains/setupWizard';
import { WizardStep } from '@/types/shared/base/enums';
import { StepConfig } from '../interfaces/ISetupWizardService';
import Logger from '@/service/shared/logging/Logger/logger';

export const getStepsConfiguration = (): StepConfig[] => {
  return [
    {
      step: WizardStep.WELCOME,
      title: 'setupWizard.general.steps.welcome',
      description: 'setupWizard.welcome.title',
      isOptional: false,
      isConditional: false
    },
    {
      step: WizardStep.ASSET_DEFINITIONS,
      title: 'setupWizard.general.steps.assetDefinitions',
      description: 'setupWizard.assets.title',
      isOptional: true,
      isConditional: false
    },
    {
      step: WizardStep.TRANSACTIONS,
      title: 'setupWizard.general.steps.transactions',
      description: 'setupWizard.transactions.title',
      isOptional: true,
      isConditional: false
    },
    {
      step: WizardStep.LIABILITIES,
      title: 'setupWizard.general.steps.liabilities',
      description: 'setupWizard.liabilities.title',
      isOptional: true,
      isConditional: false
    },
    {
      step: WizardStep.INCOME,
      title: 'setupWizard.general.steps.income',
      description: 'setupWizard.income.title',
      isOptional: true,
      isConditional: false
    },
    {
      step: WizardStep.COMPLETION,
      title: 'setupWizard.general.steps.completion',
      description: 'setupWizard.completion.title',
      isOptional: false,
      isConditional: false
    }
  ];
};

export const calculateProgress = (
  currentStep: WizardStep, 
  completedSteps: WizardStep[], 
  skippedSteps: WizardStep[]
): WizardProgress => {
  const stepsConfig = getStepsConfiguration();
  const totalSteps = stepsConfig.length;
  const currentStepIndex = stepsConfig.findIndex(config => config.step === currentStep);
  const totalCompleted = completedSteps.length + skippedSteps.length;
  const completionPercentage = Math.round((totalCompleted / totalSteps) * 100);
  
  return {
    currentStepIndex,
    totalSteps,
    completionPercentage,
    stepsConfig
  };
};

export const getNavigationOptions = (
  step: WizardStep,
  stepData?: StepDataCollection
): StepNavigationOptions => {
  const stepsConfig = getStepsConfiguration();
  const stepConfig = stepsConfig.find(config => config.step === step);
  const stepIndex = stepsConfig.findIndex(config => config.step === step);
  
  const canGoBack = stepIndex > 0;
  const canGoNext = stepIndex < stepsConfig.length - 1;
  const canSkip = stepConfig?.isOptional ?? false;
  const isRequired = !stepConfig?.isOptional;
  
  return {
    canGoBack,
    canGoNext,
    canSkip,
    isRequired
  };
};

export const getAssetTemplates = (): AssetTemplate[] => {
  return [
    // Popular Stocks
    {
      id: 'aapl',
      name: 'Apple Inc.',
      symbol: 'AAPL',
      type: 'stock',
      category: 'Technology',
      description: 'American multinational technology company',
      isPopular: true
    },
    {
      id: 'msft',
      name: 'Microsoft Corporation',
      symbol: 'MSFT',
      type: 'stock',
      category: 'Technology',
      description: 'American multinational technology corporation',
      isPopular: true
    },
    {
      id: 'googl',
      name: 'Alphabet Inc.',
      symbol: 'GOOGL',
      type: 'stock',
      category: 'Technology',
      description: 'American multinational conglomerate and holding company',
      isPopular: true
    },
    {
      id: 'amzn',
      name: 'Amazon.com Inc.',
      symbol: 'AMZN',
      type: 'stock',
      category: 'Consumer Discretionary',
      description: 'American multinational technology and e-commerce company',
      isPopular: true
    },
    {
      id: 'tsla',
      name: 'Tesla Inc.',
      symbol: 'TSLA',
      type: 'stock',
      category: 'Consumer Discretionary',
      description: 'American electric vehicle and clean energy company',
      isPopular: true
    },
    
    // Popular ETFs
    {
      id: 'spy',
      name: 'SPDR S&P 500 ETF Trust',
      symbol: 'SPY',
      type: 'etf',
      category: 'Broad Market',
      description: 'Tracks the S&P 500 index',
      isPopular: true
    },
    {
      id: 'vti',
      name: 'Vanguard Total Stock Market ETF',
      symbol: 'VTI',
      type: 'etf',
      category: 'Broad Market',
      description: 'Tracks the total U.S. stock market',
      isPopular: true
    },
    {
      id: 'qqq',
      name: 'Invesco QQQ Trust',
      symbol: 'QQQ',
      type: 'etf',
      category: 'Technology',
      description: 'Tracks the Nasdaq-100 index',
      isPopular: true
    },
    
    // Additional stocks
    {
      id: 'nvda',
      name: 'NVIDIA Corporation',
      symbol: 'NVDA',
      type: 'stock',
      category: 'Technology',
      description: 'American multinational technology corporation',
      isPopular: false
    },
    {
      id: 'jpm',
      name: 'JPMorgan Chase & Co.',
      symbol: 'JPM',
      type: 'stock',
      category: 'Financial Services',
      description: 'American multinational investment bank',
      isPopular: false
    },
    {
      id: 'jnj',
      name: 'Johnson & Johnson',
      symbol: 'JNJ',
      type: 'stock',
      category: 'Healthcare',
      description: 'American multinational pharmaceutical corporation',
      isPopular: false
    },
    
    // International ETFs
    {
      id: 'vxus',
      name: 'Vanguard Total International Stock ETF',
      symbol: 'VXUS',
      type: 'etf',
      category: 'International',
      description: 'Tracks international stock markets excluding the U.S.',
      isPopular: false
    },
    {
      id: 'bnd',
      name: 'Vanguard Total Bond Market ETF',
      symbol: 'BND',
      type: 'etf',
      category: 'Fixed Income',
      description: 'Tracks the U.S. bond market',
      isPopular: false
    }
  ];
};

export const getPopularAssetTemplates = (): AssetTemplate[] => {
  return getAssetTemplates().filter(template => template.isPopular);
};

export const importDataFromFile = async (file: File, type: 'csv' | 'json'): Promise<ImportDataResult> => {
  try {
    const text = await file.text();
    
    if (type === 'json') {
      const data = JSON.parse(text);
      return {
        success: true,
        data: {
          assets: data.assets || [],
          transactions: data.transactions || [],
          liabilities: data.liabilities || [],
          income: data.income || []
        }
      };
    } else if (type === 'csv') {
      // Basic CSV parsing - this could be enhanced with a proper CSV parser
      const lines = text.split('\n');
      const headers = lines[0].split(',');
      const rows = lines.slice(1).map(line => {
        const values = line.split(',');
        const obj: Record<string, string> = {};
        headers.forEach((header, index) => {
          obj[header.trim()] = values[index]?.trim() || '';
        });
        return obj;
      });
      
      return {
        success: true,
        data: {
          transactions: rows.filter(row => Object.keys(row).length > 1)
        }
      };
    }
    
    return {
      success: false,
      errors: ['Unsupported file type']
    };
  } catch (error) {
    return {
      success: false,
      errors: [`Error parsing file: ${error}`]
    };
  }
};

export const validateImportedData = (data: ImportDataResult['data']): ImportValidationResult => {
  const warnings: string[] = [];
  const errors: string[] = [];
  
  if (!data) {
    errors.push('No data provided');
    return { isValid: false, warnings, errors };
  }
  
  let preview = {};
  
  if (data.assets && Array.isArray(data.assets)) {
    preview = { ...preview, assets: data.assets.length };
    if (data.assets.length === 0) {
      warnings.push('No assets found in import data');
    }
  }
  
  if (data.transactions && Array.isArray(data.transactions)) {
    preview = { ...preview, transactions: data.transactions.length };
    if (data.transactions.length === 0) {
      warnings.push('No transactions found in import data');
    }
  }
  
  if (data.liabilities && Array.isArray(data.liabilities)) {
    preview = { ...preview, liabilities: data.liabilities.length };
  }
  
  if (data.income && Array.isArray(data.income)) {
    preview = { ...preview, income: data.income.length };
  }
  
  return {
    isValid: errors.length === 0,
    warnings,
    errors,
    preview
  };
};

export const saveWizardData = async (stepData: StepDataCollection): Promise<boolean> => {
  // This would integrate with the existing Redux store and save the data
  // For now, return true as a placeholder
  try {
    // ToDO Implementation would dispatch actions to save data to the main store
    Logger.info('Saving wizard data:'+stepData);
    return true;
  } catch (error) {
    Logger.errorStack(
      'Error saving wizard data:',
      error instanceof Error ? error : new Error(String(error))
    );
    return false;
  }
};

export const getRecommendedNextStep = (
  currentStep: WizardStep, 
  stepData: StepDataCollection
): WizardStep | null => {
  const stepsConfig = getStepsConfiguration();
  const currentIndex = stepsConfig.findIndex(config => config.step === currentStep);
  
  if (currentIndex >= stepsConfig.length - 1) {
    return null;
  }
  
  const nextStep = stepsConfig[currentIndex + 1];
  
  // Check if next step is conditional
  if (nextStep.isConditional && nextStep.conditionKey) {
    if (nextStep.step === WizardStep.TRANSACTIONS) {
      const hasAssets = stepData.assetDefinitions.selectedTemplates.length > 0 || 
                       stepData.assetDefinitions.customAssets.length > 0;
      if (!hasAssets) {
        // Skip transactions step and get next step
        return getRecommendedNextStep(nextStep.step, stepData);
      }
    }
  }
  
  return nextStep.step;
};