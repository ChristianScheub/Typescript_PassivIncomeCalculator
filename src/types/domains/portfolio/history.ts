/**
 * Portfolio history and tracking types
 */

import { AssetPosition } from './performance';

// Historical portfolio data
export interface PortfolioHistoryDay {
  date: string;
  totalValue: number;
  performance: number;
  positions: AssetPosition[];
}

// Portfolio transaction history
export interface PortfolioTransaction {
  id: string;
  date: string;
  assetDefinitionId: string;
  assetName: string;
  ticker?: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  value: number;
  fees?: number;
  notes?: string;
}

// Portfolio cache for performance optimization
export interface PortfolioHistoryCache {
  totalValue: number;
  totalInvested: number;
  totalReturn: number;
  totalReturnPercentage: number;
  assetCount: number;
  lastUpdated: string;
  positions: AssetPosition[];
}

// Portfolio History Service Types
/**
 * Portfolio History Point - represents portfolio value at a specific date (Service Layer)
 */
export interface PortfolioHistoryPoint {
  date: string;
  value: number;
  transactions: PortfolioServiceTransaction[];
}

/**
 * Portfolio Service Transaction - transaction for service calculations
 */
export interface PortfolioServiceTransaction {
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  symbol: string;
  assetName: string;
}

/**
 * Asset Position (Service) - tracks current position for service calculations
 */
export interface ServiceAssetPosition {
  assetDefinitionId: string;
  symbol: string;
  quantity: number;
  averageBuyPrice: number;
  lastKnownPrice: number;
}

/**
 * Performance Metrics - calculated performance data
 */
export interface PerformanceMetrics {
  totalReturn: number;
  totalReturnPercentage: number;
  startValue: number;
  endValue: number;
  peakValue: number;
  lowestValue: number;
}

/**
 * Chart Data Point - formatted for chart display
 */
export interface ChartDataPoint {
  date: string;
  value: number;
  formattedDate: string;
  hasTransactions: boolean;
  transactions: PortfolioServiceTransaction[];
}

/**
 * Common time range options for portfolio history calculations
 */
export enum TimeRange {
  WEEK = 7,
  MONTH = 30,
  QUARTER = 90,
  HALF_YEAR = 180,
  YEAR = 365,
  TWO_YEARS = 730,
  FIVE_YEARS = 1825
}
