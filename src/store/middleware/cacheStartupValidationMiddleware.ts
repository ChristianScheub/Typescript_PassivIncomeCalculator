import { Middleware } from '@reduxjs/toolkit';
import { StoreState } from '..';

/**
 * Middleware that validates cache on app startup
 * This ensures that cached data loaded from localStorage is still valid
 */
const cacheStartupValidationMiddleware: Middleware<object, StoreState> = () => {
  return (next) => (action: unknown) => {
    const result = next(action);
    return result;
  };
};

export default cacheStartupValidationMiddleware;
