import { assetCalculatorService } from '../../assets/calculations/assetCalculatorService';
import { incomeCalculatorService } from '../income/incomeCalculatorService';
import { expenseCalculatorService } from '../expenses/expenseCalculatorService';
import { liabilityCalculatorService } from '../liabilities/liabilityCalculatorService';
import { financialCalculatorService } from './financialCalculatorService';

/**
 * Composite Calculator Service that combines all individual calculator services
 * This provides the same interface as the original calculatorService while using
 * the new modular architecture underneath
 */
const compositeCalculatorService = {
  // Asset calculations (delegated to assetCalculatorService)
  calculateAssetMonthlyIncome: assetCalculatorService.calculateAssetMonthlyIncome,
  calculateAssetIncomeForMonth: assetCalculatorService.calculateAssetIncomeForMonth,
  calculateTotalAssetValue: assetCalculatorService.calculateTotalAssetValue,
  calculateLiquidAssetValue: assetCalculatorService.calculateLiquidAssetValue,
  calculateTotalMonthlyAssetIncome: assetCalculatorService.calculateTotalMonthlyAssetIncome,
  calculateTotalAssetIncomeForMonth: assetCalculatorService.calculateTotalAssetIncomeForMonth,
  calculateAnnualAssetIncome: assetCalculatorService.calculateAnnualAssetIncome,
  calculateAssetAllocation: assetCalculatorService.calculateAssetAllocation,
  
  // Cached asset calculations
  calculateAssetMonthlyIncomeWithCache: assetCalculatorService.calculateAssetMonthlyIncomeWithCache,
  calculateTotalAssetIncomeForMonthWithCache: assetCalculatorService.calculateTotalAssetIncomeForMonthWithCache,
  areAssetsCached: assetCalculatorService.areAssetsCached,

  // Income calculations (delegated to incomeCalculatorService)
  calculateMonthlyIncome: incomeCalculatorService.calculateMonthlyIncome,
  calculateTotalMonthlyIncome: incomeCalculatorService.calculateTotalMonthlyIncome,
  calculatePassiveIncome: incomeCalculatorService.calculatePassiveIncome,
  calculatePassiveIncomeRatio: incomeCalculatorService.calculatePassiveIncomeRatio,
  calculateAnnualIncome: incomeCalculatorService.calculateAnnualIncome,
  calculatePaymentSchedule: incomeCalculatorService.calculatePaymentSchedule,
  calculateDividendSchedule: incomeCalculatorService.calculateDividendSchedule,
  calculateDividendForMonth: incomeCalculatorService.calculateDividendForMonth,

  // Liability calculations (delegated to liabilityCalculatorService)
  calculateTotalDebt: liabilityCalculatorService.calculateTotalDebt,
  calculateTotalMonthlyLiabilityPayments: liabilityCalculatorService.calculateTotalMonthlyLiabilityPayments,
  calculateLiabilityMonthlyPayment: liabilityCalculatorService.calculateLiabilityMonthlyPayment,

  // Expense calculations (delegated to expenseCalculatorService)
  calculateMonthlyExpense: expenseCalculatorService.calculateMonthlyExpense,
  calculateTotalMonthlyExpenses: expenseCalculatorService.calculateTotalMonthlyExpenses,
  calculateAnnualExpenses: expenseCalculatorService.calculateAnnualExpenses,

  // Financial calculations (delegated to financialCalculatorService)
  calculateMonthlyCashFlow: financialCalculatorService.calculateMonthlyCashFlow,
  calculateNetWorth: financialCalculatorService.calculateNetWorth,

  // Real implementations for the functions that exist!
  calculateIncomeAllocation: incomeCalculatorService.calculateIncomeAllocation,
  calculateExpenseBreakdown: expenseCalculatorService.calculateExpenseBreakdown,
  
  // Placeholder implementations for missing functions
  calculateProjections: (income, expenses, liabilities, assets, months) => {
    // TODO: Implement in financialCalculatorService
    return [];
  },
  calculateProjectionsWithCache: (baseValues, monthlyAssetIncomeCache, months) => {
    // TODO: Implement in financialCalculatorService
    return [];
  },
  calculatePortfolioAnalytics: (positions) => {
    // TODO: Implement in financialAnalyticsService
    return {} as any;
  },
  calculateIncomeAnalytics: (positions) => {
    // TODO: Implement in financialAnalyticsService
    return {} as any;
  },
};

export default compositeCalculatorService;
