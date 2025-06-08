/**
 * Utility functions for generating hashes for caching purposes
 */

/**
 * Simple hash function for generating consistent hash strings from objects
 * @param obj - Object to hash
 * @returns Hash string
 */
export const simpleHash = (obj: any): string => {
  const str = JSON.stringify(obj);
  let hash = 0;
  
  if (str.length === 0) return hash.toString();
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36);
};

/**
 * Generate hash for asset data (for cache validation)
 * @param assets - Array of assets
 * @returns Hash string
 */
export const generateAssetHash = (assets: any[]): string => {
  const relevantData = assets.map(a => ({
    id: a.id,
    quantity: a.purchaseQuantity || a.currentQuantity,
    price: a.purchasePrice || a.currentPrice,
    updatedAt: a.updatedAt
  }));
  
  return simpleHash(relevantData);
};

/**
 * Generate hash for asset definition data (for cache validation)
 * @param definitions - Array of asset definitions
 * @returns Hash string
 */
export const generateDefinitionHash = (definitions: any[]): string => {
  const relevantData = definitions.map(d => ({
    id: d.id,
    dividendInfo: d.dividendInfo,
    currentPrice: d.currentPrice,
    updatedAt: d.updatedAt
  }));
  
  return simpleHash(relevantData);
};
