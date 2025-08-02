import { AssetDefinition } from '@/types/domains/assets';
import { TimeRangePeriod } from '@/types/shared/time';
import { batchAssetUpdateService } from '@/service/domain/assets/market-data/batchAssetUpdateService';

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
  | { type: 'updateBatch', definitions: AssetDefinition[], period?: TimeRangePeriod, apiKeys: Record<string, string | undefined>, selectedProvider: string }
  | { type: 'updateSingle', definition: AssetDefinition, period?: TimeRangePeriod, apiKeys: Record<string, string | undefined>, selectedProvider: string }
  | { type: 'updateBatchDefault', definitions: AssetDefinition[], apiKeys: Record<string, string | undefined>, selectedProvider: string }
  | { type: 'updateSingleDefault', definition: AssetDefinition, apiKeys: Record<string, string | undefined>, selectedProvider: string };

type WorkerResponse =
  | { type: 'batchResult', results: StockHistoryUpdateResult[] }
  | { type: 'singleResult', result: StockHistoryUpdateResult }
  | { type: 'error', error: string };

// --- Update Functions ---
// Uses centralized batchAssetUpdateService with API configuration for main history updates

async function updateBatchStockHistory(
  definitions: AssetDefinition[],
  period: TimeRangePeriod | undefined,
  apiKeys: Record<string, string | undefined>,
  selectedProvider: string
): Promise<StockHistoryUpdateResult[]> {
  try {
    // Use centralized batch method with API config
    const batchResult = await batchAssetUpdateService.updateBatchHistoryData(
      definitions,
      period,
      { apiKeys, selectedProvider }
    );
    
    // Convert BatchResult to StockHistoryUpdateResult format
    return batchResult.results.map(result => {
      if (result.success && result.updatedDefinition) {
        return {
          symbol: result.symbol!,
          success: true,
          updatedDefinition: result.updatedDefinition,
          entriesCount: result.updatedDefinition.priceHistory?.length,
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

// --- Worker Event Handling ---

self.onmessage = function (e: MessageEvent<WorkerRequest>) {
  if (e.data.type === 'updateBatch') {
    updateBatchStockHistory(e.data.definitions, e.data.period, e.data.apiKeys, e.data.selectedProvider).then(results => {
      const response: WorkerResponse = { type: 'batchResult', results };
      self.postMessage(response);
    }).catch(error => {
      self.postMessage({ type: 'error', error: error instanceof Error ? error.message : String(error) });
    });
  } else if (e.data.type === 'updateBatchDefault') {
    updateBatchStockHistory(e.data.definitions, undefined, e.data.apiKeys, e.data.selectedProvider).then(results => {
      const response: WorkerResponse = { type: 'batchResult', results };
      self.postMessage(response);
    }).catch(error => {
      self.postMessage({ type: 'error', error: error instanceof Error ? error.message : String(error) });
    });
  }
};