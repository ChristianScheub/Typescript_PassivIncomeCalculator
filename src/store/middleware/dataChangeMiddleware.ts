import { Middleware, MiddlewareAPI, AnyAction } from '@reduxjs/toolkit';
import { updateForecastValues, updateMonthlyAssetIncomeCache } from '../slices/forecastSlice';
import { updateDashboardValues } from '../slices/dashboardSlice';
import { StoreState } from '../index';
import Logger from '../../service/Logger/logger';

// Type guard to check if action has a type property
function isActionWithType(action: unknown): action is AnyAction {
  return typeof action === 'object' && action !== null && 'type' in action && typeof (action as AnyAction).type === 'string';
}

// Middleware um automatisch Forecast und Dashboard zu aktualisieren wenn sich relevante Daten ändern
export const dataChangeMiddleware: Middleware<object, StoreState> = (store: MiddlewareAPI<any, StoreState>) => (next) => (action) => {
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
        type.startsWith('assets/') || 
        type.startsWith('income/') || 
        type.startsWith('expenses/') || 
        type.startsWith('liabilities/'))) {
      
      Logger.infoRedux(`Data mutation detected: ${type}, updating dashboard and forecast`);
      
      // Update dashboard first (since forecast depends on it)
      store.dispatch(updateDashboardValues());
      
      // If assets changed, update the monthly asset income cache specifically
      if (type.startsWith('assets/')) {
        Logger.infoRedux('Assets changed, updating monthly asset income cache');
        store.dispatch(updateMonthlyAssetIncomeCache());
      }
      
      // Then update forecast
      store.dispatch(updateForecastValues());
    }
  }
  
  return result;
};

export default dataChangeMiddleware;
