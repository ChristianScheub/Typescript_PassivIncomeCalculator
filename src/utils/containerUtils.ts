import Logger from '@/service/shared/logging/Logger/logger';
import { store } from '@/store';
import { showErrorSnackbar } from '@/store/slices/ui';

// Zentrale Konfiguration für Snackbar-Anzeige bei verschiedenen Operationen
const SNACKBAR_CONFIG: Record<string, boolean> = {
  // Asset Categories
  'add category': true,
  'update category': true,
  'delete category': true,
  
  // Asset Category Options
  'add category option': true,
  'update category option': true,
  'delete category option': true,
  
  // Asset Definitions
  'add asset definition': true,
  'update asset definition': true,
  'delete asset definition': true,
  
  // Transactions
  'add transaction': true,
  'update transaction': true,
  'delete transaction': true,
  
  // Income
  'add income': true,
  'update income': true,
  'delete income': true,
  
  // Expenses
  'add expense': true,
  'update expense': true,
  'delete expense': true,
  
  // Liabilities
  'add liability': true,
  'update liability': true,
  'delete liability': true,
  
  // Data Operations
  'load categories': false,
  'load transactions': false,
  'load income': false,
  'load expenses': false,
  'load liabilities': false,
  'refresh cache': false,
  'export data': true,
  'import data': true,
  'clear data': true,
  
  // API Operations
  'fetch stock price': true,
  'update stock prices': true,
  'update historical data': true
};

/**
 * Executes an async operation with automatic logging and optional snackbar error feedback
 * @param operationName - Name of the operation for logging and snackbar messages
 * @param operation - The async operation to execute
 * @param onSuccess - Optional callback to execute on successful completion
 * @param extraLogInfo - Optional extra context information to log
 * @returns Promise<T | undefined> - Result of the operation or undefined if failed
 */
export const executeAsyncOperation = async <T>(
  operationName: string,
  operation: () => Promise<T>,
  onSuccess?: () => void,
  extraLogInfo?: string
): Promise<T | undefined> => {
  try {
    Logger.info(`Starting ${operationName}`);
    if (extraLogInfo) {
      Logger.info(`[${operationName}] context: ${extraLogInfo}`);
    }
    const result = await operation();
    Logger.info(`Successfully completed ${operationName}`);
    onSuccess?.();
    return result;
  } catch (error) {
    Logger.errorStack(
      `Failed ${operationName}: ${JSON.stringify(error)}`,
      error instanceof Error ? error : new Error(String(error))
    );

    // Check if snackbar should be shown for this operation
    const shouldShowSnackbar = SNACKBAR_CONFIG[operationName] ?? false;
    
    if (shouldShowSnackbar) {
      store.dispatch(showErrorSnackbar(`${operationName} fehlgeschlagen`));
    }
    
    return undefined;
  }
};

/**
 * Hook version that provides the same functionality as executeAsyncOperation
 * but can be used within React components for consistency
 */
export const useAsyncOperation = () => {
  const executeAsyncOperationInComponent = async <T>(
    operationName: string,
    operation: () => Promise<T>,
    onSuccess?: () => void
  ): Promise<T | undefined> => {
    // Just use the same logic as the standalone function
    return executeAsyncOperation(operationName, operation, onSuccess);
  };
  
  return { executeAsyncOperation: executeAsyncOperationInComponent };
};


