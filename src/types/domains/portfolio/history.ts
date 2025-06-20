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
