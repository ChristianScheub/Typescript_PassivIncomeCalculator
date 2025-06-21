import { Middleware } from '@reduxjs/toolkit';
import { StoreState } from '..';
import { validateCacheOnStartup } from '../slices/calculatedDataSlice';
import Logger from '../../service/shared/logging/Logger/logger';

/**
 * Middleware that validates cache on app startup
 * This ensures that cached data loaded from localStorage is still valid
 */
const cacheStartupValidationMiddleware: Middleware<{}, StoreState> = (store) => {
  let hasValidated = false;
  
  return (next) => (action: any) => {
    const result = next(action);
    
    // Validate cache once after store is hydrated from localStorage
    if (!hasValidated && action.type === '@@INIT' || action.type.includes('HYDRATE')) {
      hasValidated = true;
      Logger.cache('Store initialized, validating cached data from localStorage');
      store.dispatch(validateCacheOnStartup());
    }
    
    // Also validate when the first selector is called (ensures we catch all startup scenarios)
    if (!hasValidated && action.type.includes('calculatedData/')) {
      hasValidated = true;
      Logger.cache('First calculatedData action detected, validating cache');
      store.dispatch(validateCacheOnStartup());
    }
    
    return result;
  };
};

export default cacheStartupValidationMiddleware;
