export interface DividendData {
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'annually';
  paymentMonths?: number[];
  lastDividendDate?: string;
}

export interface DividendApiHandler {
  fetchDividends: (ticker: string, opts?: { interval?: string; range?: string }) => Promise<{ dividends: DividendData[] }>;
}

export type DividendApiProvider = 'yahoo' | 'finnhub';
