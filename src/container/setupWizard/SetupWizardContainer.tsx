import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { useSetupStatus } from '../../hooks/useSetupStatus';
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
  addTransaction as addWizardTransaction,
  removeTransaction,
  updateLiabilitiesStepData,
  addLiability as addWizardLiability,
  removeLiability,
  updateIncomeStepData,
  addIncome as addWizardIncome,
  removeIncome
} from '@/store/slices/ui/setupWizardSlice';
import { showSuccessSnackbar, showErrorSnackbar } from '@/store/slices/ui/snackbarSlice';
import { ImportValidationResult } from '@/types/domains/setupWizard';
import sqliteService from '@/service/infrastructure/sqlLiteService';
// NEU: Importiere die Domain-Thunks für persistente Speicherung
import {
  addAssetDefinition,
  addTransaction,
  addLiability,
  addIncome
} from '@/store/slices/domain';

const SetupWizardContainer: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { markSetupCompleted } = useSetupStatus();
  
  // Redux state
  const {
    currentStep,
    completedSteps,
    skippedSteps,
    isCompleted,
    hasUnsavedChanges,
    stepData
  } = useAppSelector((state) => state.setupWizard);

  // NEU: Persistierte Asset-Definitionen aus Redux-State holen
  const persistedAssetDefinitions = useAppSelector((state) => state.assetDefinitions.items);

  // Service data
  const progress = setupWizardService.calculateProgress(currentStep, completedSteps, skippedSteps);
  const navigationOptions = setupWizardService.getNavigationOptions(currentStep, stepData);
  const availableTemplates = setupWizardService.getAssetTemplates();
  const popularTemplates = setupWizardService.getPopularAssetTemplates();
  
  // NEU: Für Transaktionsschritt: Persistierte Assets als Auswahl
  const availableAssets = persistedAssetDefinitions;

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
  const handleFileSelect = useCallback((file: File) => {
    try {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const fileContent = e.target?.result as string;

          await sqliteService.importData(fileContent);
          dispatch(showSuccessSnackbar('File imported successfully!'));

          // Refresh the page to reload all data
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } catch (error) {
          dispatch(showErrorSnackbar(`Import failed: ${error instanceof Error ? error.message : String(error)}`));
        }
      };

      reader.onerror = () => {
        dispatch(showErrorSnackbar('Failed to read the file. Please try again.'));
      };

      reader.readAsText(file);
    } catch (error) {
      dispatch(showErrorSnackbar(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`));
    }
  }, [dispatch]);

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
        // Persistiere alle Wizard-Daten in die Domain-Slices/DB
        // 1. Asset Definitions (Templates & Custom)
        const assetDefs = [
          ...stepData.assetDefinitions.selectedTemplates.map(t => ({
            ticker: t.symbol,
            fullName: t.name,
            name: t.name,
            type: t.type === 'etf' ? 'stock' : t.type,
            category: t.category,
            description: t.description,
            isActive: true,
          })),
          ...stepData.assetDefinitions.customAssets.map(ca => ({
            ticker: ca.symbol,
            fullName: ca.name,
            name: ca.name,
            type: ca.type === 'etf' ? 'stock' : ca.type,
            category: ca.category,
            description: ca.description,
            isActive: true,
          }))
        ];
        for (const def of assetDefs) {
          try {
            await dispatch(addAssetDefinition(def) as any);
          } catch (e) {
            dispatch(showErrorSnackbar(`Failed to add asset definition: ${def.name || def.ticker}`));
            return;
          }
        }

        // NEU: Persistierte Asset-Definitionen nach dem Hinzufügen erneut holen (falls nötig)
        // await dispatch(fetchAssetDefinitions() as any); // Optional, falls nicht automatisch aktualisiert
        const latestAssetDefinitions = persistedAssetDefinitions.length > 0 ? persistedAssetDefinitions : [];

        // 2. Transactions
        for (const tx of stepData.transactions.transactions) {
          if (tx.type !== 'buy' && tx.type !== 'sell') continue;
          // NEU: Asset-Definition anhand assetId (Symbol/Name) finden und echte ID setzen
          const matchingAsset = latestAssetDefinitions.find(
            (a) => a.ticker === tx.assetId || a.name === tx.assetId || a.fullName === tx.assetId
          );
          if (!matchingAsset) {
            dispatch(showErrorSnackbar(`No asset definition found for transaction asset: ${tx.assetId}`));
            continue;
          }
          try {
            await dispatch(addTransaction({
              type: matchingAsset.type || 'stock',
              name: matchingAsset.name || '',
              value: tx.amount,
              assetDefinitionId: matchingAsset.id,
              transactionType: tx.type,
              purchasePrice: tx.amount,
              purchaseQuantity: tx.quantity ?? 1,
              purchaseDate: tx.date,
              notes: tx.notes
            }) as any);
          } catch (e) {
            dispatch(showErrorSnackbar(`Failed to add transaction for asset: ${tx.assetId}`));
            return;
          }
        }

        // 3. Liabilities
        for (const liab of stepData.liabilities.liabilities) {
          try {
            await dispatch(addLiability({
              type: 'other', // Default, as wizard does not provide type
              name: liab.name,
              initialBalance: liab.amount,
              currentBalance: liab.amount,
              interestRate: liab.interestRate,
              notes: liab.description,
            }) as any);
          } catch (e) {
            dispatch(showErrorSnackbar(`Failed to add liability: ${liab.name}`));
            return;
          }
        }

        // 4. Income
        for (const inc of stepData.income.incomes) {
          try {
            // Only allow valid IncomeTypes
            const allowedTypes = ['salary', 'interest', 'other'];
            const mappedType = allowedTypes.includes(inc.type) ? inc.type : 'other';
            const incomeObj: any = {
              type: mappedType,
              isPassive: inc.type === 'passive',
              startDate: new Date().toISOString(),
              notes: inc.description,
            };
            // Map paymentSchedule if present
            if (inc.monthlyAmount) {
              incomeObj.paymentSchedule = {
                frequency: 'monthly',
                amount: inc.monthlyAmount,
              };
            }
            await dispatch(addIncome(incomeObj) as any);
          } catch (e) {
            dispatch(showErrorSnackbar(`Failed to add income: ${inc.name || ''}`));
            return;
          }
        }

        // Save wizard data to main application state (optional, legacy)
        const saveResult = await setupWizardService.saveWizardData(stepData);
        if (saveResult) {
          markSetupCompleted();
          dispatch(completeWizard());
          dispatch(showSuccessSnackbar('Setup completed successfully!'));
          // Nach erfolgreichem Abschluss: komplettes Window reloaden
          window.location.reload();
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
  }, [stepData, dispatch, markSetupCompleted]);

  // Redirect if wizard is already completed (nur wenn wirklich nötig)
  useEffect(() => {
    if (isCompleted) {
      navigate('/', { replace: true });
    }
  }, [isCompleted, navigate]);

  // Asset Definitions: Persistiere direkt beim Hinzufügen/Entfernen
  const handleAddTemplate = useCallback(async (template: import('@/types/domains/setupWizard').AssetTemplate) => {
    const def = {
      ticker: template.symbol,
      fullName: template.name,
      name: template.name,
      type: template.type === 'etf' ? 'stock' : template.type,
      category: template.category,
      description: template.description,
      isActive: true,
    };
    await dispatch(addAssetDefinition(def) as any);
    dispatch(addAssetTemplate(template));
  }, [dispatch]);

  const handleAddCustomAsset = useCallback(async (asset: import('@/types/domains/setupWizard').CustomAssetDefinition) => {
    const def = {
      ticker: asset.symbol,
      fullName: asset.name,
      name: asset.name,
      type: asset.type === 'etf' ? 'stock' : asset.type,
      category: asset.category,
      description: asset.description,
      isActive: true,
    };
    await dispatch(addAssetDefinition(def) as any);
    dispatch(addCustomAsset(asset));
  }, [dispatch]);

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
      onAddTemplate={handleAddTemplate}
      onRemoveTemplate={(templateId) => dispatch(removeAssetTemplate(templateId))}
      onAddCustomAsset={handleAddCustomAsset}
      onRemoveCustomAsset={(index) => dispatch(removeCustomAsset(index))}
      
      // Transactions step props
      availableAssets={availableAssets}
      onUpdateTransactionsStepData={(data) => dispatch(updateTransactionsStepData(data))}
      onAddTransaction={(transaction) => dispatch(addWizardTransaction(transaction))}
      onRemoveTransaction={(index) => dispatch(removeTransaction(index))}
      
      // Liabilities step props
      onUpdateLiabilitiesStepData={(data) => dispatch(updateLiabilitiesStepData(data))}
      onAddLiability={(liability) => dispatch(addWizardLiability(liability))}
      onRemoveLiability={(index) => dispatch(removeLiability(index))}
      
      // Income step props
      onUpdateIncomeStepData={(data) => dispatch(updateIncomeStepData(data))}
      onAddIncome={(income) => dispatch(addWizardIncome(income))}
      onRemoveIncome={(index) => dispatch(removeIncome(index))}
      
      // Completion step props
      onComplete={handleComplete}
    />
  );
};

export default SetupWizardContainer;