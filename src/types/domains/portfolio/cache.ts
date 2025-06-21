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

// Transaction with proper typing
export interface TypedTransaction {
  id: string;
  transactionType: 'buy' | 'sell';
  purchaseDate: string;
  purchasePrice: number; // For both buy and sell transactions
  purchaseQuantity: number; // For both buy and sell transactions (quantity being bought/sold)
  transactionCosts?: number;
  // DEPRECATED: Legacy sale-specific fields - use purchasePrice and purchaseQuantity instead
  saleDate?: string; // @deprecated Use purchaseDate instead
  salePrice?: number; // @deprecated Use purchasePrice instead
  saleQuantity?: number; // @deprecated Use purchaseQuantity instead
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
