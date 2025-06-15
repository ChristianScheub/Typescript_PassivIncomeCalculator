import { IStockAPIService } from './interfaces/IStockAPIService';
import { StockAPIProvider } from '../../store/slices/apiConfigSlice';
import { createStockAPIServiceMethod, getStockAPIServiceMethod } from './methods/createStockAPIService';
import { isAnyAPIProviderConfiguredMethod } from './methods/isAnyAPIProviderConfigured';
import { getAvailableProvidersMethod } from './methods/getAvailableProviders';

/**
 * Stock API Service that manages different stock data providers
 */
class StockAPIService {
  /**
   * Create or update the Stock API Gateway with current configuration
   */
  createStockAPIService(
    selectedProvider?: StockAPIProvider, 
    apiKeys?: { [K in StockAPIProvider]?: string }
  ): IStockAPIService {
    return createStockAPIServiceMethod(selectedProvider, apiKeys);
  }

  /**
   * Get the current Stock API Gateway instance
   */
  getStockAPIService(): IStockAPIService | null {
    return getStockAPIServiceMethod();
  }

  /**
   * Check if any API provider is configured and has an API key
   */
  isAnyAPIProviderConfigured(): boolean {
    return isAnyAPIProviderConfiguredMethod();
  }

  /**
   * Get available API providers with their configuration status
   */
  getAvailableProviders(): Array<{
    id: StockAPIProvider;
    name: string;
    description: string;
    isConfigured: boolean;
    isImplemented: boolean;
  }> {
    return getAvailableProvidersMethod();
  }

  /**
   * Legacy support: Create a Stock API Service using the old interface
   * This maintains backwards compatibility with existing code
   */
  createStockAPIServiceLegacy(): IStockAPIService {
    return this.createStockAPIService();
  }
}

// Export singleton instance
const stockAPIService = new StockAPIService();
export default stockAPIService;

// Export types for use in other modules
export type { IStockAPIService };
export type { StockAPIProvider };
