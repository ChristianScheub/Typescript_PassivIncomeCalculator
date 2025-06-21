import { IStockAPIService } from './interfaces/IStockAPIService';
import { StockHistory } from '@/types/domains/assets/';
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

  /**
   * Get intraday stock data (proxy method)
   */
  getIntradayHistory: (symbol: string, days?: number) => Promise<StockHistory>;
}

/**
 * Stock API Service that manages different stock data providers
 * Implementiert als funktionales Objekt anstatt als Klasse
 */
const stockAPIService: IStockAPIServiceManager = {
  createStockAPIService: createStockAPIServiceMethod,
  getStockAPIService: getStockAPIServiceMethod,
  getAvailableProviders: getAvailableProvidersMethod,
  
  /**
   * Proxy method for getIntradayHistory
   */
  getIntradayHistory: async (symbol: string, days: number = 1) => {
    console.log(`StockAPIService: Getting intraday history for ${symbol}`);
    const service = getStockAPIServiceMethod();
    console.log(`StockAPIService: Service instance available: ${!!service}`);
    
    if (!service) {
      const error = new Error('Stock API service not configured. Call createStockAPIService() first.');
      console.error('StockAPIService:', error.message);
      throw error;
    }
    
    try {
      console.log(`StockAPIService: Calling service.getIntradayHistory for ${symbol} (${days} days)`);
      const result = await service.getIntradayHistory(symbol, days);
      console.log(`StockAPIService: Received intraday history for ${symbol}: ${result.entries?.length || 0} entries`);
      return result;
    } catch (error) {
      console.error(`StockAPIService: Error getting intraday history for ${symbol}:`, error);
      throw error;
    }
  }
};

// Export default instance for direct use
export default stockAPIService;

// Export the service
export { stockAPIService };

// Only export service interfaces, no fachliche types
