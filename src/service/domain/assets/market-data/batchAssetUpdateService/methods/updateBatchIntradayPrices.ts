import type { AssetDefinition } from '@/types/domains/assets/entities';
import type { BatchResult } from '@/types/shared/batch';
import type { ApiConfig } from '@/types/shared/apiConfig';
import { StockPriceUpdater } from '@/service/shared/utilities/helper/stockPriceUpdater';

/**
 * Provider-agnostische Batch-Methode für Intraday-Preisdaten.
 * Nutzt StockPriceUpdater.updateIntradayHistory für alle gültigen Ticker.
 * Supports both main thread (using configured service) and worker usage (with API config).
 */
export async function updateBatchIntradayPrices(
  definitions: AssetDefinition[],
  days: number = 1,
  apiConfig?: ApiConfig
): Promise<{ type: 'batchResult'; results: BatchResult<AssetDefinition>[] }> {
  const validDefs = definitions.filter((def) => typeof def.ticker === 'string' && def.ticker);
  const results: BatchResult<AssetDefinition>[] = [];

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

    // Convert successful updates to BatchResult format
    for (const updatedDef of updatedDefinitions) {
      results.push({
        success: true,
        updatedDefinition: updatedDef,
        symbol: updatedDef.ticker,
      });
    }

    // Add failed results for definitions that weren't updated
    const updatedTickers = new Set(updatedDefinitions.map(def => def.ticker));
    for (const def of validDefs) {
      if (!updatedTickers.has(def.ticker)) {
        results.push({
          success: false,
          symbol: def.ticker,
          error: 'Failed to update intraday history',
        });
      }
    }

  } catch (error) {
    // If the entire operation fails, mark all as failed
    for (const def of validDefs) {
      results.push({
        success: false,
        symbol: def.ticker,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return { type: 'batchResult', results };
}
