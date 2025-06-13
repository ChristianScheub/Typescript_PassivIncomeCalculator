// Simplified Stock API Types
export interface StockExchange {
  symbol: string;
  suffix: string;
  exchangeName: string;
  market: string;
  currency: string;
}

export interface StockPrice {
  symbol: string;
  price: number;
  currency: string;
  timestamp: number;
  change?: number;
  changePercent?: number;
}

export interface StockHistoryEntry {
  date: string;
  timestamp: number;
  open: number;
  midday: number; // Price at market midday (usually around 12:00)
  close: number;
  volume?: number;
}

export interface StockHistory {
  symbol: string;
  data: StockHistoryEntry[];
  currency: string;
}
