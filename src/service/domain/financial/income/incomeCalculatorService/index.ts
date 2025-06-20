import { IIncomeCalculatorService } from './interfaces/IIncomeCalculatorService';
import { 
  calculateMonthlyIncome, 
  calculateTotalMonthlyIncome, 
  calculatePassiveIncome, 
  calculateAnnualIncome 
} from './methods/calculateIncome';
import { calculatePaymentSchedule, calculateDividendSchedule, calculateDividendForMonth } from './methods/calculatePayment';
import { calculateIncomeAllocation } from './methods/calculateAllocations';

/**
 * Income Calculator Service that provides all income-related calculations
 * Handles payment schedules, income streams, and passive income calculations
 */
const incomeCalculatorService: IIncomeCalculatorService = {
  // Payment Schedule calculations
  calculatePaymentSchedule,
  calculateDividendSchedule,
  calculateDividendForMonth,

  // Income calculations
  calculateMonthlyIncome,
  calculateTotalMonthlyIncome,
  calculatePassiveIncome,
  calculatePassiveIncomeRatio: (monthlyIncome, passiveIncome) => 
    monthlyIncome > 0 ? (passiveIncome / monthlyIncome) * 100 : 0,
  calculateAnnualIncome,

  // Income allocation analysis
  calculateIncomeAllocation,
};

// Export the service interface
export type { IIncomeCalculatorService };

// Export the service
export { incomeCalculatorService };

// Export default instance for direct use
export default incomeCalculatorService;
