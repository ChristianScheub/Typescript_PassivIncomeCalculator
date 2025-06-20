import { Middleware, AnyAction } from '@reduxjs/toolkit';
import { invalidatePortfolioCache } from '../slices/transactionsSlice';
import Logger from '@service/shared/logging/Logger/logger';
import { StoreState } from '../index';

// Type guard to check if action has a type property
function isActionWithType(action: unknown): action is AnyAction {
  return typeof action === 'object' && action !== null && 'type' in action;
}

/**
 * Middleware to automatically invalidate portfolio cache when related data changes
 */
export const portfolioCacheMiddleware: Middleware<object, StoreState> = (store) => (next) => (action: unknown) => {
  // First, process the action
  const result = next(action);
  
  // Check if action has type property
  if (!isActionWithType(action)) {
    return result;
  }
  
  // Actions that should invalidate the portfolio cache
  const cacheInvalidatingActions = [
    // Asset definition changes
    'assetDefinitions/addAssetDefinition/fulfilled',
    'assetDefinitions/updateAssetDefinition/fulfilled', 
    'assetDefinitions/deleteAssetDefinition/fulfilled',
    
    // Asset category changes (affects position categorization)
    'assetCategories/addCategory/fulfilled',
    'assetCategories/updateCategory/fulfilled',
    'assetCategories/deleteCategory/fulfilled',
    'assetCategories/addCategoryOption/fulfilled',
    'assetCategories/updateCategoryOption/fulfilled',
    'assetCategories/deleteCategoryOption/fulfilled',
    'assetCategories/addCategoryAssignment/fulfilled',
    'assetCategories/updateCategoryAssignment/fulfilled',
    'assetCategories/deleteCategoryAssignment/fulfilled',
  ];
  
  // Invalidate cache if action type matches
  if (cacheInvalidatingActions.includes(action.type)) {
    Logger.info(`Action ${action.type} detected, invalidating portfolio cache`);
    try {
      store.dispatch(invalidatePortfolioCache());
    } catch (error) {
      Logger.error(`Failed to invalidate portfolio cache: ${error}`);
      // Continue with original result even if cache invalidation fails
    }
  }
  
  return result;
};

export default portfolioCacheMiddleware;
