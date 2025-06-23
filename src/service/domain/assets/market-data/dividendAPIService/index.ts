import { CapacitorHttp } from '@capacitor/core';
import Logger from '@/service/shared/logging/Logger/logger';

export interface DividendData {
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'annually';
  paymentMonths?: number[];
  lastDividendDate?: string;
}

export interface DividendApiHandler {
  fetchDividends: (ticker: string, opts?: { interval?: string; range?: string }) => Promise<{ dividends: DividendData[] }>;
}

function getFinnhubApiKey(): string {
  const apiKey = localStorage.getItem('finnhub_api_key');
  if (!apiKey) {
    throw new Error('Finnhub API key not found. Please set your API key in Settings.');
  }
  return apiKey;
}

export function createDividendApiHandler(provider: 'yahoo' | 'finnhub'): DividendApiHandler {
  if (provider === 'finnhub') {
    return {
      async fetchDividends(ticker: string) {
        try {
          const apiKey = getFinnhubApiKey();
          const url = `https://finnhub.io/api/v1/stock/dividend?symbol=${encodeURIComponent(ticker)}&token=${apiKey}`;
          Logger.infoService(`Fetching dividends from Finnhub for ${ticker}`);
          const response = await CapacitorHttp.get({
            url,
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'PassiveIncomeCalculator/1.0',
            },
          });
          if (response.status !== 200) {
            throw new Error(`Finnhub API error! status: ${response.status}`);
          }
          // Map Finnhub response to DividendData[]
          // Finnhub returns an array of dividend objects
          const dividends: DividendData[] = (response.data || []).map((item: any) => ({
            amount: item.amount,
            frequency: 'annually', // Finnhub may not provide frequency; adjust if available
            lastDividendDate: item.paymentDate,
          }));
          return { dividends };
        } catch (error) {
          const err = error as any;
          Logger.error(`Error fetching dividends from Finnhub: ${JSON.stringify({
            message: err?.message,
            stack: err?.stack,
            error: err,
          })}`);
          throw error;
        }
      },
    };
  }
  // Default: Yahoo
  return {
    async fetchDividends(ticker: string, opts?: { interval?: string; range?: string }) {
      try {
        const interval = opts?.interval || '1m';
        const range = opts?.range || 'max';
        const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=${interval}&range=${range}&events=div`;
        Logger.infoService(`[Yahoo] About to fetch dividends for ${ticker} with URL: ${url}`);
        Logger.infoService(`[Yahoo] CapacitorHttp typeof: ${typeof CapacitorHttp}`);
        Logger.infoService(`[Yahoo] CapacitorHttp.get typeof: ${typeof CapacitorHttp.get}`);
        let response;
        try {
          response = await CapacitorHttp.get({
            url,
            headers: {
              'User-Agent': 'Mozilla/5.0',
              'Accept': 'application/json',
            },
          });
        } catch (httpError) {
          Logger.error(`[Yahoo] CapacitorHttp.get failed: ${JSON.stringify(httpError)}`);
          throw httpError;
        }
        Logger.infoService(`[Yahoo] Response from API: ${JSON.stringify(response)}`);
        if (response.status !== 200) {
          throw new Error(`Yahoo API error! status: ${response.status}`);
        }
        // Parse Yahoo JSON response
        const data = response.data;
        // Return the full Yahoo API response for unified parsing in the slice
        return data;
      } catch (error) {
        const err = error as any;
        Logger.error(`Error fetching dividends from Yahoo: ${JSON.stringify({
          message: err?.message,
          stack: err?.stack,
          error: err,
          response: err?.response,
        })}`);
        throw error;
      }
    },
  };
}
