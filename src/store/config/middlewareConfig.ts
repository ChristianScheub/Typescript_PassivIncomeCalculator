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
export const middlewareConfig = () => {
  const middleware = [
    portfolioCacheMiddleware,
    calculatedDataCacheMiddleware,
    assetCalculationCacheMiddleware,
    financialSummaryMiddleware,
    storageValidationMiddleware,
    dataChangeMiddleware,
  ];
  if (process.env.NODE_ENV === 'development') {
    Logger.infoRedux('Middleware chain configured with enhanced settings');
  }
  return middleware;
};
