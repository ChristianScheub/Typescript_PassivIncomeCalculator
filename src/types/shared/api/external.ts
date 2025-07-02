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

export interface StockAPIConfig {
  provider: import('@/types/shared/base/enums').StockAPIProvider;
  apiKey?: string;
  baseUrl?: string;
  rateLimit?: number;
  timeout?: number;
}
