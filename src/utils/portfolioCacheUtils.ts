import Logger from '../service/Logger/logger';
import { LegacyPortfolioCache } from '../types/domains/portfolio/cache';

/**
 * Validates if a portfolio cache from localStorage is still valid
 */
export const validatePortfolioCache = (
  cache: LegacyPortfolioCache | undefined,
  cacheValid: boolean
): boolean => {
  if (!cache || !cacheValid) {
    Logger.info('Portfolio cache is missing or marked as invalid');
    return false;
  }

  // Check if cache is too old (older than 24 hours)
  const cacheAge = Date.now() - new Date(cache.metadata.lastCalculated).getTime();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  
  if (cacheAge > maxAge) {
    Logger.info(`Portfolio cache is too old: ${cacheAge / 1000 / 60 / 60} hours`);
    return false;
  }

  // Check if cache has required data structure
  if (!cache.positions || !cache.totals || !cache.metadata) {
    Logger.info('Portfolio cache has invalid structure');
    return false;
  }

  // Check if positions have formatted values (new requirement)
  const hasFormattedValues = cache.positions.every(position => 
    position.formatted && 
    typeof position.formatted.currentValue === 'string'
  );

  if (!hasFormattedValues) {
    Logger.info('Portfolio cache missing formatted values, needs recalculation');
    return false;
  }

  Logger.info(`Portfolio cache is valid: ${cache.positions.length} positions, calculated at ${cache.metadata.lastCalculated}`);
  return true;
};

/**
 * Gets the cache validity based on data hashes
 */
export const getCacheValidityFromHashes = (
  cache: LegacyPortfolioCache | undefined,
  currentAssetHash: string,
  currentDefinitionHash: string,
  currentCategoryHash: string
): boolean => {
  if (!cache?.metadata) return false;

  const combinedCurrentHash = generateCombinedHash(currentAssetHash, currentDefinitionHash, currentCategoryHash);
  return cache.metadata.combinedHash === combinedCurrentHash;
};

/**
 * Simple hash generation for comparison
 */
function generateCombinedHash(assetHash: string, definitionHash: string, categoryHash: string): string {
  return btoa(`${assetHash}-${definitionHash}-${categoryHash}`).slice(0, 16);
}
