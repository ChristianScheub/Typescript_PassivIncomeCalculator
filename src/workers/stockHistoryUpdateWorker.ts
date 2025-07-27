import { AssetDefinition } from '@/types/domains/assets';
import { TimeRangePeriod } from '@/types/shared/time';
import { addIntradayPriceHistory } from '@/utils/priceHistoryUtils';
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
  | { type: 'updateSingleDefault', definition: AssetDefinition, apiKeys: Record<string, string | undefined>, selectedProvider: string }
  | { type: 'updateBatchIntraday', definitions: AssetDefinition[], days?: number, apiKeys: Record<string, string | undefined>, selectedProvider: string }
  | { type: 'updateSingleIntraday', definition: AssetDefinition, days?: number, apiKeys: Record<string, string | undefined>, selectedProvider: string };

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

async function updateSingleStockIntraday(
  definition: AssetDefinition,
  days: number = 1,
  apiKeys: Record<string, string | undefined>,
  selectedProvider: string
): Promise<StockHistoryUpdateResult> {
  try {
    if (definition.type !== 'stock' || !definition.ticker) {
      return {
        symbol: definition.ticker || definition.name || 'unknown',
        success: false,
        error: 'Not a stock or missing ticker symbol'
      };
    }

    // Import StockAPIService dynamisch und erstelle Instanz mit API-Keys
    const { StockAPIProvider } = await import("@/types/shared/base/enums");
    const apiKey = apiKeys[selectedProvider.toLowerCase()];
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let stockAPI: any;
    switch (selectedProvider) {
      case StockAPIProvider.FINNHUB: {
        const { FinnhubAPIService } = await import("@/service/domain/assets/market-data/stockAPIService/providers/FinnhubAPIService");
        stockAPI = new FinnhubAPIService(apiKey);
        break;
      }
      case StockAPIProvider.YAHOO: {
        const { YahooAPIService } = await import("@/service/domain/assets/market-data/stockAPIService/providers/YahooAPIService");
        stockAPI = new YahooAPIService();
        break;
      }
      case StockAPIProvider.POLYGON_IO: {
        const { PolygonIOAPIService } = await import("@/service/domain/assets/market-data/stockAPIService/providers/PolygonIOAPIService");
        stockAPI = new PolygonIOAPIService(apiKey);
        break;
      }
      default: {
        const { YahooAPIService } = await import("@/service/domain/assets/market-data/stockAPIService/providers/YahooAPIService");
        stockAPI = new YahooAPIService();
        break;
      }
    }

    const intradayData = await stockAPI.getIntradayHistory(definition.ticker, days);

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
  days: number = 1,
  apiKeys: Record<string, string | undefined>,
  selectedProvider: string
): Promise<StockHistoryUpdateResult[]> {
  const results: StockHistoryUpdateResult[] = [];
  // Filter to only stock definitions with tickers
  const stockDefinitions = definitions.filter(def =>
    def.type === 'stock' && def.ticker
  );
  // Process each definition individually to ensure partial failures don't stop the batch
  for (const definition of stockDefinitions) {
    const result = await updateSingleStockIntraday(definition, days, apiKeys, selectedProvider);
    results.push(result);
  }
  return results;
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
  } else if (e.data.type === 'updateBatchIntraday') {
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