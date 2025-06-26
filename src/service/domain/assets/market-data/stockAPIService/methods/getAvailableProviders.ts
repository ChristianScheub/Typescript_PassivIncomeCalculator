import { StockAPIProvider } from '@/store/slices/apiConfigSlice';

/**
 * Get available API providers with their configuration status (Redux-driven)
 */
// Deprecated: Siehe neues Functional Object Pattern im index.ts
export {};

export const getAvailableProvidersMethod = (apiKeys: {
  [K in StockAPIProvider]?: string;
}): Array<{
  id: StockAPIProvider;
  name: string;
  description: string;
  isConfigured: boolean;
  isImplemented: boolean;
}> => {
  return [
    {
      id: StockAPIProvider.FINNHUB,
      name: 'Finnhub',
      description: 'Real-time financial data from Finnhub.io',
      isConfigured: !!apiKeys[StockAPIProvider.FINNHUB],
      isImplemented: true,
    },
    {
      id: StockAPIProvider.YAHOO,
      name: 'Yahoo Finance',
      description: 'Financial data from Yahoo Finance API',
      isConfigured: true, // Yahoo Finance doesn't require an API key
      isImplemented: true,
    },
    {
      id: StockAPIProvider.ALPHA_VANTAGE,
      name: 'Alpha Vantage',
      description: 'Financial data from Alpha Vantage API',
      isConfigured: !!apiKeys[StockAPIProvider.ALPHA_VANTAGE],
      isImplemented: true,
    },
  ];
};
