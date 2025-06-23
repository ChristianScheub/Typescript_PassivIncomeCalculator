import { DividendApiProvider, DividendData } from '../types';
import { fetchDividendsYahoo } from '../providers/yahoo/fetchDividendsYahoo';
import { fetchDividendsFinnhub } from '../providers/finnhub/fetchDividendsFinnhub';

export type DividendProviderFn = (ticker: string, opts: { apiKey?: string; interval?: string; range?: string }) => Promise<{ dividends: DividendData[] }>;

export const dividendProviders: Record<DividendApiProvider, DividendProviderFn> = {
  yahoo: async (ticker, opts) => {
    const dividends = await fetchDividendsYahoo(ticker, opts);
    return { dividends };
  },
  finnhub: async (ticker, opts) => {
    if (!opts?.apiKey) throw new Error('No API key configured for Finnhub');
    const dividends = await fetchDividendsFinnhub(ticker, opts.apiKey);
    return { dividends };
  },
};
