import { stockAPIService } from '@/service/domain/assets/market-data/stockAPIService';
import type { AssetDefinition } from '@/types/domains/assets/entities';
import type { BatchResult } from '@/types/shared/batch';

/**
 * Provider-agnostische Batch-Methode für aktuelle Aktienpreise.
 * Nutzt stockAPIService.getCurrentStockPrice für alle gültigen Ticker.
 */
export async function updateBatchCurrentPrices(
  definitions: AssetDefinition[]
): Promise<{ type: 'batchResult'; results: BatchResult<AssetDefinition>[] }> {
  const validDefs = definitions.filter((def) => typeof def.ticker === 'string' && def.ticker);
  const results: BatchResult<AssetDefinition>[] = await Promise.all(
    validDefs.map(async (def): Promise<BatchResult<AssetDefinition>> => {
      try {
        const price = await stockAPIService.getCurrentStockPrice(def.ticker!);
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
