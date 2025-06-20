import { IStockAPIService } from './interfaces/IStockAPIService';
import { StockAPIProvider } from '@/store/slices/apiConfigSlice';
import { createStockAPIServiceMethod, getStockAPIServiceMethod } from './methods/createStockAPIService';
import { getAvailableProvidersMethod } from './methods/getAvailableProviders';

// Definition der Typ-Signatur für den StockAPIService
export interface IStockAPIServiceManager {
  /**
   * Create or update the Stock API Gateway with current configuration
   */
  createStockAPIService: (
    selectedProvider?: StockAPIProvider, 
    apiKeys?: { [K in StockAPIProvider]?: string }
  ) => IStockAPIService;

  /**
   * Get the current Stock API Gateway instance
   */
  getStockAPIService: () => IStockAPIService | null;

  /**
   * Get available API providers with their configuration status
   */
  getAvailableProviders: () => Array<{
    id: StockAPIProvider;
    name: string;
    description: string;
    isConfigured: boolean;
    isImplemented: boolean;
  }>;
}

/**
 * Stock API Service that manages different stock data providers
 * Implementiert als funktionales Objekt anstatt als Klasse
 */
const stockAPIService: IStockAPIServiceManager = {
  createStockAPIService: createStockAPIServiceMethod,
  getStockAPIService: getStockAPIServiceMethod,
  getAvailableProviders: getAvailableProvidersMethod
};

// Export default instance for direct use
export default stockAPIService;

// Export the service
export { stockAPIService };

// Only export service interfaces, no fachliche types
