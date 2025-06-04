import { Asset, CachedDividends } from '../types';

/**
 * Simple hash function for browser environments
 */
function simpleHash(str: string): string {
  let hash = 0;
  if (str.length === 0) return hash.toString(16);
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash).toString(16);
}

/**
 * Generates a hash for dividend calculation parameters to detect changes
 */
export function generateDividendCalculationHash(asset: Asset): string {
  const relevantData = {
    dividendInfo: asset.dividendInfo,
    quantity: asset.quantity,
    currentPrice: asset.currentPrice,
    type: asset.type,
    interestRate: asset.interestRate,
    value: asset.value
  };

  const dataString = JSON.stringify(relevantData, Object.keys(relevantData).sort(compareAlphabetically));
  return simpleHash(dataString);
}

/**
 * Checks if cached dividend data is still valid
 */
export function isDividendCacheValid(asset: Asset): boolean {
  if (!asset.cachedDividends) {
    return false;
  }
  
  const currentHash = generateDividendCalculationHash(asset);
  return asset.cachedDividends.calculationHash === currentHash;
}

/**
 * Creates a new cached dividends object
 */
export function createCachedDividends(
  monthlyAmount: number,
  annualAmount: number,
  monthlyBreakdown: Record<number, number>,
  asset: Asset
): CachedDividends {
  return {
    monthlyAmount,
    annualAmount,
    monthlyBreakdown,
    lastCalculated: new Date().toISOString(),
    calculationHash: generateDividendCalculationHash(asset)
  };
}

/**
 * Extracts cached dividend data if valid, otherwise returns null
 */
export function getCachedDividendData(asset: Asset): CachedDividends | null {
  if (isDividendCacheValid(asset)) {
    return asset.cachedDividends!;
  }
  return null;
}

/**
 * Determines if the dividend cache should be invalidated by comparing two assets
 */
export function shouldInvalidateCache(oldAsset: Asset, newAsset: Asset): boolean {
  // If there's no cache in the old asset, no need to invalidate
  if (!oldAsset.cachedDividends) {
    return false;
  }
  
  // Generate hashes for both assets and compare
  const oldHash = generateDividendCalculationHash(oldAsset);
  const newHash = generateDividendCalculationHash(newAsset);
  
  // If hashes are different, cache should be invalidated
  return oldHash !== newHash;
}

/**
 * Compare function for sorting strings alphabetically using localeCompare
 */
export function compareAlphabetically(a: string, b: string): number {
  return a.localeCompare(b);
}