/**
 * Financial calculations and metrics
 */

import { DividendFrequency, LiabilityType } from '../../shared/base/enums';

// Dividend-related interfaces
export interface DividendSchedule {
  frequency: DividendFrequency;
  amount: number;
  months?: number[];
  paymentMonths?: number[];
  customAmounts?: Record<number, number>;
  dayOfMonth?: number; // Tag des Monats (1-31) an dem die Dividende ausgezahlt wird
}

// Net worth tracking
export interface NetWorthHistory {
  date: string;
  assets: number;
  liabilities: number;
  netWorth: number;
}

// Milestone tracking
export interface DebtEntry {
  name: string;
  type: LiabilityType;
  initialAmount: number;
  currentAmount: number;
  progress: number;
}

export interface DebtWithCoverage {
  name: string;
  type: string;
  monthlyPayment: number;
  coverage: number;
}
