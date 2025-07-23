/**
 * Utility functions for generating hashes for caching purposes
 */

import { AssetDefinition, Transaction } from '@/types/domains/assets';

/**
 * Simple hash function for generating consistent hash strings from objects
 * @param obj - Object to hash
 * @returns Hash string
 */
export const simpleHash = (obj: Record<string, unknown> | unknown[]): string => {
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
export const generateAssetHash = (assets: Transaction[]): string => {
  const relevantData = assets.map(a => {
    // explizit nur die stabilen Felder extrahieren
    return {
      id: a.id,
      quantity: a.purchaseQuantity || (a as unknown as { currentQuantity: number }).currentQuantity,
      transactionType: a.transactionType,
      assetDefinitionId: a.assetDefinitionId
    };
  });
  return simpleHash(relevantData);
};

/**
 * Generate hash for asset definition data (for cache validation)
 * @param definitions - Array of asset definitions
 * @returns Hash string
 */
export const generateDefinitionHash = (definitions: AssetDefinition[]): string => {
  const relevantData = definitions.map(d => ({
    id: d.id,
    type: d.type,
    isin: d.isin,
    wkn: d.wkn
    // Nur stabile, statische Felder!
  }));
  return simpleHash(relevantData);
};

// Entferne die doppelten Exporte und Imports, alles bleibt lokal in dieser Datei

export function generatePortfolioInputHash(assets: Transaction[], assetDefinitions: AssetDefinition[]): string {
  // Sortierung für Stabilität
  const assetHash = generateAssetHash([...assets].sort((a, b) => a.id.localeCompare(b.id)));
  const definitionHash = generateDefinitionHash([...assetDefinitions].sort((a, b) => a.id.localeCompare(b.id)));
  return `${assetHash}_${definitionHash}`;
}
