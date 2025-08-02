import { AssetDefinition } from '@/types/domains/assets';
import { updateBatchIntradayPrices } from '@/service/domain/assets/market-data/batchAssetUpdateService/methods/updateBatchIntradayPrices';

// Result for individual stock intraday update
interface StockIntradayUpdateResult {
  symbol: string;
  success: boolean;
  updatedDefinition?: AssetDefinition;
  entriesCount?: number;
  error?: string;
}

// Message types for communication with main thread
type WorkerRequest =
  | { type: 'updateBatchIntraday', definitions: AssetDefinition[], days?: number, apiKeys: Record<string, string | undefined>, selectedProvider: string }
  | { type: 'updateSingleIntraday', definition: AssetDefinition, days?: number, apiKeys: Record<string, string | undefined>, selectedProvider: string };

type WorkerResponse =
  | { type: 'batchResult', results: StockIntradayUpdateResult[] }
  | { type: 'singleResult', result: StockIntradayUpdateResult }
  | { type: 'error', error: string };

// --- Intraday Update Functions ---

async function updateSingleStockIntraday(
  definition: AssetDefinition,
  days: number = 1,
  apiKeys: Record<string, string | undefined>,
  selectedProvider: string
): Promise<StockIntradayUpdateResult> {
  try {
    if (definition.type !== 'stock' || !definition.ticker) {
      return {
        symbol: definition.ticker || definition.name || 'unknown',
        success: false,
        error: 'Not a stock or missing ticker symbol'
      };
    }

    // Use centralized batch method with API config for single definition
    const batchResult = await updateBatchIntradayPrices(
      [definition],
      days,
      { apiKeys, selectedProvider }
    );
    
    // Convert BatchResult to StockIntradayUpdateResult format
    if (batchResult.results.length > 0) {
      const result = batchResult.results[0];
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
    } else {
      return {
        symbol: definition.ticker,
        success: false,
        error: 'No result from batch service'
      };
    }
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
  days: number = 1,
  apiKeys: Record<string, string | undefined>,
  selectedProvider: string
): Promise<StockIntradayUpdateResult[]> {
  try {
    // Use centralized batch method with API config
    const batchResult = await updateBatchIntradayPrices(
      definitions,
      days,
      { apiKeys, selectedProvider }
    );
    
    // Convert BatchResult to StockIntradayUpdateResult format
    return batchResult.results.map((result) => {
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
  if (e.data.type === 'updateBatchIntraday') {
    updateBatchStockIntraday(e.data.definitions, e.data.days, e.data.apiKeys, e.data.selectedProvider).then(results => {
      const response: WorkerResponse = { type: 'batchResult', results };
      self.postMessage(response);
    }).catch(error => {
      self.postMessage({ type: 'error', error: error instanceof Error ? error.message : String(error) });
    });
  } else if (e.data.type === 'updateSingleIntraday') {
    updateSingleStockIntraday(e.data.definition, e.data.days, e.data.apiKeys, e.data.selectedProvider).then(result => {
      const response: WorkerResponse = { type: 'singleResult', result };
      self.postMessage(response);
    }).catch(error => {
      self.postMessage({ type: 'error', error: error instanceof Error ? error.message : String(error) });
    });
  }
};
