import { AssetDefinition } from '@/types/domains/assets';
import { TimeRangePeriod } from '@/types/shared/time';
import { stockAPIService } from '@service/domain/assets';
import { batchAssetUpdateService } from '@/service/domain/assets/market-data/batchAssetUpdateService';
import { BatchResult } from '@/types/shared/batch';
import { addIntradayPriceHistory } from '@/utils/priceHistoryUtils';

// Result for individual stock history update
interface StockHistoryUpdateResult {
  symbol: string;
  success: boolean;
  updatedDefinition?: AssetDefinition;
  entriesCount?: number;
  error?: string;
}

// Message types for communication with main thread
type WorkerRequest =
  | { type: 'updateBatch', definitions: AssetDefinition[], period?: TimeRangePeriod }
  | { type: 'updateSingle', definition: AssetDefinition, period?: TimeRangePeriod }
  | { type: 'updateBatchDefault', definitions: AssetDefinition[] }
  | { type: 'updateSingleDefault', definition: AssetDefinition }
  | { type: 'updateBatchIntraday', definitions: AssetDefinition[], days?: number }
  | { type: 'updateSingleIntraday', definition: AssetDefinition, days?: number };

type WorkerResponse =
  | { type: 'batchResult', results: StockHistoryUpdateResult[] }
  | { type: 'singleResult', result: StockHistoryUpdateResult }
  | { type: 'error', error: string };

// --- Update Functions ---
// All update logic is delegated to the existing StockPriceUpdater service.
// This worker only orchestrates and provides batch processing with individual error handling.


async function updateBatchStockHistory(
  definitions: AssetDefinition[],
  period?: TimeRangePeriod
): Promise<StockHistoryUpdateResult[]> {
  const response = await batchAssetUpdateService.updateBatchHistoryData(definitions, period);
  if (response && response.type === 'batchResult' && Array.isArray(response.results)) {
    return response.results.map((r: BatchResult<AssetDefinition>) => ({
      symbol: r.symbol ?? '',
      success: r.success,
      updatedDefinition: r.updatedDefinition,
      entriesCount: r.updatedDefinition?.priceHistory?.length,
      error: r.error
    }));
  }
  return [{ symbol: '', success: false, error: 'batchAssetUpdateService.updateBatchHistoryData failed' }];
}

async function updateSingleStockIntraday(
  definition: AssetDefinition,
  days: number = 1
): Promise<StockHistoryUpdateResult> {
  try {
    if (definition.type !== 'stock' || !definition.ticker) {
      return {
        symbol: definition.ticker || definition.name || 'unknown',
        success: false,
        error: 'Not a stock or missing ticker symbol'
      };
    }

    // Provider-agnostisch: zentrale Service-Methode nutzen
    const intradayData = await stockAPIService.getIntradayHistory(definition.ticker, days);

    if (!intradayData?.entries || intradayData.entries.length === 0) {
      return {
        symbol: definition.ticker,
        success: false,
        error: 'No intraday data received from API'
      };
    }

    // Map intraday data to price history format preserving minute-level timestamps
    const newPriceEntries = intradayData.entries.map((entry: unknown) => ({
      date: new Date((entry as { timestamp: number }).timestamp).toISOString(),
      price: (entry as { close: number }).close,
      source: 'api' as const
    }));

    // Use addIntradayPriceHistory to properly merge with existing history
    const existingHistory = definition.priceHistory || [];
    const updatedHistory = addIntradayPriceHistory(newPriceEntries, existingHistory, 500);

    const updatedDefinition = {
      ...definition,
      priceHistory: updatedHistory,
      lastPriceUpdate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      symbol: definition.ticker,
      success: true,
      updatedDefinition,
      entriesCount: newPriceEntries.length
    };
  } catch (error: unknown) {
    return {
      symbol: definition.ticker || definition.name || 'unknown',
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function updateBatchStockIntraday(
  definitions: AssetDefinition[],
  days: number = 1
): Promise<StockHistoryUpdateResult[]> {
  const results: StockHistoryUpdateResult[] = [];
  // Filter to only stock definitions with tickers
  const stockDefinitions = definitions.filter(def =>
    def.type === 'stock' && def.ticker
  );
  // Process each definition individually to ensure partial failures don't stop the batch
  for (const definition of stockDefinitions) {
    const result = await updateSingleStockIntraday(definition, days);
    results.push(result);
  }
  return results;
}

// --- Worker Event Handling ---

self.onmessage = function (e: MessageEvent<WorkerRequest>) {
  if (e.data.type === 'updateBatch') {
    updateBatchStockHistory(e.data.definitions, e.data.period).then(results => {
      const response: WorkerResponse = { type: 'batchResult', results };
      self.postMessage(response);
    }).catch(error => {
      self.postMessage({ type: 'error', error: error instanceof Error ? error.message : String(error) });
    });
  } else if (e.data.type === 'updateBatchDefault') {
    updateBatchStockHistory(e.data.definitions).then(results => {
      const response: WorkerResponse = { type: 'batchResult', results };
      self.postMessage(response);
    }).catch(error => {
      self.postMessage({ type: 'error', error: error instanceof Error ? error.message : String(error) });
    });
  } else if (e.data.type === 'updateBatchIntraday') {
    updateBatchStockIntraday(e.data.definitions, e.data.days).then(results => {
      const response: WorkerResponse = { type: 'batchResult', results };
      self.postMessage(response);
    }).catch(error => {
      self.postMessage({ type: 'error', error: error instanceof Error ? error.message : String(error) });
    });
  } else if (e.data.type === 'updateSingleIntraday') {
    updateSingleStockIntraday(e.data.definition, e.data.days).then(result => {
      const response: WorkerResponse = { type: 'singleResult', result };
      self.postMessage(response);
    }).catch(error => {
      self.postMessage({ type: 'error', error: error instanceof Error ? error.message : String(error) });
    });
  }
};