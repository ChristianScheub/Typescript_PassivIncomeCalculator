import { IStockAPIService } from '../interfaces/IStockAPIService';
import { StockAPIGateway } from '../gateway/StockAPIGateway';
import { StockAPIProvider } from '@/store/slices/apiConfigSlice';

// Global gateway instance
let stockAPIGatewayInstance: StockAPIGateway | null = null;

/**
 * Create or update the Stock API Gateway with current configuration
 */
export const createStockAPIServiceMethod = (
  selectedProvider?: StockAPIProvider, 
  apiKeys?: { [K in StockAPIProvider]?: string }
): IStockAPIService => {
  // Get configuration from Redux store or localStorage if not provided
  if (!selectedProvider || !apiKeys) {
    const storedProvider = localStorage.getItem('selected_stock_api_provider') as StockAPIProvider;
    const storedApiKeys = {
      [StockAPIProvider.FINNHUB]: localStorage.getItem('finnhub_api_key') || undefined,
      [StockAPIProvider.YAHOO]: localStorage.getItem('yahoo_api_key') || undefined,
      [StockAPIProvider.ALPHA_VANTAGE]: localStorage.getItem('alpha_vantage_api_key') || undefined,
    };
    
    // Use stored provider if available and has API key, otherwise fallback to Yahoo (no key required)
    let defaultProvider = storedProvider || StockAPIProvider.FINNHUB;
    if (defaultProvider === StockAPIProvider.FINNHUB && !storedApiKeys[StockAPIProvider.FINNHUB]) {
      console.log('No Finnhub API key found, falling back to Yahoo provider');
      defaultProvider = StockAPIProvider.YAHOO;
    }
    if (defaultProvider === StockAPIProvider.ALPHA_VANTAGE && !storedApiKeys[StockAPIProvider.ALPHA_VANTAGE]) {
      console.log('No Alpha Vantage API key found, falling back to Yahoo provider');
      defaultProvider = StockAPIProvider.YAHOO;
    }
    
    selectedProvider = selectedProvider || defaultProvider;
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
export const getStockAPIServiceMethod = (): IStockAPIService | null => {
  return stockAPIGatewayInstance;
};
