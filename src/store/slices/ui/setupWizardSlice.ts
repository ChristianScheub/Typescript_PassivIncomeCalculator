import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { 
  SetupWizardState, 
  WizardStep, 
  StepDataCollection,
  WelcomeStepData,
  AssetDefinitionsStepData,
  TransactionsStepData,
  LiabilitiesStepData,
  IncomeStepData,
  AssetTemplate,
  CustomAssetDefinition,
  SimplifiedTransaction,
  SimplifiedLiability,
  SimplifiedIncome
} from '@/types/domains/setupWizard';

const initialStepData: StepDataCollection = {
  welcome: {
    skipWizard: false,
    importData: false,
    importType: undefined,
    importFile: undefined
  },
  assetDefinitions: {
    selectedTemplates: [],
    customAssets: [],
    skipStep: false
  },
  transactions: {
    transactions: [],
    bulkImport: false,
    importFile: undefined,
    skipStep: false
  },
  liabilities: {
    liabilities: [],
    skipStep: false
  },
  income: {
    incomes: [],
    skipStep: false
  }
};

const initialState: SetupWizardState = {
  currentStep: WizardStep.WELCOME,
  completedSteps: [],
  skippedSteps: [],
  isCompleted: false,
  hasUnsavedChanges: false,
  stepData: initialStepData
};

