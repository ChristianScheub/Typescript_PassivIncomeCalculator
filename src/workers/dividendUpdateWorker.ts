import { AssetDefinition } from '@/types/domains/assets';
import { DividendHistoryEntry } from '@/types/domains/assets/dividends';
import { dividendApiService } from '@/service/domain/assets/market-data/dividendAPIService';
import { parseDividendHistoryFromApiResult } from '@/utils/parseDividendHistoryFromApiResult';
import { DividendFrequency } from '@/types/shared';

// Result for individual dividend update
interface DividendUpdateResult {
  symbol: string;
  success: boolean;
  updatedDefinition?: AssetDefinition;
  dividendCount?: number;
  error?: string;
}

// Options for dividend fetching
interface DividendFetchOptions {
  interval?: string;
  range?: string;
}

// Message types for communication with main thread
type WorkerRequest =
  | { type: 'updateBatch', definitions: AssetDefinition[], options?: DividendFetchOptions }
  | { type: 'updateSingle', definition: AssetDefinition, options?: DividendFetchOptions };

type WorkerResponse =
  | { type: 'batchResult', results: DividendUpdateResult[] }
  | { type: 'singleResult', result: DividendUpdateResult }
  | { type: 'error', error: string };

// --- Update Functions ---
// All update logic follows the existing fetchAndUpdateDividends logic from the Redux slice.
// This worker only orchestrates and provides batch processing with individual error handling.

function parseDividendArray(dividends: unknown[], currency: string | undefined): DividendHistoryEntry[] {
  return dividends
    .filter((div: unknown) => {
      const dividend = div as { amount?: number; date?: unknown; lastDividendDate?: unknown };
      return dividend.amount != null && (dividend.date || dividend.lastDividendDate);
    })
    .map((div: unknown) => {
      const dividend = div as { amount: number; lastDividendDate?: string; date?: number };
      let dividendDate = '';
      if (dividend.lastDividendDate) {
        dividendDate = new Date(dividend.lastDividendDate).toISOString();
      } else if (dividend.date) {
        dividendDate = new Date(dividend.date * 1000).toISOString();
      }
      return {
        date: dividendDate,
        amount: dividend.amount,
        source: 'api' as const,
        currency,
      };
    })
    .filter((entry: DividendHistoryEntry) => !!entry.date && entry.amount != null);
}

function calculateFrequencyAndMonths(dividendHistory: DividendHistoryEntry[], result: Record<string, unknown>): { frequency?: DividendFrequency, paymentMonths?: number[] } {
  let frequency: DividendFrequency | undefined = undefined;
  let paymentMonths: number[] | undefined = undefined;
  if (dividendHistory.length > 1) {
    const months = dividendHistory.map(d => new Date(d.date).getMonth() + 1); // 1-based
    paymentMonths = Array.from(new Set(months)).sort((a, b) => a - b);
  }
  // Type-safe access to dividends array
  const dividendsArray = Array.isArray(result.dividends) ? result.dividends : [];
  if (dividendHistory.length > 0 && dividendsArray[0]?.frequency) {
    frequency = dividendsArray[0].frequency;
  }
  return { frequency, paymentMonths };
}

function calculateDividendGrowthPast3Y(dividendHistory: DividendHistoryEntry[]): number {
  if (dividendHistory.length < 2) return 0;
  const sortedHistory = [...dividendHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const threeYearsAgo = new Date();
  threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
  const recentDividends = sortedHistory.filter(d => new Date(d.date) >= threeYearsAgo);
  if (recentDividends.length < 2) return 0;
  const firstAmount = recentDividends[0].amount;
  const lastAmount = recentDividends[recentDividends.length - 1].amount;
  const years = (new Date(recentDividends[recentDividends.length - 1].date).getTime() - new Date(recentDividends[0].date).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  if (years > 0 && firstAmount > 0) {
    return (Math.pow(lastAmount / firstAmount, 1 / years) - 1) * 100;
  }
  return 0;
}

async function updateSingleDividendData(
  definition: AssetDefinition, 
  options: DividendFetchOptions = { interval: '1d', range: '2y' }
): Promise<DividendUpdateResult> {
  try {
    if (!definition.ticker) {
      return {
        symbol: definition.name || 'unknown',
        success: false,
        error: 'No ticker symbol available for asset'
      };
    }

    const result = await dividendApiService.fetchDividends(definition.ticker, options);
    const currency = definition.currency || undefined;
    let dividendHistory: DividendHistoryEntry[] = [];
    if (Array.isArray(result?.dividends)) {
      dividendHistory = parseDividendArray(result.dividends, currency);
    } else {
      dividendHistory = parseDividendHistoryFromApiResult(result, currency);
    }
    dividendHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const { frequency, paymentMonths } = calculateFrequencyAndMonths(dividendHistory, result);
    const dividendGrowthPast3Y = calculateDividendGrowthPast3Y(dividendHistory);
    const dividendForecast3Y: DividendHistoryEntry[] = [];
    const last = dividendHistory.length > 0 ? dividendHistory[dividendHistory.length - 1] : undefined;
    const updatedDefinition: AssetDefinition = {
      ...definition,
      dividendInfo: last
        ? {
            amount: last.amount,
            frequency: frequency || 'quarterly',
            lastDividendDate: last.date,
            paymentMonths,
          }
        : undefined,
      dividendHistory,
      dividendGrowthPast3Y,
      dividendForecast3Y,
    };
    return {
      symbol: definition.ticker,
      success: true,
      updatedDefinition,
      dividendCount: dividendHistory.length
    };
  } catch (error: unknown) {
    return {
      symbol: definition.ticker || definition.name || 'unknown',
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function updateBatchDividendData(
  definitions: AssetDefinition[], 
  options: DividendFetchOptions = { interval: '1d', range: '2y' }
): Promise<DividendUpdateResult[]> {
  const results: DividendUpdateResult[] = [];
  
  // Filter to only definitions with tickers
  const eligibleDefinitions = definitions.filter(def => def.ticker);

  // Process each definition individually to ensure partial failures don't stop the batch
  for (const definition of eligibleDefinitions) {
    const result = await updateSingleDividendData(definition, options);
    results.push(result);
  }

  return results;
}

// --- Worker Event Handling ---

self.onmessage = function (e: MessageEvent<WorkerRequest>) {
  if (e.data.type === 'updateBatch') {
    updateBatchDividendData(e.data.definitions, e.data.options).then(results => {
      const response: WorkerResponse = { type: 'batchResult', results };
      self.postMessage(response);
    }).catch(error => {
      self.postMessage({ type: 'error', error: error instanceof Error ? error.message : String(error) });
    });
  } else if (e.data.type === 'updateSingle') {
    updateSingleDividendData(e.data.definition, e.data.options).then(result => {
      const response: WorkerResponse = { type: 'singleResult', result };
      self.postMessage(response);
    }).catch(error => {
      self.postMessage({ type: 'error', error: error instanceof Error ? error.message : String(error) });
    });
  }
};