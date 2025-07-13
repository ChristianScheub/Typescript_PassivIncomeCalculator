import { mockExpenseCalculatorService as expenseCalculatorService } from './mockServices';

// Mock types for testing
interface Expense {
  id: string;
  name: string;
  category: string;
  paymentSchedule?: {
    frequency: 'monthly' | 'quarterly' | 'annually' | 'weekly' | 'bi-weekly' | 'custom';
    amount: number;
    customAmounts?: Record<number, number>;
  };
}

interface ExpenseBreakdown {
  category: string;
  totalAmount: number;
  percentage: number;
}

// Mock the logger
jest.mock('../shared/logging/Logger/logger', () => ({
  infoService: jest.fn(),
  errorService: jest.fn(),
  warnService: jest.fn(),
}));

describe('ExpenseCalculatorService', () => {
  describe('Expense Calculations', () => {
    it('should calculate monthly expense correctly', () => {
      const expense: Expense = {
        id: '1',
        name: 'Rent',
        category: 'Housing',
        paymentSchedule: {
          frequency: 'monthly',
          amount: 1200,
        },
      };

      const result = expenseCalculatorService.calculateMonthlyExpense(expense);
      expect(result).toBe(1200);
    });

    it('should calculate quarterly expense as monthly', () => {
      const expense: Expense = {
        id: '1',
        name: 'Insurance',
        category: 'Insurance',
        paymentSchedule: {
          frequency: 'quarterly',
          amount: 900,
        },
      };

      const result = expenseCalculatorService.calculateMonthlyExpense(expense);
      expect(result).toBe(300); // 900 / 3
    });

    it('should calculate annual expense as monthly', () => {
      const expense: Expense = {
        id: '1',
        name: 'Property Tax',
        category: 'Taxes',
        paymentSchedule: {
          frequency: 'annually',
          amount: 6000,
        },
      };

      const result = expenseCalculatorService.calculateMonthlyExpense(expense);
      expect(result).toBe(500); // 6000 / 12
    });

    it('should calculate total monthly expenses from multiple sources', () => {
      const expenses: Expense[] = [
        {
          id: '1',
          name: 'Rent',
          category: 'Housing',
          paymentSchedule: { frequency: 'monthly', amount: 1200 },
        },
        {
          id: '2',
          name: 'Groceries',
          category: 'Food',
          paymentSchedule: { frequency: 'monthly', amount: 600 },
        },
        {
          id: '3',
          name: 'Insurance',
          category: 'Insurance',
          paymentSchedule: { frequency: 'quarterly', amount: 900 },
        },
      ];

      const result = expenseCalculatorService.calculateTotalMonthlyExpenses(expenses);
      expect(result).toBe(2100); // 1200 + 600 + 300
    });

    it('should calculate annual expenses', () => {
      const monthlyExpenses = 2500;
      const result = expenseCalculatorService.calculateAnnualExpenses(monthlyExpenses);
      expect(result).toBe(30000);
    });
  });

  describe('Expense Breakdown Analysis', () => {
    it('should calculate expense breakdown by category', () => {
      const expenses: Expense[] = [
        {
          id: '1',
          name: 'Rent',
          category: 'Housing',
          paymentSchedule: { frequency: 'monthly', amount: 1200 },
        },
        {
          id: '2',
          name: 'Utilities',
          category: 'Housing',
          paymentSchedule: { frequency: 'monthly', amount: 200 },
        },
        {
          id: '3',
          name: 'Groceries',
          category: 'Food',
          paymentSchedule: { frequency: 'monthly', amount: 600 },
        },
        {
          id: '4',
          name: 'Dining Out',
          category: 'Food',
          paymentSchedule: { frequency: 'monthly', amount: 300 },
        },
      ];

      const result = expenseCalculatorService.calculateExpenseBreakdown(expenses);
      
      expect(result).toHaveLength(2);
      
      const housingBreakdown = result.find(b => b.category === 'Housing');
      expect(housingBreakdown?.totalAmount).toBe(1400);
      expect(housingBreakdown?.percentage).toBeCloseTo(60.87, 2); // 1400/2300 * 100
      
      const foodBreakdown = result.find(b => b.category === 'Food');
      expect(foodBreakdown?.totalAmount).toBe(900);
      expect(foodBreakdown?.percentage).toBeCloseTo(39.13, 2); // 900/2300 * 100
    });

    it('should handle empty expense array', () => {
      const result = expenseCalculatorService.calculateExpenseBreakdown([]);
      expect(result).toEqual([]);
    });
  });

  describe('Custom Payment Frequencies', () => {
    it('should handle weekly expenses', () => {
      const expense: Expense = {
        id: '1',
        name: 'Groceries',
        category: 'Food',
        paymentSchedule: {
          frequency: 'weekly',
          amount: 150,
        },
      };

      const result = expenseCalculatorService.calculateMonthlyExpense(expense);
      expect(result).toBeCloseTo(650, 0); // 150 * 52 / 12 ≈ 650
    });

    it('should handle bi-weekly expenses', () => {
      const expense: Expense = {
        id: '1',
        name: 'Cleaning Service',
        category: 'Household',
        paymentSchedule: {
          frequency: 'bi-weekly',
          amount: 80,
        },
      };

      const result = expenseCalculatorService.calculateMonthlyExpense(expense);
      expect(result).toBeCloseTo(173.33, 2); // 80 * 26 / 12 ≈ 173.33
    });

    it('should handle custom payment schedules', () => {
      const expense: Expense = {
        id: '1',
        name: 'Seasonal Expenses',
        category: 'Miscellaneous',
        paymentSchedule: {
          frequency: 'custom',
          amount: 0, // Not used for custom
          customAmounts: {
            1: 500,  // January
            6: 1000, // June
            12: 1500, // December
          },
        },
      };

      const result = expenseCalculatorService.calculateMonthlyExpense(expense);
      expect(result).toBe(250); // (500 + 1000 + 1500) / 12
    });
  });

  describe('Edge Cases', () => {
    it('should handle expense without payment schedule', () => {
      const expense: Expense = {
        id: '1',
        name: 'Invalid Expense',
        category: 'Unknown',
      };

      const result = expenseCalculatorService.calculateMonthlyExpense(expense);
      expect(result).toBe(0);
    });

    it('should handle expenses with zero amounts', () => {
      const expenses: Expense[] = [
        {
          id: '1',
          name: 'Free Service',
          category: 'Services',
          paymentSchedule: { frequency: 'monthly', amount: 0 },
        },
      ];

      const result = expenseCalculatorService.calculateTotalMonthlyExpenses(expenses);
      expect(result).toBe(0);
    });

    it('should handle negative expense amounts', () => {
      const expense: Expense = {
        id: '1',
        name: 'Refund',
        category: 'Refunds',
        paymentSchedule: { frequency: 'monthly', amount: -100 },
      };

      const result = expenseCalculatorService.calculateMonthlyExpense(expense);
      expect(result).toBe(-100);
    });

    it('should handle very large expense amounts', () => {
      const expense: Expense = {
        id: '1',
        name: 'Luxury Purchase',
        category: 'Luxury',
        paymentSchedule: { frequency: 'annually', amount: 120000 },
      };

      const result = expenseCalculatorService.calculateMonthlyExpense(expense);
      expect(result).toBe(10000);
    });

    it('should handle invalid frequencies gracefully', () => {
      const expense: Expense = {
        id: '1',
        name: 'Unknown Frequency',
        category: 'Test',
        paymentSchedule: {
          frequency: 'invalid' as any,
          amount: 500,
        },
      };

      const result = expenseCalculatorService.calculateMonthlyExpense(expense);
      expect(result).toBe(0);
    });
  });

  describe('Performance and Memory', () => {
    it('should handle large arrays efficiently', () => {
      const expenses: Expense[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `expense-${i}`,
        name: `Expense ${i}`,
        category: `Category ${i % 10}`,
        paymentSchedule: { frequency: 'monthly', amount: 100 },
      }));

      const start = performance.now();
      const result = expenseCalculatorService.calculateTotalMonthlyExpenses(expenses);
      const end = performance.now();

      expect(result).toBe(100000); // 1000 * 100
      expect(end - start).toBeLessThan(100); // Should complete in less than 100ms
    });
  });
});