import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import SetupWizardView from '@view/setupWizard/SetupWizardView';
import setupWizardService, { stepValidationService } from '@service/application/setupWizard';
import {
  goToNextStep,
  goToPreviousStep,
  skipCurrentStep,
  saveProgress,
  completeWizard,
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
  removeIncome
} from '@/store/slices/ui/setupWizardSlice';
import { showSuccessSnackbar, showErrorSnackbar } from '@/store/slices/ui/snackbarSlice';
import { ImportValidationResult } from '@/types/domains/setupWizard';
import { WizardStep } from '@/types/shared/base/enums';

const SetupWizardContainer: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // Redux state
  const {
    currentStep,
    completedSteps,
    skippedSteps,
    isCompleted,
    hasUnsavedChanges,
    stepData
  } = useAppSelector((state) => state.setupWizard);

  // Service data
  const progress = setupWizardService.calculateProgress(currentStep, completedSteps, skippedSteps);
  const navigationOptions = setupWizardService.getNavigationOptions(currentStep, stepData);
  const availableTemplates = setupWizardService.getAssetTemplates();
  const popularTemplates = setupWizardService.getPopularAssetTemplates();
  
  // Combine asset templates and custom assets for transactions step
  const availableAssets = [
    ...stepData.assetDefinitions.selectedTemplates,
    ...stepData.assetDefinitions.customAssets
  ];

  // Auto-save functionality
  useEffect(() => {
    if (hasUnsavedChanges) {
      const saveTimer = setTimeout(() => {
        dispatch(saveProgress());
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(saveTimer);
    }
  }, [hasUnsavedChanges, dispatch]);

  // Navigation handlers
  const handleNext = useCallback(() => {
    // Validate current step before proceeding
    const validation = stepValidationService.validateStep(currentStep, stepData);
    
    if (validation.isValid) {
      dispatch(goToNextStep());
      if (validation.warnings.length > 0) {
        validation.warnings.forEach(warning => {
          dispatch(showSuccessSnackbar(`Note: ${warning}`));
        });
      }
    } else {
      validation.errors.forEach(error => {
        dispatch(showErrorSnackbar(error));
      });
    }
  }, [currentStep, stepData, dispatch]);

  const handleBack = useCallback(() => {
    dispatch(goToPreviousStep());
  }, [dispatch]);

  const handleSkip = useCallback(() => {
    dispatch(skipCurrentStep());
  }, [dispatch]);

  // File import handlers
  const handleFileSelect = useCallback(async (file: File, type: 'csv' | 'json') => {
    try {
      const result = await setupWizardService.importDataFromFile(file, type);
      
      if (result.success && result.data) {
        dispatch(showSuccessSnackbar('File imported successfully!'));
        
        // Process imported data based on current step
        if (currentStep === WizardStep.WELCOME && result.data.assets) {
          // Convert imported assets to templates
          // This would need to be implemented based on the data format
        }
      } else {
        result.errors?.forEach(error => {
          dispatch(showErrorSnackbar(error));
        });
      }
    } catch (error) {
      dispatch(showErrorSnackbar(`Import failed: ${error}`));
    }
  }, [currentStep, dispatch]);

  const handleValidationResult = useCallback((result: ImportValidationResult) => {
    if (!result.isValid) {
      result.errors.forEach(error => {
        dispatch(showErrorSnackbar(error));
      });
    }
    if (result.warnings.length > 0) {
      result.warnings.forEach(warning => {
        dispatch(showSuccessSnackbar(`Warning: ${warning}`));
      });
    }
  }, [dispatch]);

  // Completion handler
  const handleComplete = useCallback(async () => {
    try {
      const allStepsValidation = stepValidationService.validateAllSteps(stepData);
      
      if (allStepsValidation.isValid) {
        // Save wizard data to main application state
        const saveResult = await setupWizardService.saveWizardData(stepData);
        
        if (saveResult) {
          dispatch(completeWizard());
          dispatch(showSuccessSnackbar('Setup completed successfully!'));
          navigate('/'); // Navigate to dashboard
        } else {
          dispatch(showErrorSnackbar('Failed to save configuration. Please try again.'));
        }
      } else {
        allStepsValidation.errors.forEach(error => {
          dispatch(showErrorSnackbar(error));
        });
      }
    } catch (error) {
      dispatch(showErrorSnackbar(`Failed to complete setup: ${error}`));
    }
  }, [stepData, dispatch, navigate]);

  // Redirect if wizard is already completed
  useEffect(() => {
    if (isCompleted) {
      navigate('/');
    }
  }, [isCompleted, navigate]);

  return (
    <SetupWizardView
      currentStep={currentStep}
      progress={progress}
      navigationOptions={navigationOptions}
      onNext={handleNext}
      onBack={handleBack}
      onSkip={handleSkip}
      isLoading={hasUnsavedChanges}
      stepData={stepData}
      
      // Welcome step props
      onUpdateWelcomeStepData={(data) => dispatch(updateWelcomeStepData(data))}
      onFileSelect={handleFileSelect}
      onValidationResult={handleValidationResult}
      
      // Asset definitions step props
      availableTemplates={availableTemplates}
      popularTemplates={popularTemplates}
      onUpdateAssetDefinitionsStepData={(data) => dispatch(updateAssetDefinitionsStepData(data))}
      onAddTemplate={(template) => dispatch(addAssetTemplate(template))}
      onRemoveTemplate={(templateId) => dispatch(removeAssetTemplate(templateId))}
      onAddCustomAsset={(asset) => dispatch(addCustomAsset(asset))}
      onRemoveCustomAsset={(index) => dispatch(removeCustomAsset(index))}
      
      // Transactions step props
      availableAssets={availableAssets}
      onUpdateTransactionsStepData={(data) => dispatch(updateTransactionsStepData(data))}
      onAddTransaction={(transaction) => dispatch(addTransaction(transaction))}
      onRemoveTransaction={(index) => dispatch(removeTransaction(index))}
      
      // Liabilities step props
      onUpdateLiabilitiesStepData={(data) => dispatch(updateLiabilitiesStepData(data))}
      onAddLiability={(liability) => dispatch(addLiability(liability))}
      onRemoveLiability={(index) => dispatch(removeLiability(index))}
      
      // Income step props
      onUpdateIncomeStepData={(data) => dispatch(updateIncomeStepData(data))}
      onAddIncome={(income) => dispatch(addIncome(income))}
      onRemoveIncome={(index) => dispatch(removeIncome(index))}
      
      // Completion step props
      onComplete={handleComplete}
    />
  );
};

export default SetupWizardContainer;