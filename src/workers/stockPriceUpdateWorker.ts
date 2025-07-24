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
// Nutzt die zentrale batchAssetUpdateService.updateBatchCurrentPrices Methode (provider-agnostisch)

async function updateBatchStockPrices(definitions: AssetDefinition[]): Promise<StockPriceUpdateResult[]> {
  // Nur gültige Aktien mit Ticker und autoUpdatePrice=true
  const stockDefinitions = definitions.filter(def => def.type === 'stock' && def.ticker && def.autoUpdatePrice === true);
  const response = await batchAssetUpdateService.updateBatchCurrentPrices(stockDefinitions);
  if (response && response.type === 'batchResult' && Array.isArray(response.results)) {
    return response.results.map((r) => ({
      symbol: r.symbol ?? '',
      success: r.success,
      updatedDefinition: r.updatedDefinition,
      error: r.error
    }));
  }
  return [{ symbol: '', success: false, error: 'batchAssetUpdateService.updateBatchCurrentPrices failed' }];
}

async function updateSingleStockPrice(definition: AssetDefinition): Promise<StockPriceUpdateResult> {
  const response = await batchAssetUpdateService.updateBatchCurrentPrices([definition]);
  if (response && response.type === 'batchResult' && Array.isArray(response.results) && response.results.length > 0) {
    const r = response.results[0];
    return {
      symbol: r.symbol ?? '',
      success: r.success,
      updatedDefinition: r.updatedDefinition,
      error: r.error
    };
  }
  return { symbol: definition.ticker || definition.name || 'unknown', success: false, error: 'batchAssetUpdateService.updateBatchCurrentPrices failed' };
}

// --- Worker Event Handling ---

self.onmessage = function (e: MessageEvent<WorkerRequest>) {
  if (e.data.type === 'updateBatch') {
    updateBatchStockPrices(e.data.definitions).then(results => {
      const response: WorkerResponse = { type: 'batchResult', results };
      self.postMessage(response);
    }).catch(error => {
      self.postMessage({ type: 'error', error: error instanceof Error ? error.message : String(error) });
    });
  } else if (e.data.type === 'updateSingle') {
    updateSingleStockPrice(e.data.definition).then(result => {
      const response: WorkerResponse = { type: 'singleResult', result };
      self.postMessage(response);
    }).catch(error => {
      self.postMessage({ type: 'error', error: error instanceof Error ? error.message : String(error) });
    });
  }
};