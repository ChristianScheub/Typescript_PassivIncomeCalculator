import { IStockAPIService } from '../interfaces/IStockAPIService';
import { StockAPIGateway } from '../gateway/StockAPIGateway';
import { StockAPIProvider } from '../../../store/slices/apiConfigSlice';

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
export const getStockAPIServiceMethod = (): IStockAPIService | null => {
  return stockAPIGatewayInstance;
};
