import dataChangeMiddleware from '../middleware/dataChangeMiddleware';
import portfolioCacheMiddleware from '../middleware/portfolioCacheMiddleware';
import calculatedDataCacheMiddleware from '../middleware/calculatedDataCacheMiddleware';
import assetCalculationCacheMiddleware from '../middleware/assetCalculationCacheMiddleware';
import storageValidationMiddleware from '../middleware/storageValidationMiddleware';
import financialSummaryMiddleware from '../middleware/financialSummaryListener';
import Logger from '@service/shared/logging/Logger/logger';

/**
 * Centralized middleware configuration
 * Handles the middleware chain setup for the store
 * Order matters: middleware is executed from first to last
 */
export const middlewareConfig = (getDefaultMiddleware: any) => {
  const middleware = getDefaultMiddleware({
    serializableCheck: {
      // Ignore specific action types and state paths that contain non-serializable values
      ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      ignoredPaths: ['register', 'rehydrate'],
    },
    immutableCheck: {
      // Disable immutable check for large state objects to improve performance
      warnAfter: 128,
    },
  }).concat(
    // Cache management middleware (order-sensitive)
    portfolioCacheMiddleware as any,           // Portfolio cache invalidation
    calculatedDataCacheMiddleware as any,     // Calculated data cache management  
    assetCalculationCacheMiddleware as any,   // Asset calculation cache
    financialSummaryMiddleware as any,        // Financial summary auto-calculation
    storageValidationMiddleware as any,       // Storage health monitoring
    dataChangeMiddleware as any,              // Data mutation handling (should be last)
  );

  if (process.env.NODE_ENV === 'development') {
    Logger.infoRedux('Middleware chain configured with enhanced settings');
  }

  return middleware;
};
