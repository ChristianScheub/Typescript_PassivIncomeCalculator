import { Transaction as Asset } from '../../../../types/domains/assets/';
import { 
  Income, 
  Liability, 
  Expense
} from '../../../../types/domains/financial/';
import { 
  MonthlyProjection 
} from '../../../../types/domains/analytics/';
import { PortfolioPosition } from '../../../../types/domains/portfolio/position';
import { PortfolioAnalyticsData, IncomeAnalyticsData } from '../../../analytics/analytics/calculatePortfolioAnalytics';

export interface IFinancialCalculatorService {
  // Cash flow calculations
  calculateMonthlyCashFlow: (
    totalMonthlyIncome: number,
    totalMonthlyExpenses: number,
    totalMonthlyLiabilityPayments: number
  ) => number;

  // Net worth calculations
  calculateNetWorth: (totalAssetValue: number, totalDebt: number) => number;

  // Financial projections and analytics
  calculateProjections: (
    income: Income[], 
    expenses: Expense[], 
    liabilities: Liability[],
    assets?: Asset[],
    months?: number
  ) => MonthlyProjection[];
  
  calculateProjectionsWithCache: (
    baseValues: {
      totalMonthlyIncome: number;
      totalMonthlyExpenses: number;
      totalLiabilityPayments: number;
      passiveIncome: number;
    },
    monthlyAssetIncomeCache: Record<number, number>,
    months?: number
  ) => MonthlyProjection[];

  // Portfolio Analytics
  calculatePortfolioAnalytics: (positions: PortfolioPosition[]) => PortfolioAnalyticsData;
  calculateIncomeAnalytics: (positions: PortfolioPosition[]) => IncomeAnalyticsData;
}
