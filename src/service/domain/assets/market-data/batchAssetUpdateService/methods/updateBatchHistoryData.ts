import { stockAPIService } from '@/service/domain/assets/market-data/stockAPIService';
import type { AssetDefinition } from '@/types/domains/assets/entities';
import type { PriceHistoryEntry } from '@/types/domains/assets/market-data';
import type { BatchResult } from '@/types/shared/batch';
import type { TimeRangePeriod } from '@/types/shared/time';
import type { ApiConfig } from '@/types/shared/apiConfig';
import { StockPriceUpdater } from '@/service/shared/utilities/helper/stockPriceUpdater';

// Main batch update for price history (provider-agnostisch)
// Supports both main thread (using configured service) and worker usage (with API config)

export async function updateBatchHistoryData(
  definitions: AssetDefinition[],
  period?: TimeRangePeriod,
  apiConfig?: ApiConfig
): Promise<{ type: 'batchResult'; results: BatchResult<AssetDefinition>[] }> {
  const days = period && typeof period === 'number' ? period : 30;
  const validDefs = definitions.filter((def: AssetDefinition) => typeof def.ticker === 'string' && def.ticker);
  const results: BatchResult<AssetDefinition>[] = await Promise.all(validDefs.map(async (def: AssetDefinition): Promise<BatchResult<AssetDefinition>> => {
    try {
      let priceHistory: PriceHistoryEntry[];
      
      if (apiConfig) {
        // Worker mode: Use StockPriceUpdater with API config
        const updatedDefs = period 
          ? await StockPriceUpdater.updateStockHistoricalDataWithPeriod([def], period, apiConfig.apiKeys, apiConfig.selectedProvider)
          : await StockPriceUpdater.updateStockHistoricalData([def], apiConfig.apiKeys, apiConfig.selectedProvider);
        
        if (updatedDefs.length > 0 && updatedDefs[0].priceHistory) {
          priceHistory = updatedDefs[0].priceHistory;
        } else {
          throw new Error('No price history data received from StockPriceUpdater');
        }
      } else {
        // Main thread mode: Use configured stockAPIService
        const history = await stockAPIService.getHistory(def.ticker! as string, days);
        priceHistory = history.entries.map((e: { date: string; close: number }) => ({
          date: e.date,
          price: e.close,
          source: 'api',
        }));
      }
      
      return { success: true, updatedDefinition: { ...def, priceHistory }, symbol: def.ticker };
    } catch (error) {
      return { success: false, symbol: def.ticker, error: error instanceof Error ? error.message : String(error) };
    }
  }));
  return { type: 'batchResult', results };
}
