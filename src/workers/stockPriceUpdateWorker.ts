import { AssetDefinition } from '@/types/domains/assets';
import { StockPriceUpdater } from '@/service/shared/utilities/helper/stockPriceUpdater';

// Result for individual stock price update
interface StockPriceUpdateResult {
  symbol: string;
  success: boolean;
  updatedDefinition?: AssetDefinition;
  error?: string;
}

// Message types for communication with main thread
type WorkerRequest =
  | { type: 'updateBatch', definitions: AssetDefinition[] }
  | { type: 'updateSingle', definition: AssetDefinition };

type WorkerResponse =
  | { type: 'batchResult', results: StockPriceUpdateResult[] }
  | { type: 'singleResult', result: StockPriceUpdateResult }
  | { type: 'error', error: string };

// --- Update Functions ---
// All update logic is delegated to the existing StockPriceUpdater service.
// This worker only orchestrates and provides batch processing with individual error handling.

async function updateSingleStockPrice(definition: AssetDefinition): Promise<StockPriceUpdateResult> {
  try {
    if (definition.type !== 'stock' || !definition.ticker) {
      return {
        symbol: definition.ticker || definition.name || 'unknown',
        success: false,
        error: 'Not a stock or missing ticker symbol'
      };
    }

    // Use existing service to update single definition
    const updatedDefinitions = await StockPriceUpdater.updateStockPrices([definition]);
    
    if (updatedDefinitions.length > 0) {
      const updatedDefinition = updatedDefinitions[0];
      return {
        symbol: definition.ticker,
        success: true,
        updatedDefinition
      };
    } else {
      return {
        symbol: definition.ticker,
        success: false,
        error: 'No price data received from API'
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

async function updateBatchStockPrices(definitions: AssetDefinition[]): Promise<StockPriceUpdateResult[]> {
  const results: StockPriceUpdateResult[] = [];
  
  // Filter to only stock definitions with tickers
  const stockDefinitions = definitions.filter(def => 
    def.type === 'stock' && def.ticker && def.autoUpdatePrice === true
  );

  // Process each definition individually to ensure partial failures don't stop the batch
  for (const definition of stockDefinitions) {
    const result = await updateSingleStockPrice(definition);
    results.push(result);
  }

  return results;
}

// --- Worker Event Handling ---

self.onmessage = function (e: MessageEvent<WorkerRequest>) {
  try {
    if (e.data.type === 'updateBatch') {
      updateBatchStockPrices(e.data.definitions).then(results => {
        const response: WorkerResponse = { type: 'batchResult', results };
        // @ts-ignore
        self.postMessage(response);
      }).catch(error => {
        // @ts-ignore
        self.postMessage({ type: 'error', error: error?.message || String(error) });
      });
    } else if (e.data.type === 'updateSingle') {
      updateSingleStockPrice(e.data.definition).then(result => {
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