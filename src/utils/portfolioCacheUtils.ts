import Logger from '@/service/shared/logging/Logger/logger';
import { PortfolioCache } from '@/store/slices/transactionsSlice';

/**
 * Validates if a portfolio cache from localStorage is still valid
 */
export const validatePortfolioCache = (
  cache: PortfolioCache | undefined,
  cacheValid: boolean
): boolean => {
  if (!cache || !cacheValid) {
    Logger.info('Portfolio cache is missing or marked as invalid');
    return false;
  }

  // Check cache age (max 24 hours for persisted data, more lenient than before)
  const cacheAge = Date.now() - new Date(cache.lastCalculated).getTime();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  
  if (cacheAge > maxAge) {
    Logger.info(`Portfolio cache is too old: ${Math.round(cacheAge / 1000 / 60 / 60)} hours`);
    return false;
  }

  // Check cache structure
  if (!cache.positions || !cache.totals) {
    Logger.info('Portfolio cache has invalid structure - missing positions or totals');
    return false;
  }

  // Additional validation
  if (!Array.isArray(cache.positions)) {
    Logger.info('Portfolio cache positions is not an array');
    return false;
  }

  if (typeof cache.totals !== 'object') {
    Logger.info('Portfolio cache totals is not an object');
    return false;
  }

  Logger.info(`Portfolio cache is valid: ${cache.positions.length} positions, calculated at ${cache.lastCalculated}`);
  return true;
};
