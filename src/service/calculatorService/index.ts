import { ICalculatorService } from './interfaces/ICalculatorService';
import { 
  calculateAssetMonthlyIncome, 
  calculateAssetIncomeForMonth, 
  calculateTotalAssetIncomeForMonth,
  calculateTotalMonthlyAssetIncomeFromCache,
  calculateTotalAssetIncomeForMonthFromCache,
  // ❌ REMOVED: calculateTotalMonthlyAssetIncomeWithCache - use portfolio cache instead
  calculateTotalAssetIncomeForMonthWithCache,
  areAssetsCached,
  calculateAssetMonthlyIncomeWithCache
} from './methods/asset/calculateAssetIncome';
import { 
  calculateMonthlyIncome, 
  calculateTotalMonthlyIncome, 
  calculatePassiveIncome, 
  calculateAnnualIncome 
} from './methods/income/calculateIncome';
import { calculatePaymentSchedule, calculateDividendSchedule, calculateDividendForMonth } from './methods/income/calculatePayment';
import { 
  calculateTotalDebt,
  calculateTotalMonthlyLiabilityPayments,
  calculateLiabilityMonthlyPayment 
} from './methods/liability/calculateLiabilities';
import {
  calculateMonthlyExpense,
  calculateTotalMonthlyExpenses,
  calculateAnnualExpenses
} from './methods/expense/calculateExpenses';
import { calculateNetWorth } from './methods/common/calculateNetWorth';
import { calculateMonthlyCashFlow } from './methods/common/calculateCashFlow';
import { calculateAssetAllocation, calculateIncomeAllocation } from './methods/asset/calculateAllocations';
import { calculateExpenseBreakdown } from './methods/expense/calculateExpenseBreakdown';
import { calculateProjections, calculateProjectionsWithCache } from './methods/analytics/calculateProjections';
import { calculatePortfolioAnalytics, calculateIncomeAnalytics } from './methods/analytics/calculatePortfolioAnalytics';

/**
 * Calculator Service that provides all financial calculations
 * Implementing the functional object pattern for consistency with other services
 */
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
  // ✅ CACHE-FIRST: Optimized total monthly income calculation
  calculateTotalMonthlyAssetIncome: (assets) => {
    // Priority 1: Try pure cache approach (fastest - O(1))
    const cachedTotal = calculateTotalMonthlyAssetIncomeFromCache(assets);
    if (cachedTotal !== null) {
      return cachedTotal;
    }
    // Priority 2: Individual calculations with cache (slower but reliable - O(n))
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

  // ✅ CACHE-FIRST: Cached asset calculations
  calculateAssetMonthlyIncomeWithCache,
  // ❌ REMOVED: calculateTotalMonthlyAssetIncomeWithCache - use portfolio cache instead
  calculateTotalAssetIncomeForMonthWithCache,

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
  // ❌ REMOVED: calculatePortfolioAssetAllocation - use direct cache access instead
  calculateIncomeAllocation,
  calculateExpenseBreakdown,
  calculateProjections,
  calculateProjectionsWithCache,
  calculatePortfolioAnalytics,
  calculateIncomeAnalytics,

  // Cache status helpers
  areAssetsCached: (assets) => areAssetsCached(assets),
};

// Export the service interface
export type { ICalculatorService };

// Export the service
export { calculatorService };

// Export default instance for direct use
export default calculatorService;
