import { AssetDefinition } from '@/types/domains/assets/';
import { 
  MonthlyProjection 
} from '@/types/domains/analytics/';
import { PortfolioPosition } from '@/types/domains/portfolio/position';
import { IncomeAnalyticsData, PortfolioAnalyticsData } from '@/types/domains/analytics/calculations';

export interface IFinancialCalculatorService {
  // Cash flow calculations
  calculateMonthlyCashFlow: (
    totalMonthlyIncome: number,
    totalMonthlyExpenses: number,
    totalMonthlyLiabilityPayments: number
  ) => number;

  // Net worth calculations
  calculateNetWorth: (totalAssetValue: number, totalDebt: number) => number;
  
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
  calculatePortfolioAnalytics: (positions: PortfolioPosition[], assetDefinitions?: AssetDefinition[]) => PortfolioAnalyticsData;
  calculateIncomeAnalytics: (positions: PortfolioPosition[], assetDefinitions?: AssetDefinition[]) => IncomeAnalyticsData;
}
