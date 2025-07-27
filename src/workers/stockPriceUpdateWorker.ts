import { AssetDefinition } from '@/types/domains/assets';
import { batchAssetUpdateService } from '@/service/domain/assets/market-data/batchAssetUpdateService';

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
// Uses centralized batchAssetUpdateService with API configuration

async function updateBatchStockPrices(definitions: AssetDefinition[], apiKeys: Record<string, string | undefined>, selectedProvider: string): Promise<StockPriceUpdateResult[]> {
  try {
    // Use centralized batch method with API config
    const batchResult = await batchAssetUpdateService.updateBatchCurrentPrices(
      definitions,
      { apiKeys, selectedProvider }
    );
    
    // Convert BatchResult to StockPriceUpdateResult format
    return batchResult.results.map(result => {
      if (result.success && result.updatedDefinition) {
        return {
          symbol: result.symbol!,
          success: true,
          updatedDefinition: result.updatedDefinition,
          error: undefined
        };
      } else {
        return {
          symbol: result.symbol!,
          success: false,
          error: result.error
        };
      }
    });
  } catch (error) {
    return [{ symbol: '', success: false, error: error instanceof Error ? error.message : String(error) }];
  }
}

async function updateSingleStockPrice(definition: AssetDefinition, apiKeys: Record<string, string | undefined>, selectedProvider: string): Promise<StockPriceUpdateResult> {
  try {
    const results = await updateBatchStockPrices([definition], apiKeys, selectedProvider);
    return results[0] || { symbol: definition.ticker || definition.name || 'unknown', success: false, error: 'No result' };
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