import { IPortfolioHistoryService, PortfolioHistoryDB } from './interfaces/IPortfolioHistoryService';
import { dbOperations } from './methods/dbOperations';
import { specializedOperations } from './methods/specializedOperations';
import { importExportOperations } from './methods/importExportOperations';
import { PortfolioHistoryStoreNames } from '@/types/domains/portfolio/performance';

const portfolioHistoryService: IPortfolioHistoryService = {
  // Basic CRUD operations
  getAll: async <K extends PortfolioHistoryStoreNames>(storeName: K): Promise<PortfolioHistoryDB[K]['value'][]> => {
    return dbOperations.getAll(storeName);
  },

  getById: async <K extends PortfolioHistoryStoreNames>(storeName: K, id: string): Promise<PortfolioHistoryDB[K]['value'] | undefined> => {
    return dbOperations.getById(storeName, id);
  },

  add: async <K extends PortfolioHistoryStoreNames>(storeName: K, item: PortfolioHistoryDB[K]['value']): Promise<void> => {
    return dbOperations.add(storeName, item);
  },

  update: async <K extends PortfolioHistoryStoreNames>(storeName: K, item: PortfolioHistoryDB[K]['value']): Promise<void> => {
    return dbOperations.update(storeName, item);
  },

  remove: async (storeName: PortfolioHistoryStoreNames, id: string): Promise<void> => {
    return dbOperations.remove(storeName, id);
  },

  // Specialized methods for portfolio data
  getPortfolioIntradayByDateRange: async (startDate: string, endDate: string) => {
    return specializedOperations.getPortfolioIntradayByDateRange(startDate, endDate);
  },

  getPortfolioHistoryByDateRange: async (startDate: string, endDate: string) => {
    return specializedOperations.getPortfolioHistoryByDateRange(startDate, endDate);
  },

  // Bulk operations for performance
  bulkAddPortfolioIntradayData: async (data) => {
    return specializedOperations.bulkAddPortfolioIntradayData(data);
  },

  bulkUpsertPortfolioIntradayData: async (data) => {
    return specializedOperations.bulkUpsertPortfolioIntradayData(data);
  },

  bulkAddPortfolioHistory: async (data) => {
    return specializedOperations.bulkAddPortfolioHistory(data);
  },

  bulkUpsertPortfolioHistory: async (data) => {
    return specializedOperations.bulkUpsertPortfolioHistory(data);
  },

  // Data management
  clearOldData: async (beforeDate: string) => {
    return specializedOperations.clearOldData(beforeDate);
  },

  clearStore: async (storeName) => {
    return dbOperations.clearStore(storeName);
  },

  getDataSizeInfo: async () => {
    return specializedOperations.getDataSizeInfo();
  },

  count: async (storeName) => {
    return dbOperations.count(storeName);
  },

  // Import/Export operations
  exportData: async (): Promise<string> => {
    return importExportOperations.exportData();
  },

  importData: async (jsonData: string): Promise<void> => {
    return importExportOperations.importData(jsonData);
  }
};

export default portfolioHistoryService;

