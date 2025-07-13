/**
 * Tests for FinancialCalculatorUtils
 * Comprehensive tests for financial calculation functions
 */

import { describe, test, expect } from '@jest/globals';
import { 
  financialCalculatorUtils,
  SimpleIncome,
  SimpleExpense,
  SimpleAsset,
  SimpleLiability
} from '../shared/utilities/financialCalculatorUtils';

describe('FinancialCalculatorUtils', () => {
  describe('Income Calculations', () => {
    test('should calculate monthly income correctly for different frequencies', () => {
      const monthlyIncome: SimpleIncome = { amount: 5000, frequency: 'monthly', isPassive: false };
      const quarterlyIncome: SimpleIncome = { amount: 15000, frequency: 'quarterly', isPassive: false };
      const annualIncome: SimpleIncome = { amount: 60000, frequency: 'annually', isPassive: false };

      expect(financialCalculatorUtils.calculateMonthlyIncome(monthlyIncome)).toBe(5000);
      expect(financialCalculatorUtils.calculateMonthlyIncome(quarterlyIncome)).toBe(5000); // 15000 * 4 / 12
      expect(financialCalculatorUtils.calculateMonthlyIncome(annualIncome)).toBe(5000); // 60000 / 12
    });

    test('should calculate total monthly income from multiple sources', () => {
      const incomes: SimpleIncome[] = [
        { amount: 5000, frequency: 'monthly', isPassive: false },
        { amount: 6000, frequency: 'quarterly', isPassive: true },
        { amount: 12000, frequency: 'annually', isPassive: true }
      ];

      const total = financialCalculatorUtils.calculateTotalMonthlyIncome(incomes);
      // 5000 + (6000 * 4 / 12) + (12000 / 12) = 5000 + 2000 + 1000 = 8000
      expect(total).toBe(8000);
    });

    test('should calculate passive income correctly', () => {
      const incomes: SimpleIncome[] = [
        { amount: 5000, frequency: 'monthly', isPassive: false }, // Active income
        { amount: 6000, frequency: 'quarterly', isPassive: true }, // Passive
        { amount: 12000, frequency: 'annually', isPassive: true } // Passive
      ];

      const passiveIncome = financialCalculatorUtils.calculatePassiveIncome(incomes);
      // (6000 * 4 / 12) + (12000 / 12) = 2000 + 1000 = 3000
      expect(passiveIncome).toBe(3000);
    });

    test('should calculate passive income ratio correctly', () => {
      expect(financialCalculatorUtils.calculatePassiveIncomeRatio(8000, 3000)).toBe(37.5);
      expect(financialCalculatorUtils.calculatePassiveIncomeRatio(0, 1000)).toBe(0);
      expect(financialCalculatorUtils.calculatePassiveIncomeRatio(5000, 0)).toBe(0);
    });
  });

  describe('Expense Calculations', () => {
    test('should calculate monthly expense correctly for different frequencies', () => {
      const monthlyExpense: SimpleExpense = { amount: 2000, frequency: 'monthly', category: 'housing' };
      const quarterlyExpense: SimpleExpense = { amount: 1200, frequency: 'quarterly', category: 'insurance' };
      const annualExpense: SimpleExpense = { amount: 6000, frequency: 'annually', category: 'vacation' };

      expect(financialCalculatorUtils.calculateMonthlyExpense(monthlyExpense)).toBe(2000);
      expect(financialCalculatorUtils.calculateMonthlyExpense(quarterlyExpense)).toBe(400); // 1200 * 4 / 12
      expect(financialCalculatorUtils.calculateMonthlyExpense(annualExpense)).toBe(500); // 6000 / 12
    });

    test('should calculate total monthly expenses', () => {
      const expenses: SimpleExpense[] = [
        { amount: 2000, frequency: 'monthly', category: 'housing' },
        { amount: 1200, frequency: 'quarterly', category: 'insurance' },
        { amount: 6000, frequency: 'annually', category: 'vacation' }
      ];

      const total = financialCalculatorUtils.calculateTotalMonthlyExpenses(expenses);
      // 2000 + 400 + 500 = 2900
      expect(total).toBe(2900);
    });

    test('should categorize expenses correctly', () => {
      const expenses: SimpleExpense[] = [
        { amount: 2000, frequency: 'monthly', category: 'housing' },
        { amount: 500, frequency: 'monthly', category: 'housing' }, // Same category
        { amount: 1200, frequency: 'quarterly', category: 'insurance' },
        { amount: 6000, frequency: 'annually', category: 'vacation' }
      ];

      const categorized = financialCalculatorUtils.categorizeExpenses(expenses);
      
      expect(categorized.housing).toBe(2500); // 2000 + 500
      expect(categorized.insurance).toBe(400); // 1200 * 4 / 12
      expect(categorized.vacation).toBe(500); // 6000 / 12
      expect(Object.keys(categorized)).toHaveLength(3);
    });
  });

  describe('Asset Calculations', () => {
    test('should calculate asset value correctly', () => {
      const directAsset: SimpleAsset = { value: 10000 };
      const stockAsset: SimpleAsset = { value: 0, shares: 100, price: 150 };

      expect(financialCalculatorUtils.calculateAssetValue(directAsset)).toBe(10000);
      expect(financialCalculatorUtils.calculateAssetValue(stockAsset)).toBe(15000); // 100 * 150
    });

    test('should prioritize shares calculation over direct value', () => {
      const mixedAsset: SimpleAsset = { value: 5000, shares: 100, price: 150 };
      expect(financialCalculatorUtils.calculateAssetValue(mixedAsset)).toBe(15000); // Uses shares * price
    });

    test('should calculate total asset value', () => {
      const assets: SimpleAsset[] = [
        { value: 10000 },
        { value: 0, shares: 100, price: 150 },
        { value: 5000, shares: 50, price: 100 }
      ];

      const total = financialCalculatorUtils.calculateTotalAssetValue(assets);
      // 10000 + 15000 + 5000 = 30000
      expect(total).toBe(30000);
    });
  });

  describe('Liability Calculations', () => {
    test('should calculate total liabilities', () => {
      const liabilities: SimpleLiability[] = [
        { amount: 200000, interestRate: 4.5, monthlyPayment: 1200 },
        { amount: 25000, interestRate: 6.0, monthlyPayment: 500 },
        { amount: 10000, interestRate: 18.0, monthlyPayment: 300 }
      ];

      const total = financialCalculatorUtils.calculateTotalLiabilities(liabilities);
      expect(total).toBe(235000); // 200000 + 25000 + 10000
    });

    test('should calculate monthly debt payments', () => {
      const liabilities: SimpleLiability[] = [
        { amount: 200000, interestRate: 4.5, monthlyPayment: 1200 },
        { amount: 25000, interestRate: 6.0, monthlyPayment: 500 },
        { amount: 10000, interestRate: 18.0, monthlyPayment: 300 }
      ];

      const monthlyPayments = financialCalculatorUtils.calculateMonthlyDebtPayments(liabilities);
      expect(monthlyPayments).toBe(2000); // 1200 + 500 + 300
    });

    test('should calculate debt to income ratio', () => {
      const totalDebt = 200000;
      const monthlyIncome = 8000;

      const ratio = financialCalculatorUtils.calculateDebtToIncomeRatio(totalDebt, monthlyIncome);
      // (200000 / (8000 * 12)) * 100 = (200000 / 96000) * 100 ≈ 208.33
      expect(ratio).toBeCloseTo(208.33, 2);

      // Test zero income
      expect(financialCalculatorUtils.calculateDebtToIncomeRatio(100000, 0)).toBe(0);
    });
  });

  describe('Net Worth and Cash Flow Calculations', () => {
    test('should calculate net worth correctly', () => {
      expect(financialCalculatorUtils.calculateNetWorth(500000, 235000)).toBe(265000);
      expect(financialCalculatorUtils.calculateNetWorth(100000, 150000)).toBe(-50000); // Negative net worth
      expect(financialCalculatorUtils.calculateNetWorth(0, 0)).toBe(0);
    });

    test('should calculate monthly cash flow correctly', () => {
      expect(financialCalculatorUtils.calculateMonthlyCashFlow(8000, 5000, 2000)).toBe(1000);
      expect(financialCalculatorUtils.calculateMonthlyCashFlow(5000, 4000, 2000)).toBe(-1000); // Negative cash flow
      expect(financialCalculatorUtils.calculateMonthlyCashFlow(6000, 3000, 3000)).toBe(0);
    });
  });

  describe('Financial Ratios', () => {
    test('should calculate expense ratio correctly', () => {
      expect(financialCalculatorUtils.calculateExpenseRatio(4000, 8000)).toBe(50);
      expect(financialCalculatorUtils.calculateExpenseRatio(6000, 5000)).toBe(120); // Over 100%
      expect(financialCalculatorUtils.calculateExpenseRatio(2000, 0)).toBe(0); // Zero income
    });

    test('should calculate savings rate correctly', () => {
      expect(financialCalculatorUtils.calculateSavingsRate(2000, 8000)).toBe(25);
      expect(financialCalculatorUtils.calculateSavingsRate(1000, 5000)).toBe(20);
      expect(financialCalculatorUtils.calculateSavingsRate(0, 5000)).toBe(0);
      expect(financialCalculatorUtils.calculateSavingsRate(1000, 0)).toBe(0); // Zero income
    });
  });

  describe('Integration Tests', () => {
    test('should calculate comprehensive financial overview', () => {
      // Mock financial data
      const incomes: SimpleIncome[] = [
        { amount: 8000, frequency: 'monthly', isPassive: false },
        { amount: 6000, frequency: 'quarterly', isPassive: true },
        { amount: 12000, frequency: 'annually', isPassive: true }
      ];

      const expenses: SimpleExpense[] = [
        { amount: 2500, frequency: 'monthly', category: 'housing' },
        { amount: 800, frequency: 'monthly', category: 'food' },
        { amount: 1200, frequency: 'quarterly', category: 'insurance' },
        { amount: 6000, frequency: 'annually', category: 'vacation' }
      ];

      const assets: SimpleAsset[] = [
        { value: 100000 }, // Savings
        { value: 0, shares: 1000, price: 150 }, // Stocks
        { value: 300000 } // Real estate
      ];

      const liabilities: SimpleLiability[] = [
        { amount: 250000, interestRate: 4.5, monthlyPayment: 1500 },
        { amount: 20000, interestRate: 6.0, monthlyPayment: 400 }
      ];

      // Calculations
      const totalMonthlyIncome = financialCalculatorUtils.calculateTotalMonthlyIncome(incomes);
      const passiveIncome = financialCalculatorUtils.calculatePassiveIncome(incomes);
      const totalMonthlyExpenses = financialCalculatorUtils.calculateTotalMonthlyExpenses(expenses);
      const totalAssets = financialCalculatorUtils.calculateTotalAssetValue(assets);
      const totalLiabilities = financialCalculatorUtils.calculateTotalLiabilities(liabilities);
      const monthlyDebtPayments = financialCalculatorUtils.calculateMonthlyDebtPayments(liabilities);
      
      const netWorth = financialCalculatorUtils.calculateNetWorth(totalAssets, totalLiabilities);
      const monthlyCashFlow = financialCalculatorUtils.calculateMonthlyCashFlow(totalMonthlyIncome, totalMonthlyExpenses, monthlyDebtPayments);
      const passiveIncomeRatio = financialCalculatorUtils.calculatePassiveIncomeRatio(totalMonthlyIncome, passiveIncome);
      const expenseRatio = financialCalculatorUtils.calculateExpenseRatio(totalMonthlyExpenses, totalMonthlyIncome);

      // Assertions
      expect(totalMonthlyIncome).toBe(11000); // 8000 + 2000 + 1000
      expect(passiveIncome).toBe(3000); // 2000 + 1000
      expect(totalMonthlyExpenses).toBe(4200); // 2500 + 800 + 400 + 500
      expect(totalAssets).toBe(550000); // 100000 + 150000 + 300000
      expect(totalLiabilities).toBe(270000); // 250000 + 20000
      expect(monthlyDebtPayments).toBe(1900); // 1500 + 400
      
      expect(netWorth).toBe(280000); // 550000 - 270000
      expect(monthlyCashFlow).toBe(4900); // 11000 - 4200 - 1900
      expect(passiveIncomeRatio).toBeCloseTo(27.27, 2); // (3000 / 11000) * 100
      expect(expenseRatio).toBeCloseTo(38.18, 2); // (4200 / 11000) * 100
    });
  });
});