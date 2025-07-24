import { stockAPIService } from '@/service/domain/assets/market-data/stockAPIService';
import type { AssetDefinition } from '@/types/domains/assets/entities';
import type { PriceHistoryEntry } from '@/types/domains/assets/market-data';
import type { BatchResult } from '@/types/shared/batch';
import type { TimeRangePeriod } from '@/types/shared/time';

// Main batch update for price history (provider-agnostisch)

export async function updateBatchHistoryData(
  definitions: AssetDefinition[],
  period?: TimeRangePeriod
): Promise<{ type: 'batchResult'; results: BatchResult<AssetDefinition>[] }> {
  const days = period && typeof period === 'number' ? period : 30;
  const validDefs = definitions.filter((def: AssetDefinition) => typeof def.ticker === 'string' && def.ticker);
  const results: BatchResult<AssetDefinition>[] = await Promise.all(validDefs.map(async (def: AssetDefinition): Promise<BatchResult<AssetDefinition>> => {
    try {
      const history = await stockAPIService.getHistory(def.ticker! as string, days);
      const priceHistory: PriceHistoryEntry[] = history.entries.map((e: { date: string; close: number }) => ({
        date: e.date,
        price: e.close,
        source: 'api',
      }));
      return { success: true, updatedDefinition: { ...def, priceHistory }, symbol: def.ticker };
    } catch (error) {
      return { success: false, symbol: def.ticker, error: error instanceof Error ? error.message : String(error) };
    }
  }));
  return { type: 'batchResult', results };
}
