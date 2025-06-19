/**
 * Enhanced Portfolio Cache Types
 */

import { AssetDefinition, Transaction } from '../assets/entities';
import { PriceHistoryEntry } from '../assets/market-data';

// Portfolio Position with full transaction details
export interface PortfolioPosition {
  assetDefinition: AssetDefinition;
  transactions: Transaction[];
  transactionCount: number;
  totalQuantity: number;
  averagePurchasePrice: number;
  currentValue: number;
  totalInvested: number;
  unrealizedGain: number;
  unrealizedGainPercentage: number;
  sector?: string;
  country?: string;
}

// Enhanced Portfolio Cache with typed positions
export interface TypedPortfolioCache {
  positions: PortfolioPosition[];
  totalValue: number;
  totalInvested: number;
  totalReturn: number;
  totalReturnPercentage: number;
  assetCount: number;
  lastUpdated: string;
  isValid: boolean;
}

// Legacy cache structure for backwards compatibility
export interface LegacyPortfolioCache {
  positions: Array<{
    formatted?: {
      currentValue: string;
    };
  }>;
  totals: {
    totalValue: number;
    monthlyIncome: number;
    annualIncome: number;
    totalInvestment: number;
    totalReturn: number;
    totalReturnPercentage: number;
    [key: string]: number;
  };
  metadata: {
    lastCalculated: string;
    combinedHash: string;
  };
}

// Transaction with proper typing
export interface TypedTransaction {
  id: string;
  transactionType: 'buy' | 'sell';
  purchaseDate: string;
  purchasePrice: number;
  purchaseQuantity: number;
  transactionCosts?: number;
  saleDate?: string;  
  salePrice?: number;
  saleQuantity?: number;
}

// Portfolio History calculation types
export interface TypedPortfolioHistoryDay {
  date: string;
  value: number;
  change: number;
  changePercentage: number;
}

// Asset definition with price history for calculations
export interface AssetDefinitionWithHistory extends AssetDefinition {
  priceHistory: PriceHistoryEntry[];
}
