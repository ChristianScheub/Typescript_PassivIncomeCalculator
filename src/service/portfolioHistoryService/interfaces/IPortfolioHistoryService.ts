import { Asset, AssetDefinition } from '../../../types';

/**
 * Portfolio History Point - represents portfolio value at a specific date
 */
export interface PortfolioHistoryPoint {
  date: string;
  value: number;
  transactions: PortfolioTransaction[];
}

/**
 * Portfolio Transaction - represents a transaction that occurred on a specific date
 */
export interface PortfolioTransaction {
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  symbol: string;
  assetName: string;
}

/**
 * Asset Position - tracks the current position for a specific asset
 */
export interface AssetPosition {
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
  transactions: PortfolioTransaction[];
}

/**
 * Portfolio History Service Interface
 */
export interface IPortfolioHistoryService {
  // Portfolio history calculations
  calculatePortfolioHistory(
    assets: Asset[], 
    assetDefinitions: AssetDefinition[]
  ): PortfolioHistoryPoint[];
  
  calculatePortfolioHistoryForDays(
    assets: Asset[], 
    assetDefinitions: AssetDefinition[],
    daysBack: number
  ): PortfolioHistoryPoint[];
  
  // Performance calculations
  calculatePerformanceMetrics(
    historyPoints: PortfolioHistoryPoint[], 
    totalInvestment: number
  ): PerformanceMetrics;
  
  // Chart formatting
  formatForChart(historyPoints: PortfolioHistoryPoint[]): ChartDataPoint[];

  // Time range helpers
  getLastWeek(assets: Asset[], assetDefinitions?: AssetDefinition[]): PortfolioHistoryPoint[];
  getLastMonth(assets: Asset[], assetDefinitions?: AssetDefinition[]): PortfolioHistoryPoint[];
  getLastQuarter(assets: Asset[], assetDefinitions?: AssetDefinition[]): PortfolioHistoryPoint[];
  getLastHalfYear(assets: Asset[], assetDefinitions?: AssetDefinition[]): PortfolioHistoryPoint[];
  getLastYear(assets: Asset[], assetDefinitions?: AssetDefinition[]): PortfolioHistoryPoint[];
  getLastTwoYears(assets: Asset[], assetDefinitions?: AssetDefinition[]): PortfolioHistoryPoint[];
  getLastFiveYears(assets: Asset[], assetDefinitions?: AssetDefinition[]): PortfolioHistoryPoint[];
  getCustomDays(assets: Asset[], assetDefinitions: AssetDefinition[], days: number): PortfolioHistoryPoint[];
}
