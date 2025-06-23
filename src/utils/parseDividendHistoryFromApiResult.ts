import { DividendHistoryEntry } from '@/types/domains/assets/dividends';

/**
 * Maps the result from a dividend API call (Yahoo or Finnhub) to a DividendHistoryEntry[]
 * Handles both Yahoo (object) and Finnhub/legacy (array) formats.
 */
export function parseDividendHistoryFromApiResult(result: any, currency?: string): DividendHistoryEntry[] {
  // Yahoo format: result.chart.result[0].events.dividends is an object
  if (result?.chart?.result?.[0]?.events?.dividends) {
    const dividendEventsObj = result.chart.result[0].events.dividends;
    return Object.values(dividendEventsObj)
      .filter((div: any) => div.date && div.amount != null)
      .map((div: any) => ({
        date: new Date(div.date * 1000).toISOString(),
        amount: div.amount,
        source: 'api',
        currency,
      }));
  }
  // Finnhub/legacy format: result.dividends is an array
  if (Array.isArray(result?.dividends)) {
    return result.dividends
      .filter((div: any) => div.date && div.amount != null)
      .map((div: any) => ({
        date: new Date(div.date * 1000).toISOString(),
        amount: div.amount,
        source: 'api',
        currency,
      }));
  }
  return [];
}
