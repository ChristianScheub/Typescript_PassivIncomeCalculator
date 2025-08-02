import type { AssetDefinition } from '@/types/domains/assets/entities';
import type { BatchResult } from '@/types/shared/batch';
import type { ApiConfig } from '@/types/shared/apiConfig';
import type { PriceHistoryEntry } from '@/types/domains/assets';
import { StockPriceUpdater } from '@/service/shared/utilities/helper/stockPriceUpdater';
import Logger from '@/service/shared/logging/Logger/logger';

/**
 * Helper function to ensure each asset definition has a price for intraday calculation.
 * If no current intraday data is available, uses the closest available price from price history.
 */
function ensurePriceAvailability(
  definition: AssetDefinition,
  targetTimestamp: string = new Date().toISOString()
): AssetDefinition {
  if (!definition.priceHistory || definition.priceHistory.length === 0) {
    return definition; // No price history available, return as-is
  }

  const targetDate = new Date(targetTimestamp);
  const targetDateStr = targetTimestamp.split('T')[0];
  
  // Check if we already have a price for today (intraday or daily)
  const hasRecentPrice = definition.priceHistory.some(entry => {
    const entryDate = entry.date.split('T')[0];
    return entryDate === targetDateStr;
  });

  if (hasRecentPrice) {
    return definition; // Already has recent price
  }

  // Find the closest available price (prefer the most recent one before target date)
  const sortedHistory = [...definition.priceHistory]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  let closestPrice: PriceHistoryEntry | null = null;

  // First, try to find the most recent price before or on target date
  for (const entry of sortedHistory) {
    const entryDate = new Date(entry.date);
    if (entryDate <= targetDate) {
      closestPrice = entry;
      break;
    }
  }

  // If no price found before target date, use the earliest available price after target date
  if (!closestPrice && sortedHistory.length > 0) {
    closestPrice = sortedHistory[sortedHistory.length - 1]; // Earliest available price
  }

  if (closestPrice) {
    // Create a fallback price entry for today using the closest available price
    const fallbackPriceEntry: PriceHistoryEntry = {
      date: targetTimestamp,
      price: closestPrice.price,
      source: 'manual' as const
    };

    const updatedHistory = [fallbackPriceEntry, ...definition.priceHistory];

    return {
      ...definition,
      priceHistory: updatedHistory,
      lastPriceUpdate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  return definition; // No usable price found, return as-is
}

/**
 * Provider-agnostische Batch-Methode für Intraday-Preisdaten.
 * Nutzt StockPriceUpdater.updateIntradayHistory für alle gültigen Ticker.
 * Ensures that EVERY asset definition has a price for intraday calculation,
 * using fallback to closest available price if no current intraday data exists.
 * Supports both main thread (using configured service) and worker usage (with API config).
 */
export async function updateBatchIntradayPrices(
  definitions: AssetDefinition[],
  days: number = 1,
  apiConfig?: ApiConfig
): Promise<{ type: 'batchResult'; results: BatchResult<AssetDefinition>[] }> {
  const validDefs = definitions.filter((def) => typeof def.ticker === 'string' && def.ticker);
  const results: BatchResult<AssetDefinition>[] = [];
  const targetTimestamp = new Date().toISOString();

  try {
    let updatedDefinitions: AssetDefinition[];

    if (apiConfig) {
      // Worker mode: Use StockPriceUpdater with API config
      updatedDefinitions = await StockPriceUpdater.updateIntradayHistory(
        validDefs, 
        days, 
        apiConfig.apiKeys, 
        apiConfig.selectedProvider
      );
    } else {
      // Main thread mode: Use StockPriceUpdater without API config (uses configured stockAPIService)
      updatedDefinitions = await StockPriceUpdater.updateIntradayHistory(validDefs, days);
    }

    // Track which definitions were successfully updated with new intraday data
    const updatedTickers = new Set(updatedDefinitions.map(def => def.ticker));
    
    // Process all definitions - both successfully updated and those that failed to get new data
    const processedDefinitions: AssetDefinition[] = [];
    
    for (const originalDef of validDefs) {
      if (updatedTickers.has(originalDef.ticker)) {
        // Use the updated definition with new intraday data
        const updatedDef = updatedDefinitions.find(def => def.ticker === originalDef.ticker)!;
        processedDefinitions.push(updatedDef);
        
        results.push({
          success: true,
          updatedDefinition: updatedDef,
          symbol: updatedDef.ticker,
        });
      } else {
        // No new intraday data available - ensure price availability using fallback
        const definitionWithFallbackPrice = ensurePriceAvailability(originalDef, targetTimestamp);
        processedDefinitions.push(definitionWithFallbackPrice);
        
        results.push({
          success: true,
          updatedDefinition: definitionWithFallbackPrice,
          symbol: definitionWithFallbackPrice.ticker,
          // Add note if fallback price was used
          error: definitionWithFallbackPrice !== originalDef ? 'Using fallback price from history' : undefined,
        });
      }
    }

  } catch (error) {
    // If the entire operation fails, still try to ensure price availability with fallbacks
    for (const def of validDefs) {
      try {
        const definitionWithFallbackPrice = ensurePriceAvailability(def, targetTimestamp);
        results.push({
          success: true,
          updatedDefinition: definitionWithFallbackPrice,
          symbol: definitionWithFallbackPrice.ticker,
          error: `API update failed, using fallback price: ${error instanceof Error ? error.message : String(error)}`,
        });
      } catch (fallbackError) {
        Logger.error(`[updateBatchIntradayPrices] Fallback price update failed for ${def.ticker}: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`);
        results.push({
          success: false,
          symbol: def.ticker,
          error: `Both API update and fallback failed: ${error instanceof Error ? error.message : String(error)}`,
        });
      }
    }
  }

  return { type: 'batchResult', results };
}
