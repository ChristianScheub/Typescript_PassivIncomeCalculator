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

// Financial calculations
export interface ExpenseBreakdown {
  category: ExpenseCategory;
  amount: number;
  percentage: number;
}
