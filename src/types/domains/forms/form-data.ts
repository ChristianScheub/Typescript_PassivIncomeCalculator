/**
 * Specific form data types for different entities
 */

import { FieldValues } from 'react-hook-form';

export interface ExpenseFormData extends FieldValues {
  name: string;
  category: 'housing' | 'transportation' | 'food' | 'utilities' | 'insurance' | 'healthcare' | 'entertainment' | 'personal' | 'debt_payments' | 'education' | 'subscriptions' | 'other';
  startDate: string;
  endDate?: string;
  notes?: string;
  paymentSchedule: {
    frequency: 'monthly' | 'quarterly' | 'annually' | 'custom';
    amount: number;
    months?: number[];
    customAmounts?: Record<string, number>;
    paymentMonths?: number[];
    dayOfMonth?: number;
  };
}

export interface IncomeFormData extends FieldValues {
  name: string;
  amount: number;
  frequency: string;
  category?: string;
  description?: string;
  isActive: boolean;
  startDate: string;
  endDate?: string;
}

export interface LiabilityFormData extends FieldValues {
  name: string;
  totalAmount: number;
  currentBalance: number;
  interestRate: number;
  minimumPayment: number;
  frequency: string;
  description?: string;
  isActive: boolean;
  startDate: string;
}

export interface AssetDefinitionFormData extends FieldValues {
  name: string;
  symbol: string;
  assetType: string;
  currency: string;
  exchange?: string;
  sector?: string;
  industry?: string;
  description?: string;
  isActive: boolean;
}

export interface AssetFormData extends FieldValues {
  name: string;
  type: string;
  value: number;
  assetDefinitionId?: string;
  assetDefinition?: unknown; // AssetDefinition
  transactionType: 'buy' | 'sell';
  purchaseDate: string;
  purchasePrice: number; // For both buy and sell transactions
  purchaseQuantity?: number; // For both buy and sell transactions (quantity being bought/sold)
  transactionCosts?: number;
  // DEPRECATED: Legacy sale-specific fields - use purchasePrice and purchaseQuantity instead
  saleDate?: string; // @deprecated Use purchaseDate instead
  salePrice?: number; // @deprecated Use purchasePrice instead
  saleQuantity?: number; // @deprecated Use purchaseQuantity instead
  totalReturn?: number;
  totalReturnPercentage?: number;
  notes?: string;
  cachedDividends?: unknown;
}
