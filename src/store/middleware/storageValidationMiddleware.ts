import { Middleware, AnyAction } from '@reduxjs/toolkit';
import { StateHydrationService } from '../services/stateHydrationService';
import Logger from '@service/shared/logging/Logger/logger';
import { StoreState } from '../index';

// Type guard to check if action has a type property
function isActionWithType(action: unknown): action is AnyAction {
  return typeof action === 'object' && action !== null && 'type' in action;
}

/**
 * Storage Validation Middleware
 * Monitors localStorage size and warns when approaching limits
 * Provides storage health monitoring for the application
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const storageValidationMiddleware: Middleware<object, StoreState> = (_store) => (next) => (action: unknown) => {
  // Process the action first
  const result = next(action);
  
  // Check if action has type property
  if (!isActionWithType(action)) {
    return result;
  }
  
  // Monitor storage after state-changing actions
  if (action.type.includes('/fulfilled') || action.type.includes('/pending')) {
    // Throttled storage monitoring (don't check on every action)
    const shouldMonitor = Math.random() < 0.1; // 10% of actions
    
    if (shouldMonitor) {
      try {
        const storageSize = StateHydrationService.getStorageSize();
        const maxSize = 5 * 1024 * 1024; // 5MB warning threshold
        
        if (storageSize > maxSize * 0.8) { // 80% of max size
          Logger.warn(`localStorage approaching size limit: ${Math.round(storageSize / 1024)}KB / ${Math.round(maxSize / 1024)}KB`);
        }
        
        // Log storage info in development
        if (process.env.NODE_ENV === 'development' && storageSize > 1024 * 1024) { // > 1MB
          Logger.infoRedux(`Storage size: ${Math.round(storageSize / 1024)}KB`);
        }
        
      } catch (error) {
        Logger.error(`Storage validation error: ${error}`);
      }
    }
  }
  
  return result;
};

export default storageValidationMiddleware;
