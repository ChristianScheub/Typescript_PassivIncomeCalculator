/**
 * API provider types and configurations
 */

import { StockAPIProvider, DividendApiProvider } from '../base/enums';

// API provider types
export type StockAPIProviderType = StockAPIProvider;
export type { DividendApiProvider } from '../base/enums';

// API configuration interfaces
export interface ApiProviderConfig {
  provider: string;
  apiKey?: string;
  endpoint?: string;
  rateLimit?: number;
  timeout?: number;
}

export interface DividendApiConfig {
  provider: DividendApiProvider;
  enabled: boolean;
  config: ApiProviderConfig;
}

export interface StockApiConfig {
  provider: StockAPIProviderType;
  enabled: boolean;
  config: ApiProviderConfig;
}
