/**
 * External API integration types
 */

// Exchange rates
export interface ExchangeRate {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  timestamp: string;
  source?: string;
}

// Stock API provider types
export type StockAPIProvider = 'yahoo' | 'alphavantage' | 'finnhub' | 'mock';

export interface StockAPIConfig {
  provider: StockAPIProvider;
  apiKey?: string;
  baseUrl?: string;
  rateLimit?: number;
  timeout?: number;
}
