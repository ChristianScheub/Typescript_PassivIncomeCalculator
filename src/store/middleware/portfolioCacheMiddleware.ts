import { Middleware } from '@reduxjs/toolkit';
import { invalidatePortfolioCache } from '../slices/assetsSlice';
import Logger from '../../service/Logger/logger';
import { RootState } from '../index';

/**
 * Middleware to automatically invalidate portfolio cache when related data changes
 */
export const portfolioCacheMiddleware: Middleware<{}, RootState> = (store) => (next) => (action: any) => {
  const result = next(action);
  
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
  
  if (cacheInvalidatingActions.includes(action.type)) {
    Logger.info(`Action ${action.type} detected, invalidating portfolio cache`);
    store.dispatch(invalidatePortfolioCache());
  }
  
  return result;
};

export default portfolioCacheMiddleware;
