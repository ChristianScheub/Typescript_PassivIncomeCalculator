/**
 * Financial entities state types
 */

import { Income, Expense, Liability } from './entities';
import { StoreStatus } from '../../shared/base/status';
import { Transaction as Asset } from '../assets/entities';
import { AssetCategoryAssignment } from '../assets';
import { PortfolioPosition } from '../portfolio/position';

// Portfolio cache interface matching the one used in transactionsSlice
export interface PortfolioCache {
  positions: PortfolioPosition[];
  totals: {
    totalValue: number;
    totalInvestment: number;
    totalReturn: number;
    totalReturnPercentage: number;
    monthlyIncome: number;
    annualIncome: number;
    positionCount: number;
    transactionCount: number;
  };
  lastCalculated: string;
}

export interface IncomeState {
  items: Income[];
  status: StoreStatus;
  error: string | null;
}

export interface ExpensesState {
  items: Expense[];
  status: StoreStatus;
  error: string | null;
}

export interface LiabilitiesState {
  items: Liability[];
  status: StoreStatus;
  error: string | null;
}

export interface TransactionsState {
  items: Asset[];
  status: StoreStatus;
  error: string | null;
  portfolioCache?: PortfolioCache;
  portfolioCacheValid: boolean;
  lastPortfolioCalculation?: string;
  calculationMetadata: {
    lastCalculated: string;
    totalValue: number;
    totalInvestment: number;
    totalReturn: number;
    totalReturnPercentage: number;
    assetDefinitions: unknown[];
    categories: unknown[];
    categoryOptions: unknown[];
    categoryAssignments: AssetCategoryAssignment[];
  };
}
