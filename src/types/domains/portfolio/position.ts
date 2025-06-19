/**
 * Portfolio Position Types
 */

import { AssetDefinition, Transaction } from '../assets';
import { AssetCategory, AssetCategoryOption } from '../assets/categories';

export interface PortfolioPosition {
  id: string; // AssetDefinitionId or fallback identifier
  assetDefinition?: AssetDefinition;
  name: string;
  ticker?: string;
  type: string;
  sector?: string;
  country?: string;
  currency?: string;
  
  // Aggregated quantities and values
  totalQuantity: number;
  averagePurchasePrice: number;
  totalInvestment: number;
  currentValue: number;
  currentPrice?: number;
  
  // Performance metrics
  totalReturn: number;
  totalReturnPercentage: number;
  
  // Income calculations (based on AssetDefinition and total quantity)
  monthlyIncome: number;
  annualIncome: number;
  
  // PRE-FORMATTED VALUES FOR UI (to avoid repeated formatting calls)
  formatted: {
    currentValue: string;
    totalInvestment: string;
    totalReturn: string;
    totalReturnPercentage: string;
    monthlyIncome: string;
    annualIncome: string;
    averagePurchasePrice: string;
    currentPrice: string;
  };
  
  // Category information
  categoryAssignments?: {
    category: AssetCategory;
    option: AssetCategoryOption;
  }[];
  
  // Transaction details
  transactions: Transaction[];
  transactionCount: number;
  firstPurchaseDate: string;
  lastPurchaseDate: string;
}

// Portfolio calculation result
export interface PortfolioCalculationResult {
  positions: PortfolioPosition[];
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
    assetCount: number;
    definitionCount: number;
    positionCount: number;
  };
}
