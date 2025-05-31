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
    type: asset.type
  };
  
  const dataString = JSON.stringify(relevantData, Object.keys(relevantData).sort());
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
 * Invalidates cached dividends for all assets that might be affected by changes
 */
export function shouldInvalidateCache(oldAsset: Asset, newAsset: Asset): boolean {
  const oldHash = generateDividendCalculationHash(oldAsset);
  const newHash = generateDividendCalculationHash(newAsset);
  return oldHash !== newHash;
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