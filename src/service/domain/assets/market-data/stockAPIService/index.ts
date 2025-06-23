import { IStockAPIService } from './interfaces/IStockAPIService';
import { IStockAPIServiceManager } from './StockAPIService';
import { createStockAPIServiceMethod } from './methods/createStockAPIService';
import { getStockAPIServiceMethod } from './methods/createStockAPIService';
import { getAvailableProvidersMethod } from './methods/getAvailableProviders';
import stockAPIService from './StockAPIService';

// Export the service interface and implementation
export type { IStockAPIService };
export type { IStockAPIServiceManager };
export { stockAPIService };
export default stockAPIService;
// Export helpers for direct use if needed
export { createStockAPIServiceMethod, getStockAPIServiceMethod, getAvailableProvidersMethod };
