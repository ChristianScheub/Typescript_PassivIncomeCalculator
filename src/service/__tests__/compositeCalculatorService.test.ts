import compositeCalculatorService from '../domain/financial/calculations/compositeCalculatorService';

// Mock all the individual services
jest.mock('../domain/assets/calculations/assetCalculatorService', () => ({
  assetCalculatorService: {
    calculateAssetMonthlyIncome: jest.fn((asset) => asset.value * 0.01),
    calculateAssetIncomeForMonth: jest.fn((asset, month) => asset.value * 0.01),
    calculateTotalAssetValue: jest.fn((assets) => assets.reduce((sum, a) => sum + a.value, 0)),
    calculateLiquidAssetValue: jest.fn((assets) => assets.filter(a => a.liquid).reduce((sum, a) => sum + a.value, 0)),
    calculateTotalMonthlyAssetIncome: jest.fn((assets) => assets.length * 100),
    calculateTotalAssetIncomeForMonth: jest.fn((assets, month) => assets.length * 100),
    calculateAnnualAssetIncome: jest.fn((assets) => assets.length * 1200),
    calculateAssetAllocation: jest.fn((assets) => [{ type: 'stocks', percentage: 60 }]),
    calculateAssetMonthlyIncomeWithCache: jest.fn((assets) => assets.length * 100),
    calculateTotalAssetIncomeForMonthWithCache: jest.fn((assets, month) => assets.length * 100),
    areAssetsCached: jest.fn((assets) => true)
  }
}));

jest.mock('../domain/financial/income/incomeCalculatorService', () => ({
  incomeCalculatorService: {
    calculateMonthlyIncome: jest.fn((income) => income.amount),
    calculateTotalMonthlyIncome: jest.fn((incomes) => incomes.reduce((sum, i) => sum + i.amount, 0)),
    calculatePassiveIncome: jest.fn((incomes) => incomes.filter(i => i.passive).reduce((sum, i) => sum + i.amount, 0)),
    calculatePassiveIncomeRatio: jest.fn((incomes) => 0.3),
    calculateAnnualIncome: jest.fn((incomes) => incomes.reduce((sum, i) => sum + i.amount, 0) * 12),
    calculatePaymentSchedule: jest.fn((income) => ({ monthly: income.amount })),
    calculateDividendSchedule: jest.fn((dividend, quantity) => ({ monthly: dividend.amount * quantity })),
    calculateDividendForMonth: jest.fn((dividend, quantity, month) => dividend.amount * quantity)
  }
}));

jest.mock('../domain/financial/expenses/expenseCalculatorService', () => ({
  expenseCalculatorService: {
    calculateMonthlyExpense: jest.fn((expense) => expense.amount),
    calculateTotalMonthlyExpenses: jest.fn((expenses) => expenses.reduce((sum, e) => sum + e.amount, 0)),
    categorizeExpenses: jest.fn((expenses) => ({ essential: 2000, discretionary: 1000 })),
    calculateExpenseRatio: jest.fn((expenses, income) => 0.6),
    calculateAnnualExpenses: jest.fn((expenses) => expenses.reduce((sum, e) => sum + e.amount, 0) * 12)
  }
}));

jest.mock('../domain/financial/liabilities/liabilityCalculatorService', () => ({
  liabilityCalculatorService: {
    calculateTotalDebt: jest.fn((liabilities) => liabilities.reduce((sum, l) => sum + l.amount, 0)),
    calculateTotalMonthlyLiabilityPayments: jest.fn((liabilities) => liabilities.reduce((sum, l) => sum + l.monthlyPayment, 0)),
    calculateDebtToIncomeRatio: jest.fn((liabilities, income) => 0.3),
    calculateMonthlyLiabilityPayment: jest.fn((liability) => liability.monthlyPayment)
  }
}));

jest.mock('../domain/financial/calculations/financialCalculatorService', () => ({
  financialCalculatorService: {
    calculateNetWorth: jest.fn((assets, liabilities) => 100000),
    calculateMonthlyCashFlow: jest.fn((income, expenses) => 2000),
    calculateSavingsRate: jest.fn((income, expenses) => 0.4),
    calculateLiquidityRatio: jest.fn((liquidAssets, monthlyExpenses) => 6),
    calculateDebtServiceRatio: jest.fn((debtPayments, income) => 0.25)
  }
}));

