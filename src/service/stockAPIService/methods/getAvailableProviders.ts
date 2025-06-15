import { StockAPIProvider } from '../../../store/slices/apiConfigSlice';

/**
 * Get available API providers with their configuration status
 */
export const getAvailableProvidersMethod = (): Array<{
  id: StockAPIProvider;
  name: string;
  description: string;
  isConfigured: boolean;
  isImplemented: boolean;
}> => {
  const apiKeys = {
    [StockAPIProvider.FINNHUB]: localStorage.getItem('finnhub_api_key'),
    [StockAPIProvider.YAHOO]: localStorage.getItem('yahoo_api_key'),
    [StockAPIProvider.ALPHA_VANTAGE]: localStorage.getItem('alpha_vantage_api_key'),
  };

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
      isImplemented: true, // Now implemented with simplified interface
    },
    {
      id: StockAPIProvider.ALPHA_VANTAGE,
      name: 'Alpha Vantage',
      description: 'Financial data from Alpha Vantage API',
      isConfigured: !!apiKeys[StockAPIProvider.ALPHA_VANTAGE],
      isImplemented: false, // TODO: Set to true when implemented
    },
  ];
};
