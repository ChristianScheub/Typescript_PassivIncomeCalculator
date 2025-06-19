/**
 * Financial entities state types
 */

import { Income, Expense, Liability } from './entities';
import { StoreStatus } from '../../shared/base/status';
import { Transaction as Asset } from '../assets/entities';
import { AssetCategoryAssignment } from '../assets';

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
  portfolioCache?: any; // Legacy type for backwards compatibility
  portfolioCacheValid: boolean;
  lastPortfolioCalculation?: string;
  calculationMetadata: {
    lastCalculated: string;
    totalValue: number;
    totalInvestment: number;
    totalReturn: number;
    totalReturnPercentage: number;
    assetDefinitions: any[];
    categories: any[];
    categoryOptions: any[];
    categoryAssignments: AssetCategoryAssignment[];
  };
}
