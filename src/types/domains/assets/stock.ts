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
