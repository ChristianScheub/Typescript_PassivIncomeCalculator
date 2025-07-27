import { stockAPIService } from '@/service/domain/assets/market-data/stockAPIService';
import type { AssetDefinition } from '@/types/domains/assets/entities';
import type { BatchResult } from '@/types/shared/batch';
import type { ApiConfig } from '@/types/shared/apiConfig';

/**
 * Provider-agnostische Batch-Methode für aktuelle Aktienpreise.
 * Nutzt stockAPIService.getCurrentStockPrice für alle gültigen Ticker.
 * Supports both main thread (using configured service) and worker usage (with API config).
 */
export async function updateBatchCurrentPrices(
  definitions: AssetDefinition[],
  apiConfig?: ApiConfig
): Promise<{ type: 'batchResult'; results: BatchResult<AssetDefinition>[] }> {
  const validDefs = definitions.filter((def) => typeof def.ticker === 'string' && def.ticker);
  const results: BatchResult<AssetDefinition>[] = await Promise.all(
    validDefs.map(async (def): Promise<BatchResult<AssetDefinition>> => {
      try {
        let price;
        
        if (apiConfig) {
          // Worker mode: Use StockPriceUpdater with API config
          const { StockPriceUpdater } = await import('@/service/shared/utilities/helper/stockPriceUpdater');
          const updatedDefs = await StockPriceUpdater.updateStockPrices([def], apiConfig.apiKeys, apiConfig.selectedProvider);
          if (updatedDefs.length > 0 && updatedDefs[0].currentPrice !== undefined) {
            price = { price: updatedDefs[0].currentPrice };
          } else {
            throw new Error('No price data received from StockPriceUpdater');
          }
        } else {
          // Main thread mode: Use configured stockAPIService
          price = await stockAPIService.getCurrentStockPrice(def.ticker!);
        }
        
        return {
          success: true,
          updatedDefinition: {
            ...def,
            currentPrice: price.price,
            lastPriceUpdate: new Date().toISOString(),
          },
          symbol: def.ticker,
        };
      } catch (error) {
        return {
          success: false,
          symbol: def.ticker,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    })
  );
  return { type: 'batchResult', results };
}
