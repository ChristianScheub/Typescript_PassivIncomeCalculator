/**
 * Asset domain market data types
 */

import { PriceSource } from '../../shared/base/enums';

// Historical price data
export interface PriceHistoryEntry {
  date: string;
  price: number;
  source?: PriceSource;
}

// Current market data
export interface MarketData {
  currentPrice?: number;
  lastPriceUpdate?: string;
  autoUpdatePrice?: boolean; // Whether to auto-update price via API (only for stocks)
  autoUpdateHistoricalPrices?: boolean; // Whether to auto-update historical prices via API (only for stocks)
}

// Stock-specific market data
export interface StockInfo {
  symbol?: string;
  price?: number;
  change?: number;
  changePercent?: number;
  previousClose?: number;
  high?: number;
  low?: number;
  open?: number;
  timestamp?: number;
  tradingDay?: string;
  error?: string;
  needsApiKey?: boolean;
}

export interface StockPrice {
  symbol: string;
  price: number;
  change?: number;
  changePercent?: number;
  timestamp: number;
  currency?: string;
}

export interface StockHistoryEntry {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  // Additional fields for API compatibility
  timestamp?: number;
  midday?: number; // Price at market midday (usually around 12:00)
}

export interface StockHistory {
  symbol: string;
  entries: StockHistoryEntry[];
  currency?: string;
  source?: string;
  // Alternative field name for API compatibility
  data?: StockHistoryEntry[];
}
