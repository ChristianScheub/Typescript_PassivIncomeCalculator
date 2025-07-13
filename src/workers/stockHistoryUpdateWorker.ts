import { AssetDefinition } from '@/types/domains/assets';
import { TimeRangePeriod } from '@/types/shared/time';
import { StockPriceUpdater } from '@/service/shared/utilities/helper/stockPriceUpdater';

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
  | { type: 'updateSingleDefault', definition: AssetDefinition };

type WorkerResponse =
  | { type: 'batchResult', results: StockHistoryUpdateResult[] }
  | { type: 'singleResult', result: StockHistoryUpdateResult }
  | { type: 'error', error: string };

// --- Update Functions ---
// All update logic is delegated to the existing StockPriceUpdater service.
// This worker only orchestrates and provides batch processing with individual error handling.

async function updateSingleStockHistory(
  definition: AssetDefinition, 
  period?: TimeRangePeriod
): Promise<StockHistoryUpdateResult> {
  try {
    if (definition.type !== 'stock' || !definition.ticker) {
      return {
        symbol: definition.ticker || definition.name || 'unknown',
        success: false,
        error: 'Not a stock or missing ticker symbol'
      };
    }

    // Use existing service to update single definition
    const updatedDefinitions = period
      ? await StockPriceUpdater.updateStockHistoricalDataWithPeriod([definition], period)
      : await StockPriceUpdater.updateStockHistoricalData([definition]);
    
    if (updatedDefinitions.length > 0) {
      const updatedDefinition = updatedDefinitions[0];
      const entriesCount = updatedDefinition.priceHistory?.length || 0;
      return {
        symbol: definition.ticker,
        success: true,
        updatedDefinition,
        entriesCount
      };
    } else {
      return {
        symbol: definition.ticker,
        success: false,
        error: 'No historical data received from API'
      };
    }
  } catch (error: any) {
    return {
      symbol: definition.ticker || definition.name || 'unknown',
      success: false,
      error: error?.message || String(error)
    };
  }
}

async function updateBatchStockHistory(
  definitions: AssetDefinition[], 
  period?: TimeRangePeriod
): Promise<StockHistoryUpdateResult[]> {
  const results: StockHistoryUpdateResult[] = [];
  
  // Filter to only stock definitions with tickers and auto-update enabled
  const stockDefinitions = definitions.filter(def => 
    def.type === 'stock' && 
    def.ticker && 
    (period || def.autoUpdateHistoricalPrices === true) // If period is specified, update regardless of auto-update setting
  );

  // Process each definition individually to ensure partial failures don't stop the batch
  for (const definition of stockDefinitions) {
    const result = await updateSingleStockHistory(definition, period);
    results.push(result);
  }

  return results;
}

// --- Worker Event Handling ---

self.onmessage = function (e: MessageEvent<WorkerRequest>) {
  try {
    if (e.data.type === 'updateBatch') {
      updateBatchStockHistory(e.data.definitions, e.data.period).then(results => {
        const response: WorkerResponse = { type: 'batchResult', results };
        // @ts-ignore
        self.postMessage(response);
      }).catch(error => {
        // @ts-ignore
        self.postMessage({ type: 'error', error: error?.message || String(error) });
      });
    } else if (e.data.type === 'updateSingle') {
      updateSingleStockHistory(e.data.definition, e.data.period).then(result => {
        const response: WorkerResponse = { type: 'singleResult', result };
        // @ts-ignore
        self.postMessage(response);
      }).catch(error => {
        // @ts-ignore
        self.postMessage({ type: 'error', error: error?.message || String(error) });
      });
    } else if (e.data.type === 'updateBatchDefault') {
      updateBatchStockHistory(e.data.definitions).then(results => {
        const response: WorkerResponse = { type: 'batchResult', results };
        // @ts-ignore
        self.postMessage(response);
      }).catch(error => {
        // @ts-ignore
        self.postMessage({ type: 'error', error: error?.message || String(error) });
      });
    } else if (e.data.type === 'updateSingleDefault') {
      updateSingleStockHistory(e.data.definition).then(result => {
        const response: WorkerResponse = { type: 'singleResult', result };
        // @ts-ignore
        self.postMessage(response);
      }).catch(error => {
        // @ts-ignore
        self.postMessage({ type: 'error', error: error?.message || String(error) });
      });
    }
  } catch (err: any) {
    // @ts-ignore
    self.postMessage({ type: 'error', error: err?.message || String(err) });
  }
};