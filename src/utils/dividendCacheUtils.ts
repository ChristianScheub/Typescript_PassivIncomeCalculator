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
  // Use assetDefinition data only (legacy fields have been removed from Asset interface)
  const dividendInfo = asset.assetDefinition?.dividendInfo;
  const interestRate = asset.assetDefinition?.bondInfo?.interestRate;
  const rentalInfo = asset.assetDefinition?.rentalInfo;
  
  const relevantData = {
    dividendInfo: dividendInfo,
    currentQuantity: asset.currentQuantity,
    purchaseQuantity: asset.purchaseQuantity,
    currentPrice: asset.currentPrice,
    type: asset.type,
    interestRate: interestRate,
    value: asset.value,
    rentalInfo: rentalInfo,
    // Include assetDefinitionId to detect when definition changes
    assetDefinitionId: asset.assetDefinitionId
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