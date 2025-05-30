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
