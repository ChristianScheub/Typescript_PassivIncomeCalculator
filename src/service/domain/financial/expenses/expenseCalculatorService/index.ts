import { IExpenseCalculatorService } from './interfaces/IExpenseCalculatorService';
import {
  calculateMonthlyExpense,
  calculateTotalMonthlyExpenses,
  calculateAnnualExpenses
} from './methods/calculateExpenses';
import { calculateExpenseBreakdown } from './methods/calculateExpenseBreakdown';

/**
 * Expense Calculator Service that provides all expense-related calculations
 * Handles expense calculations, categorization, and analysis
 */
const expenseCalculatorService: IExpenseCalculatorService = {
  // Expense calculations
  calculateMonthlyExpense,
  calculateTotalMonthlyExpenses,
  calculateAnnualExpenses,

  // Expense analysis
  calculateExpenseBreakdown,
};

// Export the service interface
export type { IExpenseCalculatorService };

// Export the service
export { expenseCalculatorService };

// Export default instance for direct use
export default expenseCalculatorService;
