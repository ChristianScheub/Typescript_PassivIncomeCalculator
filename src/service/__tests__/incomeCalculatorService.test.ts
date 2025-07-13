/**
 * Tests for IncomeCalculatorService
 * Tests the entire service interface for income calculations
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import incomeCalculatorService from '../domain/financial/income/incomeCalculatorService';
import type { Income, PaymentSchedule, DividendSchedule } from '@/types/domains/financial';
import type { Transaction } from '@/types/domains/assets';
import type { IncomeAllocation } from '@/types/domains/portfolio';

describe('IncomeCalculatorService', () => {
  let mockIncome: Income;
  let mockPaymentSchedule: PaymentSchedule;
  let mockDividendSchedule: DividendSchedule;

  beforeEach(() => {
    mockPaymentSchedule = {
      frequency: 'monthly' as const,
      amount: 1000,
      dayOfMonth: 15,
    };

    mockIncome = {
      id: 'test-income-1',
      title: 'Test Salary',
      type: 'salary' as const,
      paymentSchedule: mockPaymentSchedule,
      isPassive: false,
      startDate: '2024-01-01',
    };

    mockDividendSchedule = {
      frequency: 'quarterly' as const,
      amount: 2.50,
      months: [3, 6, 9, 12],
    };
  });

  describe('Payment Schedule Calculations', () => {
    test('should calculate monthly payment schedule correctly', () => {
      const result = incomeCalculatorService.calculatePaymentSchedule({
        frequency: 'monthly',
        amount: 1000,
      });

      expect(result.monthlyAmount).toBe(1000);
      expect(result.annualAmount).toBe(12000);
    });

    test('should calculate quarterly payment schedule correctly', () => {
      const result = incomeCalculatorService.calculatePaymentSchedule({
        frequency: 'quarterly',
        amount: 3000,
      });

      expect(result.monthlyAmount).toBe(1000); // 3000 * 4 / 12
      expect(result.annualAmount).toBe(12000); // 3000 * 4
    });

    test('should calculate annual payment schedule correctly', () => {
      const result = incomeCalculatorService.calculatePaymentSchedule({
        frequency: 'annually',
        amount: 12000,
      });

      expect(result.monthlyAmount).toBe(1000); // 12000 / 12
      expect(result.annualAmount).toBe(12000);
    });

    test('should calculate custom payment schedule correctly', () => {
      const result = incomeCalculatorService.calculatePaymentSchedule({
        frequency: 'custom',
        amount: 0, // Not used for custom
        customAmounts: {
          1: 1500, // January
          6: 2000, // June (bonus)
          12: 1800, // December (bonus)
        },
      });

      const expectedMonthly = (1500 + 2000 + 1800) / 12; // 5300 / 12 ≈ 441.67
      expect(result.monthlyAmount).toBeCloseTo(expectedMonthly, 2);
      expect(result.annualAmount).toBe(5300);
    });

    test('should handle empty custom amounts', () => {
      const result = incomeCalculatorService.calculatePaymentSchedule({
        frequency: 'custom',
        amount: 1000,
        customAmounts: {},
      });

      expect(result.monthlyAmount).toBe(0);
      expect(result.annualAmount).toBe(0);
    });
  });

  describe('Dividend Schedule Calculations', () => {
    test('should calculate quarterly dividend schedule correctly', () => {
      const result = incomeCalculatorService.calculateDividendSchedule(
        {
          frequency: 'quarterly',
          amount: 2.50,
          months: [3, 6, 9, 12],
        },
        100 // quantity
      );

      expect(result.monthlyAmount).toBeCloseTo(83.33, 2); // (2.50 * 4 * 100) / 12
      expect(result.annualAmount).toBe(1000); // 2.50 * 4 * 100
    });

    test('should calculate monthly dividend schedule correctly', () => {
      const result = incomeCalculatorService.calculateDividendSchedule(
        {
          frequency: 'monthly',
          amount: 0.10,
        },
        500 // quantity
      );

      expect(result.monthlyAmount).toBe(50); // 0.10 * 500
      expect(result.annualAmount).toBe(600); // 0.10 * 500 * 12
    });

    test('should calculate dividend for specific month', () => {
      const dividendForMarch = incomeCalculatorService.calculateDividendForMonth(
        {
          frequency: 'quarterly',
          amount: 2.50,
          months: [3, 6, 9, 12],
        },
        100, // quantity
        3 // March
      );

      expect(dividendForMarch).toBe(250); // 2.50 * 100

      const dividendForApril = incomeCalculatorService.calculateDividendForMonth(
        {
          frequency: 'quarterly',
          amount: 2.50,
          months: [3, 6, 9, 12],
        },
        100, // quantity
        4 // April (no dividend)
      );

      expect(dividendForApril).toBe(0);
    });
  });

  describe('Income Calculations', () => {
    test('should calculate monthly income correctly', () => {
      const result = incomeCalculatorService.calculateMonthlyIncome(mockIncome);
      expect(result).toBe(1000);
    });

    test('should calculate monthly income for quarterly income', () => {
      const quarterlyIncome = {
        ...mockIncome,
        paymentSchedule: {
          frequency: 'quarterly' as const,
          amount: 3000,
        },
      };

      const result = incomeCalculatorService.calculateMonthlyIncome(quarterlyIncome);
      expect(result).toBeCloseTo(1000, 2); // 3000 * 4 / 12
    });

    test('should calculate total monthly income from multiple sources', () => {
      const incomes = [
        mockIncome, // 1000 monthly
        {
          ...mockIncome,
          id: 'test-income-2',
          paymentSchedule: {
            frequency: 'quarterly' as const,
            amount: 1500,
          },
        }, // 500 monthly equivalent
      ];

      const result = incomeCalculatorService.calculateTotalMonthlyIncome(incomes);
      expect(result).toBeCloseTo(1500, 2); // 1000 + 500
    });

    test('should calculate passive income correctly', () => {
      const incomes = [
        mockIncome, // Active income: 1000
        {
          ...mockIncome,
          id: 'passive-1',
          isPassive: true,
          paymentSchedule: { frequency: 'monthly' as const, amount: 500 },
        },
        {
          ...mockIncome,
          id: 'passive-2',
          isPassive: true,
          paymentSchedule: { frequency: 'quarterly' as const, amount: 600 },
        },
      ];

      const mockAssets: Transaction[] = [];
      const result = incomeCalculatorService.calculatePassiveIncome(incomes, mockAssets);
      expect(result).toBeCloseTo(700, 2); // 500 + (600 * 4 / 12) = 500 + 200
    });

    test('should calculate passive income ratio correctly', () => {
      const monthlyIncome = 2000;
      const passiveIncome = 600;

      const result = incomeCalculatorService.calculatePassiveIncomeRatio(monthlyIncome, passiveIncome);
      expect(result).toBe(30); // (600 / 2000) * 100
    });

    test('should handle zero monthly income for ratio calculation', () => {
      const result = incomeCalculatorService.calculatePassiveIncomeRatio(0, 500);
      expect(result).toBe(0);
    });

    test('should calculate annual income correctly', () => {
      const result = incomeCalculatorService.calculateAnnualIncome(2500);
      expect(result).toBe(30000); // 2500 * 12
    });
  });

  describe('Income Allocation Analysis', () => {
    test('should calculate income allocation correctly', () => {
      const incomes: Income[] = [
        {
          ...mockIncome,
          title: 'Primary Salary',
          paymentSchedule: { frequency: 'monthly', amount: 3000 },
        },
        {
          ...mockIncome,
          id: 'income-2',
          title: 'Freelance',
          isPassive: false,
          paymentSchedule: { frequency: 'monthly', amount: 1000 },
        },
      ];

      const assets: Transaction[] = [
        {
          id: 'asset-1',
          type: 'income',
          amount: 500,
          title: 'Dividend Stock A',
          date: new Date('2024-01-01'),
          category: 'dividends',
        },
      ];

      const result = incomeCalculatorService.calculateIncomeAllocation(incomes, assets);
      
      expect(result).toHaveLength(3); // 2 incomes + 1 asset-based income
      
      const totalIncome = result.reduce((sum, allocation) => sum + allocation.amount, 0);
      expect(totalIncome).toBe(4500); // 3000 + 1000 + 500
      
      const primarySalary = result.find(allocation => allocation.source === 'Primary Salary');
      expect(primarySalary?.percentage).toBeCloseTo(66.67, 1); // 3000/4500 * 100
    });

    test('should handle empty income and asset arrays', () => {
      const result = incomeCalculatorService.calculateIncomeAllocation([], []);
      expect(result).toEqual([]);
    });
  });

  describe('Service Integration', () => {
    test('should have all required methods', () => {
      expect(typeof incomeCalculatorService.calculatePaymentSchedule).toBe('function');
      expect(typeof incomeCalculatorService.calculateDividendSchedule).toBe('function');
      expect(typeof incomeCalculatorService.calculateDividendForMonth).toBe('function');
      expect(typeof incomeCalculatorService.calculateMonthlyIncome).toBe('function');
      expect(typeof incomeCalculatorService.calculateTotalMonthlyIncome).toBe('function');
      expect(typeof incomeCalculatorService.calculatePassiveIncome).toBe('function');
      expect(typeof incomeCalculatorService.calculatePassiveIncomeRatio).toBe('function');
      expect(typeof incomeCalculatorService.calculateAnnualIncome).toBe('function');
      expect(typeof incomeCalculatorService.calculateIncomeAllocation).toBe('function');
    });

    test('should handle complex income scenario end-to-end', () => {
      // Create a complex scenario with multiple income types
      const incomes: Income[] = [
        {
          id: 'salary',
          title: 'Main Salary',
          type: 'salary',
          paymentSchedule: { frequency: 'monthly', amount: 5000 },
          isPassive: false,
          startDate: '2024-01-01',
        },
        {
          id: 'dividend-income',
          title: 'Dividend Income',
          type: 'interest',
          paymentSchedule: { frequency: 'quarterly', amount: 750 },
          isPassive: true,
          startDate: '2024-01-01',
        },
        {
          id: 'freelance',
          title: 'Freelance Work',
          type: 'side_hustle',
          paymentSchedule: {
            frequency: 'custom',
            amount: 0,
            customAmounts: { 1: 2000, 6: 3000, 12: 2500 },
          },
          isPassive: false,
          startDate: '2024-01-01',
        },
      ];

      // Calculate various metrics
      const totalMonthly = incomeCalculatorService.calculateTotalMonthlyIncome(incomes);
      const passiveIncome = incomeCalculatorService.calculatePassiveIncome(incomes);
      const passiveRatio = incomeCalculatorService.calculatePassiveIncomeRatio(totalMonthly, passiveIncome);
      const annualIncome = incomeCalculatorService.calculateAnnualIncome(totalMonthly);

      // Expected calculations:
      // Salary: 5000/month
      // Dividend: 750*4/12 = 250/month  
      // Freelance: (2000+3000+2500)/12 = 625/month
      // Total: 5875/month
      // Passive: 250/month
      // Passive ratio: 250/5875 * 100 ≈ 4.26%
      // Annual: 5875 * 12 = 70500

      expect(totalMonthly).toBeCloseTo(5875, 2);
      expect(passiveIncome).toBeCloseTo(250, 2);
      expect(passiveRatio).toBeCloseTo(4.26, 1);
      expect(annualIncome).toBeCloseTo(70500, 2);
    });
  });
});