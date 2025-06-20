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
