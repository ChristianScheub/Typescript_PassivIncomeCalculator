import { Middleware, MiddlewareAPI, AnyAction } from '@reduxjs/toolkit';
import { updateForecastValues, updateMonthlyAssetIncomeCache } from '../slices/forecastSlice';
import { StoreState } from '../index';
import { appInitializationService } from '../initialization/appInitialization';
import Logger from '@service/shared/logging/Logger/logger';

// Type guard to check if action has a type property
function isActionWithType(action: unknown): action is AnyAction {
  return typeof action === 'object' && action !== null && 'type' in action && typeof (action as AnyAction).type === 'string';
}

// Middleware um automatisch Forecast und Dashboard zu aktualisieren wenn sich relevante Daten ändern
export const dataChangeMiddleware: Middleware<object, StoreState> = (store: MiddlewareAPI<any, StoreState>) => (next) => (action: unknown) => {
  const result = next(action);
  
  // Listen for successful data changes (but not fetch operations)
  if (isActionWithType(action) && action.type.endsWith('/fulfilled')) {
    const { type } = action;
    
    // Only trigger on actual data mutations (add, update, delete), not fetch operations
    const isMutationAction = type.includes('/add') || 
                            type.includes('/update') || 
                            type.includes('/delete');
    
    // Check if assets, income, expenses or liabilities changed
    if (isMutationAction && (
        type.startsWith('transactions/') || 
        type.startsWith('income/') || 
        type.startsWith('expenses/') || 
        type.startsWith('liabilities/') ||
        type.startsWith('assetDefinitions/') ||
        type.startsWith('assetCategories/'))) {
      
      Logger.infoRedux(`Data mutation detected: ${type}, updating dashboard and forecast`);
      
      // Reset initialization service to allow re-initialization with new data
      if (type.includes('/clear') || type.includes('/delete') || type.includes('/add')) {
        Logger.cache('Data structure changed, resetting initialization service');
        appInitializationService.reset();
      }
      
      // Update dashboard first (since forecast depends on it)
      // store.dispatch(updateDashboardValues()); // Entfernt, da nicht vorhanden
      
      // If assets changed, update the monthly asset income cache specifically
      if (type.startsWith('transactions/')) {
        Logger.cache('Assets changed, updating monthly asset income cache');
        store.dispatch(updateMonthlyAssetIncomeCache());
      }
      
      // Then update forecast
      store.dispatch(updateForecastValues());
    }
  }
  
  return result;
};

export default dataChangeMiddleware;
