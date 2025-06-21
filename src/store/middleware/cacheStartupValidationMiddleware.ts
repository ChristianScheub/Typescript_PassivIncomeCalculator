import { Middleware, AnyAction } from '@reduxjs/toolkit';
import { StoreState } from '..';
import { validateCacheOnStartup } from '../slices/calculatedDataSlice';
import Logger from '../../service/shared/logging/Logger/logger';

// Type guard to check if action has a type property
function isActionWithType(action: unknown): action is AnyAction {
  return typeof action === 'object' && action !== null && 'type' in action && typeof (action as AnyAction).type === 'string';
}

/**
 * Middleware that validates cache on app startup
 * This ensures that cached data loaded from localStorage is still valid
 */
const cacheStartupValidationMiddleware: Middleware<object, StoreState> = (store) => {
  let hasValidated = false;
  
  return (next) => (action: unknown) => {
    const result = next(action);
    
    // Validate cache once after store is hydrated from localStorage
    if (!hasValidated && isActionWithType(action) && (action.type === '@@INIT' || action.type.includes('HYDRATE'))) {
      hasValidated = true;
      Logger.cache('Store initialized, validating cached data from localStorage');
      store.dispatch(validateCacheOnStartup());
    }
    
    // Also validate when the first selector is called (ensures we catch all startup scenarios)
    if (!hasValidated && isActionWithType(action) && action.type.includes('calculatedData/')) {
      hasValidated = true;
      Logger.cache('First calculatedData action detected, validating cache');
      store.dispatch(validateCacheOnStartup());
    }
    
    return result;
  };
};

export default cacheStartupValidationMiddleware;
