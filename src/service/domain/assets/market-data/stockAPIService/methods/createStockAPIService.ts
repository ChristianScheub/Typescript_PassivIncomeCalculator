import { IStockAPIService } from '../interfaces/IStockAPIService';
import { StockAPIGateway } from '../gateway/StockAPIGateway';
import { StockAPIProvider } from '@/store/slices/apiConfigSlice';

// Global gateway instance
let stockAPIGatewayInstance: StockAPIGateway | null = null;

/**
 * Create or update the Stock API Gateway with current configuration (Redux-driven)
 */
export const createStockAPIServiceMethod = (
  selectedProvider: StockAPIProvider, 
  apiKeys: { [K in StockAPIProvider]?: string }
): IStockAPIService => {
  if (!selectedProvider || !apiKeys) {
    throw new Error('StockAPIService: selectedProvider and apiKeys are required and must come from Redux state.');
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
