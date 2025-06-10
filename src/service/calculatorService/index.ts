import { ICalculatorService } from './interfaces/ICalculatorService';
import { 
  calculateAssetMonthlyIncome, 
  calculateAssetIncomeForMonth, 
  calculateTotalAssetIncomeForMonth,
  calculateTotalMonthlyAssetIncomeFromCache,
  calculateTotalAssetIncomeForMonthFromCache,
  areAssetsCached
} from './methods/calculateAssetIncome';
import { 
  calculateMonthlyIncome, 
  calculateTotalMonthlyIncome, 
  calculatePassiveIncome, 
  calculateAnnualIncome 
} from './methods/calculateIncome';
import { calculatePaymentSchedule, calculateDividendSchedule, calculateDividendForMonth } from './methods/calculatePayment';
import { 
  calculateTotalDebt,
  calculateTotalMonthlyLiabilityPayments,
  calculateLiabilityMonthlyPayment 
} from './methods/calculateLiabilities';
import {
  calculateMonthlyExpense,
  calculateTotalMonthlyExpenses,
  calculateAnnualExpenses
} from './methods/calculateExpenses';
import { calculateNetWorth } from './methods/calculateNetWorth';
import { calculateMonthlyCashFlow } from './methods/calculateCashFlow';
import { calculateAssetAllocation, calculateIncomeAllocation } from './methods/calculateAllocations';
import { calculateExpenseBreakdown } from './methods/calculateExpenseBreakdown';
import { calculateProjections, calculateProjectionsWithCache } from './methods/calculateProjections';
import { calculatePortfolioAnalytics, calculateIncomeAnalytics } from './methods/calculatePortfolioAnalytics';
import { getDividendCacheService } from '../dividendCacheService';

const calculatorService: ICalculatorService = {
  // Payment Schedule calculations
  calculatePaymentSchedule,
  calculateDividendSchedule,
  calculateDividendForMonth,

  // Asset calculations
  calculateAssetMonthlyIncome,
  calculateAssetIncomeForMonth,
  calculateTotalAssetValue: (assets) => assets.reduce((sum, asset) => sum + asset.value, 0),
  calculateLiquidAssetValue: (assets) => assets
    .filter(asset => ['stock', 'bond', 'cash'].includes(asset.type))
    .reduce((sum, asset) => sum + asset.value, 0),
  calculateTotalMonthlyAssetIncome: (assets) => {
    // Try cache-only approach first for maximum performance
    const cachedTotal = calculateTotalMonthlyAssetIncomeFromCache(assets);
    if (cachedTotal !== null) {
      return cachedTotal;
    }
    // Fallback to individual calculations (which also use cache where available)
    return assets.reduce((sum, asset) => sum + calculateAssetMonthlyIncome(asset), 0);
  },
  calculateTotalAssetIncomeForMonth: (assets, monthNumber) => {
    // Try cache-only approach first for maximum performance
    const cachedTotal = calculateTotalAssetIncomeForMonthFromCache(assets, monthNumber);
    if (cachedTotal !== null) {
      return cachedTotal;
    }
    // Fallback to original function (which also uses cache where available)
    return calculateTotalAssetIncomeForMonth(assets, monthNumber);
  },
  calculateAnnualAssetIncome: (monthlyIncome) => monthlyIncome * 12,

  // Cached asset calculations
  calculateAssetMonthlyIncomeWithCache: (asset) => {
    const cacheService = getDividendCacheService();
    if (cacheService) {
      const result = cacheService.calculateAssetIncomeWithCache(asset);
      if (result) return result;
    }
    // Fallback to non-cached calculation
    const monthlyAmount = calculateAssetMonthlyIncome(asset);
    return {
      monthlyAmount,
      annualAmount: monthlyAmount * 12,
      monthlyBreakdown: {},
      cacheHit: false,
      cacheDataToUpdate: {
        monthlyAmount,
        annualAmount: monthlyAmount * 12,
        monthlyBreakdown: {},
      },
    };
  },
   calculateTotalMonthlyAssetIncomeWithCache: (assets) => {
    // First try pure cache approach for best performance
    const cachedTotal = calculateTotalMonthlyAssetIncomeFromCache(assets);
    if (cachedTotal !== null) {
      return cachedTotal;
    }
    
    // Fallback to cache service if available
    const cacheService = getDividendCacheService();
    if (cacheService) {
      return cacheService.calculateTotalMonthlyAssetIncomeWithCache(assets);
    }
    
    // Final fallback to non-cached calculation
    return assets.reduce((sum, asset) => sum + calculateAssetMonthlyIncome(asset), 0);
  },

  calculateTotalAssetIncomeForMonthWithCache: (assets, monthNumber) => {
    // First try pure cache approach for best performance
    const cachedTotal = calculateTotalAssetIncomeForMonthFromCache(assets, monthNumber);
    if (cachedTotal !== null) {
      return cachedTotal;
    }
    
    // Fallback to cache service if available
    const cacheService = getDividendCacheService();
    if (cacheService) {
      return cacheService.calculateTotalAssetIncomeForMonthWithCache(assets, monthNumber);
    }
    
    // Final fallback to non-cached calculation
    return calculateTotalAssetIncomeForMonth(assets, monthNumber);
  },

  // Income calculations
  calculateMonthlyIncome,
  calculateTotalMonthlyIncome,
  calculatePassiveIncome,
  calculatePassiveIncomeRatio: (monthlyIncome, passiveIncome) => 
    monthlyIncome > 0 ? (passiveIncome / monthlyIncome) * 100 : 0,
  calculateAnnualIncome,

  // Liability calculations
  calculateTotalDebt,
  calculateTotalMonthlyLiabilityPayments,
  calculateLiabilityMonthlyPayment,

  // Expense calculations
  calculateMonthlyExpense,
  calculateTotalMonthlyExpenses,
  calculateAnnualExpenses,

  // Cash flow calculations
  calculateMonthlyCashFlow,

  // Net worth calculations
  calculateNetWorth,

  // Analysis calculations
  calculateAssetAllocation,
  calculateIncomeAllocation,
  calculateExpenseBreakdown,
  calculateProjections,
  calculateProjectionsWithCache,
  calculatePortfolioAnalytics,
  calculateIncomeAnalytics,

  // Cache status helpers
  areAssetsCached: (assets) => areAssetsCached(assets),
};

export default calculatorService;
