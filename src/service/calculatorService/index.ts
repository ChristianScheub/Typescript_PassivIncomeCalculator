import { ICalculatorService } from './interfaces/ICalculatorService';
import { calculateAssetMonthlyIncome, calculateAssetIncomeForMonth, calculateTotalAssetIncomeForMonth } from './methods/calculateAssetIncome';
import { 
  calculateMonthlyIncome, 
  calculateTotalMonthlyIncome, 
  calculatePassiveIncome, 
  calculateAnnualIncome 
} from './methods/calculateIncome';
import { calculatePaymentSchedule, calculateDividendSchedule, calculateDividendForMonth } from './methods/calculatePayment';
import { 
  calculateTotalDebt,
  calculateTotalMonthlyLiabilityPayments 
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
import { calculateProjections } from './methods/calculateProjections';
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
  calculateTotalMonthlyAssetIncome: (assets) => 
    assets.reduce((sum, asset) => sum + calculateAssetMonthlyIncome(asset), 0),
  calculateTotalAssetIncomeForMonth,
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
    const cacheService = getDividendCacheService();
    if (cacheService) {
      return cacheService.calculateTotalMonthlyAssetIncomeWithCache(assets);
    }
    // Fallback to non-cached calculation
    return assets.reduce((sum, asset) => sum + calculateAssetMonthlyIncome(asset), 0);
  },
  
  calculateTotalAssetIncomeForMonthWithCache: (assets, monthNumber) => {
    const cacheService = getDividendCacheService();
    if (cacheService) {
      return cacheService.calculateTotalAssetIncomeForMonthWithCache(assets, monthNumber);
    }
    // Fallback to non-cached calculation
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

  // Expense calculations
  calculateMonthlyExpense: calculateMonthlyExpense,
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
};

export default calculatorService;
