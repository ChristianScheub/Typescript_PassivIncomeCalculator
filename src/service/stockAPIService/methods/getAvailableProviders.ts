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
    finnhub: localStorage.getItem('finnhub_api_key'),
    yahoo: localStorage.getItem('yahoo_api_key'),
    alpha_vantage: localStorage.getItem('alpha_vantage_api_key'),
    iex_cloud: localStorage.getItem('iex_cloud_api_key'),
  };

  return [
    {
      id: 'finnhub',
      name: 'Finnhub',
      description: 'Real-time financial data from Finnhub.io',
      isConfigured: !!apiKeys.finnhub,
      isImplemented: true,
    },
    {
      id: 'yahoo',
      name: 'Yahoo Finance',
      description: 'Financial data from Yahoo Finance API',
      isConfigured: true, // Yahoo Finance doesn't require an API key
      isImplemented: true, // Now implemented with simplified interface
    },
    {
      id: 'alpha_vantage',
      name: 'Alpha Vantage',
      description: 'Financial data from Alpha Vantage API',
      isConfigured: !!apiKeys.alpha_vantage,
      isImplemented: false, // TODO: Set to true when implemented
    },
    {
      id: 'iex_cloud',
      name: 'IEX Cloud',
      description: 'Financial data from IEX Cloud API',
      isConfigured: !!apiKeys.iex_cloud,
      isImplemented: false, // TODO: Set to true when implemented
    },
  ];
};
