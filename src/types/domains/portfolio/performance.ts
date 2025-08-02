// Store names type for portfolio history DB
export type PortfolioHistoryStoreNames = 'portfolioIntradayData' | 'portfolioHistory';
/**
 * Portfolio performance metrics and calculations
 */

// Chart-specific performance metrics
export interface PortfolioPerformanceMetrics {
  totalReturn: number;
  totalReturnPercentage: number;
  peakValue: number;
  lowestValue: number;
}

// Chart data structures
export interface ChartDataPoint {
  date: string;
  value: number;
  totalInvested?: number;
  totalReturn?: number;
  label?: string;
}

export interface PortfolioHistoryPoint {
  date: string;
  totalValue: number;
  totalInvested: number;
  totalReturn: number;
  totalReturnPercentage: number;
  positions: AssetPosition[];
}

// Asset position tracking
export interface AssetPosition {
  assetDefinitionId: string;
  assetName: string;
  assetType: string;
  ticker?: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  currentValue: number;
  totalInvested: number;
  totalReturn: number;
  totalReturnPercentage: number;
  weight: number; // Portfolio weight percentage
}
