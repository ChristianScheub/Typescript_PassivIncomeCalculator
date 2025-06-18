import { 
  Asset, 
  Income, 
  Liability, 
  Expense, 
  PaymentSchedule, 
  DividendSchedule, 
  AssetAllocation,
  IncomeAllocation,
  ExpenseBreakdown,
  MonthlyProjection 
} from '../../../types';
import { PortfolioPosition } from '../../portfolioService/portfolioCalculations';
import { PortfolioAnalyticsData, IncomeAnalyticsData } from '../methods/analytics/calculatePortfolioAnalytics';

export interface ICalculatorService {
  // Payment Schedule calculations
  calculatePaymentSchedule: (schedule: PaymentSchedule) => { monthlyAmount: number; annualAmount: number };
  calculateDividendSchedule: (schedule: DividendSchedule, quantity: number) => { monthlyAmount: number; annualAmount: number };
  calculateDividendForMonth: (schedule: DividendSchedule, quantity: number, monthNumber: number) => number;
  
  // Asset calculations
  calculateAssetMonthlyIncome: (asset: Asset) => number;
  calculateAssetIncomeForMonth: (asset: Asset, monthNumber: number) => number;
  calculateTotalAssetValue: (assets: Asset[]) => number;
  calculateLiquidAssetValue: (assets: Asset[]) => number;
  calculateTotalMonthlyAssetIncome: (assets: Asset[]) => number;
  calculateTotalAssetIncomeForMonth: (assets: Asset[], monthNumber: number) => number;
  calculateAnnualAssetIncome: (monthlyIncome: number) => number;
  
  // Cached asset calculations 
  calculateAssetMonthlyIncomeWithCache?: (asset: Asset) => { 
    monthlyAmount: number; 
    annualAmount: number; 
    monthlyBreakdown: Record<number, number>;
    cacheHit: boolean;
    cacheDataToUpdate?: {
      monthlyAmount: number;
      annualAmount: number;
      monthlyBreakdown: Record<number, number>;
    };
  };
  calculateTotalAssetIncomeForMonthWithCache?: (assets: Asset[], monthNumber: number) => number;

  // Income calculations
  calculateMonthlyIncome: (income: Income) => number;
  calculateTotalMonthlyIncome: (incomes: Income[]) => number;
  calculatePassiveIncome: (incomes: Income[], assets?: Asset[]) => number;
  calculatePassiveIncomeRatio: (monthlyIncome: number, passiveIncome: number) => number;
  calculateAnnualIncome: (monthlyIncome: number) => number;

  // Liability calculations
  calculateTotalDebt: (liabilities: Liability[]) => number;
  calculateTotalMonthlyLiabilityPayments: (liabilities: Liability[]) => number;
  calculateLiabilityMonthlyPayment: (liability: Liability) => number;

  // Expense calculations
  calculateMonthlyExpense: (expense: Expense) => number;
  calculateTotalMonthlyExpenses: (expenses: Expense[]) => number;
  calculateAnnualExpenses: (monthlyExpenses: number) => number;

  // Cash flow calculations
  calculateMonthlyCashFlow: (
    totalMonthlyIncome: number,
    totalMonthlyExpenses: number,
    totalMonthlyLiabilityPayments: number
  ) => number;

  // Net worth calculations
  calculateNetWorth: (totalAssetValue: number, totalDebt: number) => number;

  // Analysis calculations
  calculateAssetAllocation: (assets: Asset[]) => AssetAllocation[];
  calculateIncomeAllocation: (income: Income[], assets: Asset[]) => IncomeAllocation[];
  calculateExpenseBreakdown: (expenses: Expense[]) => ExpenseBreakdown[];
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

  // Cache status helpers
  areAssetsCached?: (assets: Asset[]) => boolean;
}
