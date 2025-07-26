import { AssetDefinition } from '@/types/domains/assets';

// Result for individual stock price update
interface StockPriceUpdateResult {
  symbol: string;
  success: boolean;
  updatedDefinition?: AssetDefinition;
  error?: string;
}


// Message types for communication with main thread
type WorkerRequest =
  | { type: 'updateBatch', definitions: AssetDefinition[], apiKeys: Record<string, string | undefined>, selectedProvider: string }
  | { type: 'updateSingle', definition: AssetDefinition, apiKeys: Record<string, string | undefined>, selectedProvider: string };

type WorkerResponse =
  | { type: 'batchResult', results: StockPriceUpdateResult[] }
  | { type: 'singleResult', result: StockPriceUpdateResult }
  | { type: 'error', error: string };

// --- Update Functions ---
// Nutzt StockPriceUpdater direkt mit API-Keys und Provider (Worker-kompatibel)

async function updateBatchStockPrices(definitions: AssetDefinition[], apiKeys: Record<string, string | undefined>, selectedProvider: string): Promise<StockPriceUpdateResult[]> {
  try {
    // Import StockPriceUpdater dynamisch im Worker
    const { StockPriceUpdater } = await import('@/service/shared/utilities/helper/stockPriceUpdater');
    const updatedDefinitions = await StockPriceUpdater.updateStockPrices(definitions, apiKeys, selectedProvider);
    
    return updatedDefinitions.map((def) => ({
      symbol: def.ticker ?? '',
      success: true,
      updatedDefinition: def,
      error: undefined
    }));
  } catch (error) {
    return [{ symbol: '', success: false, error: error instanceof Error ? error.message : String(error) }];
  }
}

async function updateSingleStockPrice(definition: AssetDefinition, apiKeys: Record<string, string | undefined>, selectedProvider: string): Promise<StockPriceUpdateResult> {
  try {
    // Import StockPriceUpdater dynamisch im Worker
    const { StockPriceUpdater } = await import('@/service/shared/utilities/helper/stockPriceUpdater');
    const updatedDefinitions = await StockPriceUpdater.updateStockPrices([definition], apiKeys, selectedProvider);
    
    if (updatedDefinitions.length > 0) {
      const updatedDef = updatedDefinitions[0];
      return {
        symbol: updatedDef.ticker ?? '',
        success: true,
        updatedDefinition: updatedDef,
        error: undefined
      };
    }
    return { symbol: definition.ticker || definition.name || 'unknown', success: false, error: 'No definitions were updated' };
  } catch (error) {
    return { symbol: definition.ticker || definition.name || 'unknown', success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// --- Worker Event Handling ---

self.onmessage = function (e: MessageEvent<WorkerRequest>) {
  if (e.data.type === 'updateBatch') {
    updateBatchStockPrices(e.data.definitions, e.data.apiKeys, e.data.selectedProvider).then(results => {
      const response: WorkerResponse = { type: 'batchResult', results };
      self.postMessage(response);
    }).catch(error => {
      self.postMessage({ type: 'error', error: error instanceof Error ? error.message : String(error) });
    });
  } else if (e.data.type === 'updateSingle') {
    updateSingleStockPrice(e.data.definition, e.data.apiKeys, e.data.selectedProvider).then(result => {
      const response: WorkerResponse = { type: 'singleResult', result };
      self.postMessage(response);
    }).catch(error => {
      self.postMessage({ type: 'error', error: error instanceof Error ? error.message : String(error) });
    });
  }
};