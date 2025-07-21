import { AssetDefinition } from '@/types/domains/assets';
import { TimeRangePeriod } from '@/types/shared/time';
import { StockPriceUpdater } from '@/service/shared/utilities/helper/stockPriceUpdater';
import { stockAPIService } from '@service/domain/assets';
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
  | { type: 'updateBatch', definitions: AssetDefinition[], period?: TimeRangePeriod, apiKeys?: Record<string, string | undefined>, selectedProvider?: string }
  | { type: 'updateSingle', definition: AssetDefinition, period?: TimeRangePeriod, apiKeys?: Record<string, string | undefined>, selectedProvider?: string }
  | { type: 'updateBatchDefault', definitions: AssetDefinition[], apiKeys?: Record<string, string | undefined>, selectedProvider?: string }
  | { type: 'updateSingleDefault', definition: AssetDefinition, apiKeys?: Record<string, string | undefined>, selectedProvider?: string }
  | { type: 'updateBatchIntraday', definitions: AssetDefinition[], days?: number, apiKeys?: Record<string, string | undefined>, selectedProvider?: string }
  | { type: 'updateSingleIntraday', definition: AssetDefinition, days?: number, apiKeys?: Record<string, string | undefined>, selectedProvider?: string };

type WorkerResponse =
  | { type: 'batchResult', results: StockHistoryUpdateResult[] }
  | { type: 'singleResult', result: StockHistoryUpdateResult }
  | { type: 'error', error: string };

// --- Update Functions ---
// All update logic is delegated to the existing StockPriceUpdater service.
// This worker only orchestrates and provides batch processing with individual error handling.

async function updateSingleStockHistory(
  definition: AssetDefinition, 
  period?: TimeRangePeriod,
  apiKeys?: Record<string, string | undefined>,
  selectedProvider?: string
): Promise<StockHistoryUpdateResult> {
  try {
    if (definition.type !== 'stock' || !definition.ticker) {
      return {
        symbol: definition.ticker || definition.name || 'unknown',
        success: false,
        error: 'Not a stock or missing ticker symbol'
      };
    }

    // Use existing service to update single definition with API configuration
    const updatedDefinitions = period
      ? await StockPriceUpdater.updateStockHistoricalDataWithPeriod([definition], period, apiKeys, selectedProvider)
      : await StockPriceUpdater.updateStockHistoricalData([definition], apiKeys, selectedProvider);
    
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
  } catch (error: unknown) {
    return {
      symbol: definition.ticker || definition.name || 'unknown',
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function updateBatchStockHistory(
  definitions: AssetDefinition[], 
  period?: TimeRangePeriod,
  apiKeys?: Record<string, string | undefined>,
  selectedProvider?: string
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
    const result = await updateSingleStockHistory(definition, period, apiKeys, selectedProvider);
    results.push(result);
  }

  return results;
}

async function updateSingleStockIntraday(
  definition: AssetDefinition, 
  days: number = 1,
  apiKeys?: Record<string, string | undefined>,
  selectedProvider?: string
): Promise<StockHistoryUpdateResult> {
  try {
    if (definition.type !== 'stock' || !definition.ticker) {
      return {
        symbol: definition.ticker || definition.name || 'unknown',
        success: false,
        error: 'Not a stock or missing ticker symbol'
      };
    }

    let intradayData;
    
    // If API configuration is provided, create a specific API service instance
    if (apiKeys && selectedProvider) {
      // Use dynamic provider selection similar to StockPriceUpdater
      const { StockAPIProvider } = await import("@/types/shared/base/enums");
      const apiKey = apiKeys[selectedProvider.toLowerCase()];
      
      let stockAPI;
      switch (selectedProvider) {
        case StockAPIProvider.FINNHUB: {
          const { FinnhubAPIService } = await import("@/service/domain/assets/market-data/stockAPIService/providers/FinnhubAPIService");
          if (!apiKey) throw new Error('Finnhub API-Key fehlt!');
          stockAPI = new FinnhubAPIService(apiKey);
          break;
        }
        case StockAPIProvider.YAHOO: {
          const { YahooAPIService } = await import("@/service/domain/assets/market-data/stockAPIService/providers/YahooAPIService");
          stockAPI = new YahooAPIService();
          break;
        }
        case StockAPIProvider.ALPHA_VANTAGE: {
          const { AlphaVantageAPIService } = await import("@/service/domain/assets/market-data/stockAPIService/providers/AlphaVantageAPIService");
          if (!apiKey) throw new Error('Alpha Vantage API-Key fehlt!');
          stockAPI = new AlphaVantageAPIService(apiKey);
          break;
        }
        default:
          throw new Error(`Unsupported provider for intraday data: ${selectedProvider}`);
      }
      
      intradayData = await stockAPI.getIntradayHistory(definition.ticker, days);
    } else {
      // Fall back to default stockAPIService
      intradayData = await stockAPIService.getIntradayHistory(definition.ticker, days);
    }
    
    if (!intradayData?.entries || intradayData.entries.length === 0) {
      return {
        symbol: definition.ticker,
        success: false,
        error: 'No intraday data received from API'
      };
    }

    // Map intraday data to price history format preserving minute-level timestamps
    const newPriceEntries = intradayData.entries.map((entry: unknown) => ({
      date: new Date((entry as { timestamp: number }).timestamp).toISOString(), // Keep full timestamp for intraday data
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
  apiKeys?: Record<string, string | undefined>,
  selectedProvider?: string
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
  } else if (e.data.type === 'updateSingle') {
    updateSingleStockHistory(e.data.definition, e.data.period, e.data.apiKeys, e.data.selectedProvider).then(result => {
      const response: WorkerResponse = { type: 'singleResult', result };
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
  } else if (e.data.type === 'updateSingleDefault') {
    updateSingleStockHistory(e.data.definition, undefined, e.data.apiKeys, e.data.selectedProvider).then(result => {
      const response: WorkerResponse = { type: 'singleResult', result };
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