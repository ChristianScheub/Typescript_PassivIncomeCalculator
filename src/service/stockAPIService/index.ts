import { IStockAPIService } from './interfaces/IStockAPIService';
import { StockAPIGateway } from './gateway/StockAPIGateway';
import { StockAPIProvider } from '../../store/slices/apiConfigSlice';
import Logger from '../Logger/logger';

// Global gateway instance
let stockAPIGatewayInstance: StockAPIGateway | null = null;

/**
 * Create or update the Stock API Gateway with current configuration
 */
export const createStockAPIService = (
  selectedProvider?: StockAPIProvider, 
  apiKeys?: { [K in StockAPIProvider]?: string }
): IStockAPIService => {
  // Get configuration from Redux store or localStorage if not provided
  if (!selectedProvider || !apiKeys) {
    const storedProvider = localStorage.getItem('selected_stock_api_provider') as StockAPIProvider || 'finnhub';
    const storedApiKeys = {
      finnhub: localStorage.getItem('finnhub_api_key') || undefined,
      yahoo: localStorage.getItem('yahoo_api_key') || undefined,
      alpha_vantage: localStorage.getItem('alpha_vantage_api_key') || undefined,
      iex_cloud: localStorage.getItem('iex_cloud_api_key') || undefined,
    };
    
    selectedProvider = selectedProvider || storedProvider;
    apiKeys = apiKeys || storedApiKeys;
  }

  // Create new gateway instance or switch provider if needed
  if (!stockAPIGatewayInstance) {
    stockAPIGatewayInstance = new StockAPIGateway(selectedProvider, apiKeys);
  } else {
    stockAPIGatewayInstance.switchProvider(selectedProvider, apiKeys);
  }

  return stockAPIGatewayInstance;
};

/**
 * Get the current Stock API Gateway instance
 */
export const getStockAPIService = (): IStockAPIService | null => {
  return stockAPIGatewayInstance;
};

/**
 * Check if any API provider is configured and has an API key
 */
export const isAnyAPIProviderConfigured = (): boolean => {
  const apiKeys = {
    finnhub: localStorage.getItem('finnhub_api_key'),
    yahoo: localStorage.getItem('yahoo_api_key'),
    alpha_vantage: localStorage.getItem('alpha_vantage_api_key'),
    iex_cloud: localStorage.getItem('iex_cloud_api_key'),
  };
  
  // Yahoo Finance doesn't require an API key, so it's always considered configured
  return true || Object.values(apiKeys).some(key => !!key);
};

/**
 * Get available API providers with their configuration status
 */
export const getAvailableProviders = (): Array<{
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

/**
 * Legacy support: Create a Stock API Service using the old interface
 * This maintains backwards compatibility with existing code
 */
export const createStockAPIServiceLegacy = (): IStockAPIService => {
  return createStockAPIService();
};
