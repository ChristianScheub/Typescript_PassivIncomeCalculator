import { Middleware } from '@reduxjs/toolkit';
import { StoreState } from '..';
import { invalidateAllCache } from '../slices/calculatedDataSlice';
import Logger from '../../service/shared/logging/Logger/logger';

/**
 * Middleware that automatically invalidates calculated data cache when underlying data changes
 */
const calculatedDataCacheMiddleware: Middleware<{}, StoreState> = (store) => (next) => (action: any) => {
  const result = next(action);
  
  // Actions that should invalidate cache
  const cacheInvalidationActions = [
    // Transaction actions
    'transactions/addTransaction',
    'transactions/updateTransaction',
    'transactions/deleteTransaction',
    'transactions/calculatePortfolioData/fulfilled',
    
    // Asset definition actions
    'assetDefinitions/addAssetDefinition',
    'assetDefinitions/updateAssetDefinition',
    'assetDefinitions/deleteAssetDefinition',
    
    // Financial data actions
    'liabilities/addLiability',
    'liabilities/updateLiability',
    'liabilities/deleteLiability',
    'expenses/addExpense',
    'expenses/updateExpense',
    'expenses/deleteExpense',
    'income/addIncome',
    'income/updateIncome',
    'income/deleteIncome',
    
    // Asset category actions
    'assetCategories/addCategory',
    'assetCategories/updateCategory',
    'assetCategories/deleteCategory',
    'assetCategories/assignCategory',
    'assetCategories/unassignCategory'
  ];
  
  // Check if the action should invalidate cache
  if (action.type && cacheInvalidationActions.some(actionType => action.type.startsWith(actionType))) {
    Logger.cache(`Cache invalidation triggered by action: ${action.type}`);
    store.dispatch(invalidateAllCache());
  }
  
  return result;
};

export default calculatedDataCacheMiddleware;