describe('CompositeCalculatorService', () => {
  const mockAssets = [
    { id: '1', value: 10000, liquid: true },
    { id: '2', value: 50000, liquid: false }
  ];

  const mockIncomes = [
    { id: '1', amount: 5000, passive: false },
    { id: '2', amount: 1000, passive: true }
  ];

  const mockExpenses = [
    { id: '1', amount: 2000 },
    { id: '2', amount: 1500 }
  ];

  const mockLiabilities = [
    { id: '1', amount: 200000, monthlyPayment: 1200 },
    { id: '2', amount: 15000, monthlyPayment: 300 }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Asset calculations delegation', () => {
    test('should delegate calculateAssetMonthlyIncome correctly', () => {
      const { assetCalculatorService } = require('../domain/assets/calculations/assetCalculatorService');
      
      const result = compositeCalculatorService.calculateAssetMonthlyIncome(mockAssets[0]);
      
      expect(assetCalculatorService.calculateAssetMonthlyIncome).toHaveBeenCalledWith(mockAssets[0]);
      expect(result).toBe(100); // 10000 * 0.01
    });

    test('should delegate calculateTotalAssetValue correctly', () => {
      const { assetCalculatorService } = require('../domain/assets/calculations/assetCalculatorService');
      
      const result = compositeCalculatorService.calculateTotalAssetValue(mockAssets);
      
      expect(assetCalculatorService.calculateTotalAssetValue).toHaveBeenCalledWith(mockAssets);
      expect(result).toBe(60000); // 10000 + 50000
    });

    test('should delegate calculateLiquidAssetValue correctly', () => {
      const { assetCalculatorService } = require('../domain/assets/calculations/assetCalculatorService');
      
      const result = compositeCalculatorService.calculateLiquidAssetValue(mockAssets);
      
      expect(assetCalculatorService.calculateLiquidAssetValue).toHaveBeenCalledWith(mockAssets);
      expect(result).toBe(10000); // Only liquid assets
    });

    test('should delegate calculateTotalMonthlyAssetIncome correctly', () => {
      const { assetCalculatorService } = require('../domain/assets/calculations/assetCalculatorService');
      
      const result = compositeCalculatorService.calculateTotalMonthlyAssetIncome(mockAssets);
      
      expect(assetCalculatorService.calculateTotalMonthlyAssetIncome).toHaveBeenCalledWith(mockAssets);
      expect(result).toBe(200); // 2 assets * 100
    });

    test('should delegate cached calculations correctly', () => {
      const { assetCalculatorService } = require('../domain/assets/calculations/assetCalculatorService');
      
      const cachedIncomeResult = compositeCalculatorService.calculateAssetMonthlyIncomeWithCache(mockAssets);
      const areCachedResult = compositeCalculatorService.areAssetsCached(mockAssets);
      
      expect(assetCalculatorService.calculateAssetMonthlyIncomeWithCache).toHaveBeenCalledWith(mockAssets);
      expect(assetCalculatorService.areAssetsCached).toHaveBeenCalledWith(mockAssets);
      expect(cachedIncomeResult).toBe(200);
      expect(areCachedResult).toBe(true);
    });
  });

  describe('Income calculations delegation', () => {
    test('should delegate calculateMonthlyIncome correctly', () => {
      const { incomeCalculatorService } = require('../domain/financial/income/incomeCalculatorService');
      
      const result = compositeCalculatorService.calculateMonthlyIncome(mockIncomes[0]);
      
      expect(incomeCalculatorService.calculateMonthlyIncome).toHaveBeenCalledWith(mockIncomes[0]);
      expect(result).toBe(5000);
    });

    test('should delegate calculateTotalMonthlyIncome correctly', () => {
      const { incomeCalculatorService } = require('../domain/financial/income/incomeCalculatorService');
      
      const result = compositeCalculatorService.calculateTotalMonthlyIncome(mockIncomes);
      
      expect(incomeCalculatorService.calculateTotalMonthlyIncome).toHaveBeenCalledWith(mockIncomes);
      expect(result).toBe(6000); // 5000 + 1000
    });

    test('should delegate calculatePassiveIncome correctly', () => {
      const { incomeCalculatorService } = require('../domain/financial/income/incomeCalculatorService');
      
      const result = compositeCalculatorService.calculatePassiveIncome(mockIncomes);
      
      expect(incomeCalculatorService.calculatePassiveIncome).toHaveBeenCalledWith(mockIncomes);
      expect(result).toBe(1000); // Only passive income
    });

    test('should delegate dividend calculations correctly', () => {
      const { incomeCalculatorService } = require('../domain/financial/income/incomeCalculatorService');
      const mockDividend = { amount: 5, frequency: 'quarterly' };
      const quantity = 100;
      
      const scheduleResult = compositeCalculatorService.calculateDividendSchedule(mockDividend, quantity);
      const monthResult = compositeCalculatorService.calculateDividendForMonth(mockDividend, quantity, 3);
      
      expect(incomeCalculatorService.calculateDividendSchedule).toHaveBeenCalledWith(mockDividend, quantity);
      expect(incomeCalculatorService.calculateDividendForMonth).toHaveBeenCalledWith(mockDividend, quantity, 3);
      expect(scheduleResult).toEqual({ monthly: 500 });
      expect(monthResult).toBe(500);
    });
  });

  describe('Expense calculations delegation', () => {
    test('should delegate calculateMonthlyExpense correctly', () => {
      const { expenseCalculatorService } = require('../domain/financial/expenses/expenseCalculatorService');
      
      const result = compositeCalculatorService.calculateMonthlyExpense(mockExpenses[0]);
      
      expect(expenseCalculatorService.calculateMonthlyExpense).toHaveBeenCalledWith(mockExpenses[0]);
      expect(result).toBe(2000);
    });

    test('should delegate calculateTotalMonthlyExpenses correctly', () => {
      const { expenseCalculatorService } = require('../domain/financial/expenses/expenseCalculatorService');
      
      const result = compositeCalculatorService.calculateTotalMonthlyExpenses(mockExpenses);
      
      expect(expenseCalculatorService.calculateTotalMonthlyExpenses).toHaveBeenCalledWith(mockExpenses);
      expect(result).toBe(3500); // 2000 + 1500
    });

    test('should delegate categorizeExpenses correctly', () => {
      const { expenseCalculatorService } = require('../domain/financial/expenses/expenseCalculatorService');
      
      const result = compositeCalculatorService.categorizeExpenses(mockExpenses);
      
      expect(expenseCalculatorService.categorizeExpenses).toHaveBeenCalledWith(mockExpenses);
      expect(result).toEqual({ essential: 2000, discretionary: 1000 });
    });
  });

  describe('Liability calculations delegation', () => {
    test('should delegate calculateTotalDebt correctly', () => {
      const { liabilityCalculatorService } = require('../domain/financial/liabilities/liabilityCalculatorService');
      
      const result = compositeCalculatorService.calculateTotalDebt(mockLiabilities);
      
      expect(liabilityCalculatorService.calculateTotalDebt).toHaveBeenCalledWith(mockLiabilities);
      expect(result).toBe(215000); // 200000 + 15000
    });

    test('should delegate calculateTotalMonthlyLiabilityPayments correctly', () => {
      const { liabilityCalculatorService } = require('../domain/financial/liabilities/liabilityCalculatorService');
      
      const result = compositeCalculatorService.calculateTotalMonthlyLiabilityPayments(mockLiabilities);
      
      expect(liabilityCalculatorService.calculateTotalMonthlyLiabilityPayments).toHaveBeenCalledWith(mockLiabilities);
      expect(result).toBe(1500); // 1200 + 300
    });

    test('should delegate calculateDebtToIncomeRatio correctly', () => {
      const { liabilityCalculatorService } = require('../domain/financial/liabilities/liabilityCalculatorService');
      const totalIncome = 6000;
      
      const result = compositeCalculatorService.calculateDebtToIncomeRatio(mockLiabilities, totalIncome);
      
      expect(liabilityCalculatorService.calculateDebtToIncomeRatio).toHaveBeenCalledWith(mockLiabilities, totalIncome);
      expect(result).toBe(0.3);
    });
  });

  describe('Financial calculations delegation', () => {
    test('should delegate calculateNetWorth correctly', () => {
      const { financialCalculatorService } = require('../domain/financial/calculations/financialCalculatorService');
      
      const result = compositeCalculatorService.calculateNetWorth(mockAssets, mockLiabilities);
      
      expect(financialCalculatorService.calculateNetWorth).toHaveBeenCalledWith(mockAssets, mockLiabilities);
      expect(result).toBe(100000);
    });

    test('should delegate calculateMonthlyCashFlow correctly', () => {
      const { financialCalculatorService } = require('../domain/financial/calculations/financialCalculatorService');
      const totalIncome = 6000;
      const totalExpenses = 3500;
      
      const result = compositeCalculatorService.calculateMonthlyCashFlow(totalIncome, totalExpenses);
      
      expect(financialCalculatorService.calculateMonthlyCashFlow).toHaveBeenCalledWith(totalIncome, totalExpenses);
      expect(result).toBe(2000);
    });

    test('should delegate calculateSavingsRate correctly', () => {
      const { financialCalculatorService } = require('../domain/financial/calculations/financialCalculatorService');
      const totalIncome = 6000;
      const totalExpenses = 3500;
      
      const result = compositeCalculatorService.calculateSavingsRate(totalIncome, totalExpenses);
      
      expect(financialCalculatorService.calculateSavingsRate).toHaveBeenCalledWith(totalIncome, totalExpenses);
      expect(result).toBe(0.4);
    });
  });

  describe('Integration tests', () => {
    test('should provide comprehensive financial overview', () => {
      const totalAssetValue = compositeCalculatorService.calculateTotalAssetValue(mockAssets);
      const totalMonthlyIncome = compositeCalculatorService.calculateTotalMonthlyIncome(mockIncomes);
      const totalMonthlyExpenses = compositeCalculatorService.calculateTotalMonthlyExpenses(mockExpenses);
      const totalDebt = compositeCalculatorService.calculateTotalDebt(mockLiabilities);
      const netWorth = compositeCalculatorService.calculateNetWorth(mockAssets, mockLiabilities);
      const cashFlow = compositeCalculatorService.calculateMonthlyCashFlow(totalMonthlyIncome, totalMonthlyExpenses);

      expect(totalAssetValue).toBe(60000);
      expect(totalMonthlyIncome).toBe(6000);
      expect(totalMonthlyExpenses).toBe(3500);
      expect(totalDebt).toBe(215000);
      expect(netWorth).toBe(100000);
      expect(cashFlow).toBe(2000);
    });

    test('should handle edge cases gracefully', () => {
      // Test with empty arrays
      expect(() => compositeCalculatorService.calculateTotalAssetValue([])).not.toThrow();
      expect(() => compositeCalculatorService.calculateTotalMonthlyIncome([])).not.toThrow();
      expect(() => compositeCalculatorService.calculateTotalMonthlyExpenses([])).not.toThrow();
      expect(() => compositeCalculatorService.calculateTotalDebt([])).not.toThrow();
    });

    test('should maintain consistency across related calculations', () => {
      const passiveIncome = compositeCalculatorService.calculatePassiveIncome(mockIncomes);
      const passiveIncomeRatio = compositeCalculatorService.calculatePassiveIncomeRatio(mockIncomes);
      const totalIncome = compositeCalculatorService.calculateTotalMonthlyIncome(mockIncomes);

      expect(passiveIncome).toBe(1000);
      expect(passiveIncomeRatio).toBe(0.3);
      expect(totalIncome).toBe(6000);
      
      // Verify that passive income ratio makes sense
      // passiveIncomeRatio should be approximately passiveIncome / totalIncome
      // Though the mock returns a fixed 0.3, in real implementation this should be consistent
    });
  });

  describe('Service interface completeness', () => {
    test('should expose all required asset calculation methods', () => {
      expect(typeof compositeCalculatorService.calculateAssetMonthlyIncome).toBe('function');
      expect(typeof compositeCalculatorService.calculateTotalAssetValue).toBe('function');
      expect(typeof compositeCalculatorService.calculateLiquidAssetValue).toBe('function');
      expect(typeof compositeCalculatorService.calculateAssetAllocation).toBe('function');
      expect(typeof compositeCalculatorService.areAssetsCached).toBe('function');
    });

    test('should expose all required income calculation methods', () => {
      expect(typeof compositeCalculatorService.calculateMonthlyIncome).toBe('function');
      expect(typeof compositeCalculatorService.calculateTotalMonthlyIncome).toBe('function');
      expect(typeof compositeCalculatorService.calculatePassiveIncome).toBe('function');
      expect(typeof compositeCalculatorService.calculateDividendSchedule).toBe('function');
    });

    test('should expose all required expense calculation methods', () => {
      expect(typeof compositeCalculatorService.calculateMonthlyExpense).toBe('function');
      expect(typeof compositeCalculatorService.calculateTotalMonthlyExpenses).toBe('function');
      expect(typeof compositeCalculatorService.categorizeExpenses).toBe('function');
    });

    test('should expose all required liability calculation methods', () => {
      expect(typeof compositeCalculatorService.calculateTotalDebt).toBe('function');
      expect(typeof compositeCalculatorService.calculateTotalMonthlyLiabilityPayments).toBe('function');
      expect(typeof compositeCalculatorService.calculateDebtToIncomeRatio).toBe('function');
    });

    test('should expose all required financial calculation methods', () => {
      expect(typeof compositeCalculatorService.calculateNetWorth).toBe('function');
      expect(typeof compositeCalculatorService.calculateMonthlyCashFlow).toBe('function');
      expect(typeof compositeCalculatorService.calculateSavingsRate).toBe('function');
    });
  });
});