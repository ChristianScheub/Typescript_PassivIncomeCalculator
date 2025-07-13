/**
 * Simple financial calculation utilities for testing
 */

export interface SimpleIncome {
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'annually';
  isPassive: boolean;
}

export interface SimpleExpense {
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'annually';
  category: string;
}

export interface SimpleAsset {
  value: number;
  shares?: number;
  price?: number;
}

export interface SimpleLiability {
  amount: number;
  interestRate: number;
  monthlyPayment: number;
}

export const financialCalculatorUtils = {
  // Income calculations
  calculateMonthlyIncome: (income: SimpleIncome): number => {
    switch (income.frequency) {
      case 'monthly':
        return income.amount;
      case 'quarterly':
        return (income.amount * 4) / 12;
      case 'annually':
        return income.amount / 12;
      default:
        return 0;
    }
  },

  calculateTotalMonthlyIncome: (incomes: SimpleIncome[]): number => {
    return incomes.reduce((total, income) => {
      return total + financialCalculatorUtils.calculateMonthlyIncome(income);
    }, 0);
  },

  calculatePassiveIncome: (incomes: SimpleIncome[]): number => {
    return incomes
      .filter(income => income.isPassive)
      .reduce((total, income) => {
        return total + financialCalculatorUtils.calculateMonthlyIncome(income);
      }, 0);
  },

  calculatePassiveIncomeRatio: (totalIncome: number, passiveIncome: number): number => {
    if (totalIncome === 0) return 0;
    return (passiveIncome / totalIncome) * 100;
  },

  // Expense calculations
  calculateMonthlyExpense: (expense: SimpleExpense): number => {
    switch (expense.frequency) {
      case 'monthly':
        return expense.amount;
      case 'quarterly':
        return (expense.amount * 4) / 12;
      case 'annually':
        return expense.amount / 12;
      default:
        return 0;
    }
  },

  calculateTotalMonthlyExpenses: (expenses: SimpleExpense[]): number => {
    return expenses.reduce((total, expense) => {
      return total + financialCalculatorUtils.calculateMonthlyExpense(expense);
    }, 0);
  },

  categorizeExpenses: (expenses: SimpleExpense[]): Record<string, number> => {
    const categorized: Record<string, number> = {};
    
    expenses.forEach(expense => {
      const monthlyAmount = financialCalculatorUtils.calculateMonthlyExpense(expense);
      if (categorized[expense.category]) {
        categorized[expense.category] += monthlyAmount;
      } else {
        categorized[expense.category] = monthlyAmount;
      }
    });

    return categorized;
  },

  // Asset calculations
  calculateAssetValue: (asset: SimpleAsset): number => {
    if (asset.shares && asset.price) {
      return asset.shares * asset.price;
    }
    return asset.value;
  },

  calculateTotalAssetValue: (assets: SimpleAsset[]): number => {
    return assets.reduce((total, asset) => {
      return total + financialCalculatorUtils.calculateAssetValue(asset);
    }, 0);
  },

  // Liability calculations
  calculateTotalLiabilities: (liabilities: SimpleLiability[]): number => {
    return liabilities.reduce((total, liability) => total + liability.amount, 0);
  },

  calculateMonthlyDebtPayments: (liabilities: SimpleLiability[]): number => {
    return liabilities.reduce((total, liability) => total + liability.monthlyPayment, 0);
  },

  calculateDebtToIncomeRatio: (totalDebt: number, monthlyIncome: number): number => {
    if (monthlyIncome === 0) return 0;
    return (totalDebt / (monthlyIncome * 12)) * 100;
  },

  // Net worth calculations
  calculateNetWorth: (totalAssets: number, totalLiabilities: number): number => {
    return totalAssets - totalLiabilities;
  },

  calculateMonthlyCashFlow: (monthlyIncome: number, monthlyExpenses: number, monthlyDebtPayments: number): number => {
    return monthlyIncome - monthlyExpenses - monthlyDebtPayments;
  },

  // Financial ratios
  calculateExpenseRatio: (monthlyExpenses: number, monthlyIncome: number): number => {
    if (monthlyIncome === 0) return 0;
    return (monthlyExpenses / monthlyIncome) * 100;
  },

  calculateSavingsRate: (monthlySavings: number, monthlyIncome: number): number => {
    if (monthlyIncome === 0) return 0;
    return (monthlySavings / monthlyIncome) * 100;
  }
};