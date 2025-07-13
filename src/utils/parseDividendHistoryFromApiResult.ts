import { DividendHistoryEntry } from '@/types/domains/assets/dividends';

// Types for API responses
interface YahooDividendEvent {
  date: number;
  amount: number;
}

interface YahooApiResponse {
  chart: {
    result: Array<{
      events: {
        dividends: Record<string, YahooDividendEvent>;
      };
    }>;
  };
}

interface FinnhubDividendEvent {
  date: number;
  amount: number;
}

interface FinnhubApiResponse {
  dividends: FinnhubDividendEvent[];
}

// Type guards
function isYahooResponse(result: DividendApiResponse): result is YahooApiResponse {
  return 'chart' in result && 
         typeof result.chart === 'object' && 
         result.chart !== null &&
         'result' in result.chart &&
         Array.isArray(result.chart.result) &&
         result.chart.result.length > 0 &&
         'events' in result.chart.result[0] &&
         typeof result.chart.result[0].events === 'object' &&
         result.chart.result[0].events !== null &&
         'dividends' in result.chart.result[0].events;
}

function isFinnhubResponse(result: DividendApiResponse): result is FinnhubApiResponse {
  return 'dividends' in result && Array.isArray(result.dividends);
}

function isYahooDividendEvent(div: unknown): div is YahooDividendEvent {
  return typeof div === 'object' && 
         div !== null && 
         'date' in div && 
         'amount' in div && 
         typeof (div as YahooDividendEvent).date === 'number' &&
         typeof (div as YahooDividendEvent).amount === 'number';
}

function isFinnhubDividendEvent(div: unknown): div is FinnhubDividendEvent {
  return typeof div === 'object' && 
         div !== null && 
         'date' in div && 
         'amount' in div && 
         typeof (div as FinnhubDividendEvent).date === 'number' &&
         typeof (div as FinnhubDividendEvent).amount === 'number';
}

type DividendApiResponse = YahooApiResponse | FinnhubApiResponse | Record<string, unknown>;

/**
 * Maps the result from a dividend API call (Yahoo or Finnhub) to a DividendHistoryEntry[]
 * Handles both Yahoo (object) and Finnhub/legacy (array) formats.
 */
export function parseDividendHistoryFromApiResult(result: DividendApiResponse, currency?: string): DividendHistoryEntry[] {
  // Yahoo format: result.chart.result[0].events.dividends is an object
  if (isYahooResponse(result)) {
    const dividendEventsObj = result.chart.result[0].events.dividends;
    return Object.values(dividendEventsObj)
      .filter(isYahooDividendEvent)
      .map((div) => ({
        date: new Date(div.date * 1000).toISOString(),
        amount: div.amount,
        source: 'api' as const,
        currency,
      }));
  }
  // Finnhub/legacy format: result.dividends is an array
  if (isFinnhubResponse(result)) {
    return result.dividends
      .filter(isFinnhubDividendEvent)
      .map((div) => ({
        date: new Date(div.date * 1000).toISOString(),
        amount: div.amount,
        source: 'api' as const,
        currency,
      }));
  }
  return [];
}
