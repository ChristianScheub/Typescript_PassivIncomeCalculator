/**
 * Financial domain entities
 */

import { BaseEntity } from '../../shared/base/entities';
import { IncomeType, ExpenseCategory, LiabilityType, PaymentFrequency } from '../../shared/base/enums';

// Schedule-related interfaces
export interface PaymentSchedule {
  frequency: PaymentFrequency;
  amount: number;
  months?: number[];
  customAmounts?: Record<number, number>;
  dayOfMonth?: number; // Tag des Monats (1-31) an dem die Zahlung erfolgt
}

// Income entities
export interface Income extends BaseEntity {
  type: IncomeType;
  paymentSchedule: PaymentSchedule;
  isPassive: boolean;
  sourceId?: string; // Reference to an asset if the income is from an asset
  startDate: string;
  endDate?: string;
  notes?: string;
}

export interface IncomeFormData {
  name: string;
  type: 'salary' | 'interest' | 'side_hustle' | 'other';
  paymentFrequency: 'monthly' | 'quarterly' | 'annually' | 'custom';
  amount: number;
  isPassive: boolean;
  customSchedule?: number[];
  dayOfMonth?: number; // Tag des Monats für die Zahlung
  startDate: string;
  endDate?: string;
  notes?: string;
}

// Expense entities
export interface Expense extends BaseEntity {
  category: ExpenseCategory;
  paymentSchedule: PaymentSchedule;
  amount: number;
  startDate: string;
  endDate?: string;
  notes?: string;
}

// Liability entities
export interface Liability extends BaseEntity {
  type: LiabilityType;
  initialBalance: number;
  currentBalance: number;
  interestRate?: number;
  paymentSchedule?: PaymentSchedule;
  startDate?: string;
  endDate?: string;
  notes?: string;
}

// Asset entities (alias for backward compatibility)
export type Asset = {
  id: string;
  name: string;
  type: string;
  assetDefinitionId?: string;
  assetDefinition?: {
    ticker?: string;
    sector?: string;
    fullName?: string;
  };
  transactionType: 'buy' | 'sell';
  purchasePrice: number;
  purchaseQuantity: number;
  purchaseDate: string;
  salePrice?: number;
  saleQuantity?: number;
  saleDate?: string;
  transactionCosts?: number;
  currency?: string;
  exchange?: string;
  currentPrice?: number;
  currentValue?: number;
  value?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
};

// Financial calculations
export interface ExpenseBreakdown {
  category: ExpenseCategory;
  amount: number;
  percentage: number;
}

/**
 * Exchange Rate - currency exchange data
 */
export interface ExchangeRate {
  id?: number;
  date: string; // YYYY-MM-DD format
  usdToEur: number;
  createdAt?: string;
}
