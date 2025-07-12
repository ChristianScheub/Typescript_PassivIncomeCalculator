/**
 * Setup Wizard types and interfaces
 */

import { WizardStep } from '@/types/shared/base/enums';

export interface SetupWizardState {
  currentStep: WizardStep;
  completedSteps: WizardStep[];
  skippedSteps: WizardStep[];
  isCompleted: boolean;
  hasUnsavedChanges: boolean;
  stepData: StepDataCollection;
}

export interface StepDataCollection {
  welcome: WelcomeStepData;
  assetDefinitions: AssetDefinitionsStepData;
  transactions: TransactionsStepData;
  liabilities: LiabilitiesStepData;
  income: IncomeStepData;
}

export interface WelcomeStepData {
  skipWizard: boolean;
  importData: boolean;
  importFile?: File;
  importType?: 'csv' | 'json';
}

export interface AssetDefinitionsStepData {
  selectedTemplates: AssetTemplate[];
  customAssets: CustomAssetDefinition[];
  skipStep: boolean;
}

export interface TransactionsStepData {
  transactions: SimplifiedTransaction[];
  bulkImport: boolean;
  importFile?: File;
  skipStep: boolean;
}

export interface LiabilitiesStepData {
  liabilities: SimplifiedLiability[];
  skipStep: boolean;
}

export interface IncomeStepData {
  incomes: SimplifiedIncome[];
  skipStep: boolean;
}

export interface AssetTemplate {
  id: string;
  name: string;
  symbol: string;
  type: 'stock' | 'etf' | 'bond' | 'crypto' | 'other';
  category: string;
  description?: string;
  isPopular: boolean;
}

export interface CustomAssetDefinition {
  name: string;
  symbol: string;
  type: 'stock' | 'etf' | 'bond' | 'crypto' | 'other';
  category: string;
  description?: string;
}

export interface SimplifiedTransaction {
  assetId: string;
  type: 'buy' | 'sell' | 'dividend';
  amount: number;
  quantity?: number;
  date: string;
  notes?: string;
}

export interface SimplifiedLiability {
  name: string;
  amount: number;
  interestRate?: number;
  monthlyPayment?: number;
  description?: string;
}

export interface SimplifiedIncome {
  name: string;
  monthlyAmount: number;
  type: 'salary' | 'freelance' | 'passive' | 'other';
  description?: string;
}

export interface WizardValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface StepNavigationOptions {
  canGoBack: boolean;
  canGoNext: boolean;
  canSkip: boolean;
  isRequired: boolean;
}

export interface WizardProgress {
  currentStepIndex: number;
  totalSteps: number;
  completionPercentage: number;
  stepsConfig: StepConfig[];
}

export interface StepConfig {
  step: WizardStep;
  title: string;
  description: string;
  isOptional: boolean;
  isConditional: boolean;
  conditionKey?: keyof StepDataCollection;
}

// Data import related types
export interface ImportDataResult {
  success: boolean;
  data?: {
    assets?: (AssetTemplate | Record<string, unknown>)[];
    transactions?: (SimplifiedTransaction | Record<string, unknown>)[];
    liabilities?: (SimplifiedLiability | Record<string, unknown>)[];
    income?: (SimplifiedIncome | Record<string, unknown>)[];
  };
  errors?: string[];
}

export interface ImportValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  preview?: {
    assets?: number;
    transactions?: number;
    liabilities?: number;
    income?: number;
  };
}