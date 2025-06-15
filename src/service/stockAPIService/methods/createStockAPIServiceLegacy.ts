import { IStockAPIService } from '../interfaces/IStockAPIService';
import { createStockAPIServiceMethod } from './createStockAPIService';

/**
 * Legacy support: Create a Stock API Service using the old interface
 * This maintains backwards compatibility with existing code
 */
export const createStockAPIServiceLegacyMethod = (): IStockAPIService => {
  return createStockAPIServiceMethod();
};
