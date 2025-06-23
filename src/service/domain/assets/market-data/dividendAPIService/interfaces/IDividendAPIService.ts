import { DividendData } from '../types';

export interface IDividendAPIService {
  fetchDividends: (ticker: string, opts?: { interval?: string; range?: string }) => Promise<{ dividends: DividendData[] }>;
}