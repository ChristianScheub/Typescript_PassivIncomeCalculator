import { DBSchema } from 'idb';
import type { PortfolioHistoryPoint } from '@/types/domains/portfolio/performance';

// Define the Portfolio History database schema
export interface PortfolioHistoryDB extends DBSchema {
  // Store for aggregated portfolio intraday data points
  portfolioIntradayData: {
    key: string; // timestamp (ISO string)
    value: PortfolioIntradayPoint;
    indexes: { 
      'by-date': string;
      'by-timestamp': number;
    };
  };
  
  // Store for portfolio history (daily snapshots)
  portfolioHistory: {
    key: string; // date (YYYY-MM-DD)
    value: PortfolioHistoryPoint;
    indexes: { 
      'by-date': string;
      'by-value': number;
    };
  };
}

// Data types for the portfolio history database
export interface PortfolioIntradayPoint {
  timestamp: string; // ISO timestamp - used as primary key
  date: string; // YYYY-MM-DD format
  value: number;
  performance?: number;
  change?: number;
  changePercent?: number;
}

// Store names type
export type PortfolioHistoryStoreNames = 'portfolioIntradayData' | 'portfolioHistory';

// Interface for the portfolio history service
export interface IPortfolioHistoryService {
  // Generic CRUD operations
  getAll<K extends PortfolioHistoryStoreNames>(storeName: K): Promise<PortfolioHistoryDB[K]['value'][]>;
  getById<K extends PortfolioHistoryStoreNames>(storeName: K, id: string): Promise<PortfolioHistoryDB[K]['value'] | undefined>;
  add<K extends PortfolioHistoryStoreNames>(storeName: K, item: PortfolioHistoryDB[K]['value']): Promise<void>;
  update<K extends PortfolioHistoryStoreNames>(storeName: K, item: PortfolioHistoryDB[K]['value']): Promise<void>;
  remove(storeName: PortfolioHistoryStoreNames, id: string): Promise<void>;
  
  // Specialized methods for portfolio data
  getPortfolioIntradayByDateRange(startDate: string, endDate: string): Promise<PortfolioIntradayPoint[]>;
  getPortfolioHistoryByDateRange(startDate: string, endDate: string): Promise<PortfolioHistoryPoint[]>;
  
  // Bulk operations for performance
  bulkAddPortfolioIntradayData(data: PortfolioIntradayPoint[]): Promise<void>;
  bulkUpsertPortfolioIntradayData(data: PortfolioIntradayPoint[]): Promise<void>;
  bulkAddPortfolioHistory(data: PortfolioHistoryPoint[]): Promise<void>;
  bulkUpsertPortfolioHistory(data: PortfolioHistoryPoint[]): Promise<void>;
  
  // Data management
  clearOldData(beforeDate: string): Promise<void>;
  clearStore(storeName: PortfolioHistoryStoreNames): Promise<void>;
  getDataSizeInfo(): Promise<{ totalEntries: number; oldestDate: string; newestDate: string }>;
  count(storeName: PortfolioHistoryStoreNames): Promise<number>;
  
  // Import/Export
  exportData(): Promise<string>;
  importData(jsonData: string): Promise<void>;
}
