import { Asset, Liability, Expense, Income } from '../../../types';

export interface FinancialSummary {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyLiabilityPayments: number;
  monthlyAssetIncome: number;
  passiveIncome: number;
  monthlyCashFlow: number;
  totalMonthlyIncome: number;
  totalPassiveIncome: number;
  totalMonthlyExpenses: number;
}

export interface FinancialRatios {
  passiveRatio: number;
  expenseCoverage: number;
  debtRatio: number;
  savingsRate: number;
}

export interface IAnalyticsService {
  calculateFinancialSummary: (
    assets: Asset[],
    liabilities: Liability[],
    expenses: Expense[],
    income: Income[]
  ) => FinancialSummary;

  calculateRatios: (summary: FinancialSummary) => FinancialRatios;
}