const setupWizardSlice = createSlice({
  name: 'setupWizard',
  initialState,
  reducers: {
    // Navigation actions
    setCurrentStep: (state, action: PayloadAction<WizardStep>) => {
      state.currentStep = action.payload;
    },
    
    goToNextStep: (state) => {
      const steps = Object.values(WizardStep);
      const currentIndex = steps.indexOf(state.currentStep);
      if (currentIndex < steps.length - 1) {
        // Mark current step as completed if not skipped
        if (!state.skippedSteps.includes(state.currentStep)) {
          if (!state.completedSteps.includes(state.currentStep)) {
            state.completedSteps.push(state.currentStep);
          }
        }
        state.currentStep = steps[currentIndex + 1];
      }
    },
    
    goToPreviousStep: (state) => {
      const steps = Object.values(WizardStep);
      const currentIndex = steps.indexOf(state.currentStep);
      if (currentIndex > 0) {
        state.currentStep = steps[currentIndex - 1];
      }
    },
    
    skipCurrentStep: (state) => {
      if (!state.skippedSteps.includes(state.currentStep)) {
        state.skippedSteps.push(state.currentStep);
      }
      // Remove from completed if it was there
      state.completedSteps = state.completedSteps.filter(step => step !== state.currentStep);
      
      // Go to next step
      const steps = Object.values(WizardStep);
      const currentIndex = steps.indexOf(state.currentStep);
      if (currentIndex < steps.length - 1) {
        state.currentStep = steps[currentIndex + 1];
      }
    },
    
    markStepCompleted: (state, action: PayloadAction<WizardStep>) => {
      const step = action.payload;
      if (!state.completedSteps.includes(step)) {
        state.completedSteps.push(step);
      }
      // Remove from skipped if it was there
      state.skippedSteps = state.skippedSteps.filter(s => s !== step);
    },
    
    // Step data actions
    updateWelcomeStepData: (state, action: PayloadAction<Partial<WelcomeStepData>>) => {
      state.stepData.welcome = { ...state.stepData.welcome, ...action.payload };
      state.hasUnsavedChanges = true;
    },
    
    updateAssetDefinitionsStepData: (state, action: PayloadAction<Partial<AssetDefinitionsStepData>>) => {
      state.stepData.assetDefinitions = { ...state.stepData.assetDefinitions, ...action.payload };
      state.hasUnsavedChanges = true;
    },
    
    addAssetTemplate: (state, action: PayloadAction<AssetTemplate>) => {
      const template = action.payload;
      if (!state.stepData.assetDefinitions.selectedTemplates.find(t => t.id === template.id)) {
        state.stepData.assetDefinitions.selectedTemplates.push(template);
        state.hasUnsavedChanges = true;
      }
    },
    
    removeAssetTemplate: (state, action: PayloadAction<string>) => {
      const templateId = action.payload;
      state.stepData.assetDefinitions.selectedTemplates = 
        state.stepData.assetDefinitions.selectedTemplates.filter(t => t.id !== templateId);
      state.hasUnsavedChanges = true;
    },
    
    addCustomAsset: (state, action: PayloadAction<CustomAssetDefinition>) => {
      state.stepData.assetDefinitions.customAssets.push(action.payload);
      state.hasUnsavedChanges = true;
    },
    
    removeCustomAsset: (state, action: PayloadAction<number>) => {
      const index = action.payload;
      state.stepData.assetDefinitions.customAssets.splice(index, 1);
      state.hasUnsavedChanges = true;
    },
    
    updateTransactionsStepData: (state, action: PayloadAction<Partial<TransactionsStepData>>) => {
      state.stepData.transactions = { ...state.stepData.transactions, ...action.payload };
      state.hasUnsavedChanges = true;
    },
    
    addTransaction: (state, action: PayloadAction<SimplifiedTransaction>) => {
      state.stepData.transactions.transactions.push(action.payload);
      state.hasUnsavedChanges = true;
    },
    
    removeTransaction: (state, action: PayloadAction<number>) => {
      const index = action.payload;
      state.stepData.transactions.transactions.splice(index, 1);
      state.hasUnsavedChanges = true;
    },
    
    updateLiabilitiesStepData: (state, action: PayloadAction<Partial<LiabilitiesStepData>>) => {
      state.stepData.liabilities = { ...state.stepData.liabilities, ...action.payload };
      state.hasUnsavedChanges = true;
    },
    
    addLiability: (state, action: PayloadAction<SimplifiedLiability>) => {
      state.stepData.liabilities.liabilities.push(action.payload);
      state.hasUnsavedChanges = true;
    },
    
    removeLiability: (state, action: PayloadAction<number>) => {
      const index = action.payload;
      state.stepData.liabilities.liabilities.splice(index, 1);
      state.hasUnsavedChanges = true;
    },
    
    updateIncomeStepData: (state, action: PayloadAction<Partial<IncomeStepData>>) => {
      state.stepData.income = { ...state.stepData.income, ...action.payload };
      state.hasUnsavedChanges = true;
    },
    
    addIncome: (state, action: PayloadAction<SimplifiedIncome>) => {
      state.stepData.income.incomes.push(action.payload);
      state.hasUnsavedChanges = true;
    },
    
    removeIncome: (state, action: PayloadAction<number>) => {
      const index = action.payload;
      state.stepData.income.incomes.splice(index, 1);
      state.hasUnsavedChanges = true;
    },
    
    // Wizard control actions
    resetWizard: () => {
      return { ...initialState };
    },
    
    completeWizard: (state) => {
      state.isCompleted = true;
      state.hasUnsavedChanges = false;
      if (!state.completedSteps.includes(state.currentStep)) {
        state.completedSteps.push(state.currentStep);
      }
    },
    
    saveProgress: (state) => {
      state.hasUnsavedChanges = false;
    },
    
    // Bulk data actions for import functionality
    setBulkAssetTemplates: (state, action: PayloadAction<AssetTemplate[]>) => {
      state.stepData.assetDefinitions.selectedTemplates = action.payload;
      state.hasUnsavedChanges = true;
    },
    
    setBulkTransactions: (state, action: PayloadAction<SimplifiedTransaction[]>) => {
      state.stepData.transactions.transactions = action.payload;
      state.hasUnsavedChanges = true;
    },
    
    setBulkLiabilities: (state, action: PayloadAction<SimplifiedLiability[]>) => {
      state.stepData.liabilities.liabilities = action.payload;
      state.hasUnsavedChanges = true;
    },
    
    setBulkIncomes: (state, action: PayloadAction<SimplifiedIncome[]>) => {
      state.stepData.income.incomes = action.payload;
      state.hasUnsavedChanges = true;
    }
  }
});

export const {
  // Navigation
  setCurrentStep,
  goToNextStep,
  goToPreviousStep,
  skipCurrentStep,
  markStepCompleted,
  
  // Step data updates
  updateWelcomeStepData,
  updateAssetDefinitionsStepData,
  addAssetTemplate,
  removeAssetTemplate,
  addCustomAsset,
  removeCustomAsset,
  updateTransactionsStepData,
  addTransaction,
  removeTransaction,
  updateLiabilitiesStepData,
  addLiability,
  removeLiability,
  updateIncomeStepData,
  addIncome,
  removeIncome,
  
  // Wizard control
  resetWizard,
  completeWizard,
  saveProgress,
  
  // Bulk operations
  setBulkAssetTemplates,
  setBulkTransactions,
  setBulkLiabilities,
  setBulkIncomes
} = setupWizardSlice.actions;

export default setupWizardSlice.reducer;