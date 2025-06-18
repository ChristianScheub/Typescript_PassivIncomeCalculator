/**
 * Analytics domain - Projections
 */

import { Income, Expense, Liability } from '../financial';

export interface MonthlyProjection {
  month: number;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  totalLiabilities: number;
  netCashFlow: number;
  cumulativeCashFlow: number;
  assetIncomeBreakdown: {
    dividends: number;
    bonds: number;
    realEstate: number;
    crypto: number;
    commodities: number;
    other: number;
  };
  expenseBreakdown: {
    [key: string]: number;
  };
  liabilityBreakdown: {
    [key: string]: number;
  };
  date: string; // ISO date string for the first day of the month
}

export interface ProjectionConfig {
  startMonth: number;
  startYear: number;
  projectionMonths: number;
  includeGrowth: boolean;
  incomeGrowthRate?: number;
  expenseGrowthRate?: number;
  liabilityGrowthRate?: number;
}

export interface ProjectionInput {
  income: Income[];
  expenses: Expense[];
  liabilities: Liability[];
  config: ProjectionConfig;
}

export interface ProjectionSummary {
  totalProjectedIncome: number;
  totalProjectedExpenses: number;
  totalProjectedLiabilities: number;
  averageMonthlyNetCashFlow: number;
  bestMonth: MonthlyProjection;
  worstMonth: MonthlyProjection;
  breakEvenMonth?: MonthlyProjection;
  endingCumulativeCashFlow: number;
}
