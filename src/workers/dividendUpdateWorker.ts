import { AssetDefinition } from '@/types/domains/assets';
import { batchAssetUpdateService } from '@/service/domain/assets/market-data/batchAssetUpdateService';

// Result for individual dividend update
interface DividendUpdateResult {
  symbol: string;
  success: boolean;
  updatedDefinition?: AssetDefinition;
  dividendCount?: number;
  error?: string;
}

// Message types for communication with main thread
type WorkerRequest =
  | { type: 'updateBatch', definitions: AssetDefinition[], options?: { interval?: string; range?: string }, apiKeys: Record<string, string | undefined>, selectedProvider: string }
  | { type: 'updateSingle', definition: AssetDefinition, options?: { interval?: string; range?: string }, apiKeys: Record<string, string | undefined>, selectedProvider: string };

type WorkerResponse =
  | { type: 'batchResult', results: DividendUpdateResult[] }
  | { type: 'singleResult', result: DividendUpdateResult }
  | { type: 'error', error: string };

// --- Update Functions ---
// Uses centralized batchAssetUpdateService with API configuration

async function updateBatchDividends(
  definitions: AssetDefinition[],
  options: { interval: string; range: string },
  apiKeys: Record<string, string | undefined>,
  selectedProvider: string
): Promise<DividendUpdateResult[]> {
  try {
    // Use centralized batch method with API config
    const batchResult = await batchAssetUpdateService.updateBatchDividends(
      definitions,
      options,
      { apiKeys, selectedProvider }
    );
    
    // Convert BatchResult to DividendUpdateResult format
    return batchResult.results.map(result => {
      if (result.success && result.updatedDefinition) {
        return {
          symbol: result.symbol!,
          success: true,
          updatedDefinition: result.updatedDefinition,
          dividendCount: result.updatedDefinition.dividendHistory?.length || 0
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

async function updateSingleDividend(
  definition: AssetDefinition,
  options: { interval: string; range: string },
  apiKeys: Record<string, string | undefined>,
  selectedProvider: string
): Promise<DividendUpdateResult> {
  try {
    const results = await updateBatchDividends([definition], options, apiKeys, selectedProvider);
    return results[0] || { symbol: definition.ticker || definition.name || 'unknown', success: false, error: 'No result' };
  } catch (error) {
    return { 
      symbol: definition.ticker || definition.name || 'unknown', 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}



// --- Worker Event Handling ---
self.onmessage = function (e: MessageEvent<WorkerRequest>) {
  if (e.data.type === 'updateBatch') {
    const options = {
      interval: e.data.options?.interval ?? '1d',
      range: e.data.options?.range ?? '2y',
    };
    updateBatchDividends(e.data.definitions, options, e.data.apiKeys, e.data.selectedProvider).then(results => {
      const response: WorkerResponse = { type: 'batchResult', results };
      self.postMessage(response);
    }).catch((error: unknown) => {
      self.postMessage({ type: 'error', error: error instanceof Error ? error.message : String(error) });
    });
  } else if (e.data.type === 'updateSingle') {
    const options = {
      interval: e.data.options?.interval ?? '1d',
      range: e.data.options?.range ?? '2y',
    };
    updateSingleDividend(e.data.definition, options, e.data.apiKeys, e.data.selectedProvider).then(result => {
      const response: WorkerResponse = { type: 'singleResult', result };
      self.postMessage(response);
    }).catch((error: unknown) => {
      self.postMessage({ type: 'error', error: error instanceof Error ? error.message : String(error) });
    });
  }
};