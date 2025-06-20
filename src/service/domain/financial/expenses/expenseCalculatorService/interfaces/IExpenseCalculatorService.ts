import { 
  Expense, 
  ExpenseBreakdown
} from '@/types/domains/financial/';

export interface IExpenseCalculatorService {
  // Expense calculations
  calculateMonthlyExpense: (expense: Expense) => number;
  calculateTotalMonthlyExpenses: (expenses: Expense[]) => number;
  calculateAnnualExpenses: (monthlyExpenses: number) => number;
  
  // Expense analysis
  calculateExpenseBreakdown: (expenses: Expense[]) => ExpenseBreakdown[];
}
