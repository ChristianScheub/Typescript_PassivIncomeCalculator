import { StockAPIProvider } from '@/types/shared/base/enums';

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
    {
      id: StockAPIProvider.IEX_CLOUD,
      name: 'IEX Cloud',
      description: 'Real-time and historical financial data from IEX Cloud',
      isConfigured: !!apiKeys[StockAPIProvider.IEX_CLOUD],
      isImplemented: true,
    },
    {
      id: StockAPIProvider.TWELVE_DATA,
      name: 'Twelve Data',
      description: 'Real-time and historical financial data from Twelve Data API',
      isConfigured: !!apiKeys[StockAPIProvider.TWELVE_DATA],
      isImplemented: true,
    },
    {
      id: StockAPIProvider.QUANDL,
      name: 'Quandl (Nasdaq Data Link)',
      description: 'Financial and economic data from Quandl/Nasdaq Data Link',
      isConfigured: !!apiKeys[StockAPIProvider.QUANDL],
      isImplemented: true,
    },
    {
      id: StockAPIProvider.EOD_HISTORICAL_DATA,
      name: 'EOD Historical Data',
      description: 'End-of-day and real-time financial data',
      isConfigured: !!apiKeys[StockAPIProvider.EOD_HISTORICAL_DATA],
      isImplemented: true,
    },
    {
      id: StockAPIProvider.POLYGON_IO,
      name: 'Polygon.io',
      description: 'Real-time and historical stock market data from Polygon.io',
      isConfigured: !!apiKeys[StockAPIProvider.POLYGON_IO],
      isImplemented: true,
    },
  ];
};
