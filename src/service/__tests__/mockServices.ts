// Mock implementation for testing services that may not have complete implementations
export const mockIncomeCalculatorService = {
  calculatePaymentSchedule: (schedule: any) => {
    let monthlyAmount = 0;
    switch (schedule.frequency) {
      case 'monthly': monthlyAmount = schedule.amount; break;
      case 'quarterly': monthlyAmount = schedule.amount * 4 / 12; break;
      case 'annually': monthlyAmount = schedule.amount / 12; break;
      default: monthlyAmount = schedule.amount;
    }
    return { 
      monthlyAmount, 
      annualAmount: monthlyAmount * 12 
    };
  },
  calculateDividendSchedule: (schedule: any, quantity: number) => ({ monthlyAmount: (schedule.amount || 0) * quantity / 3, annualAmount: (schedule.amount || 0) * quantity * 4 }),
  calculateDividendForMonth: (schedule: any, quantity: number, monthNumber: number) => {
    if (schedule.months && schedule.months.includes(monthNumber)) {
      return (schedule.amount || 0) * quantity;
    }
    return 0;
  },
  calculateMonthlyIncome: (income: any) => {
    if (!income.paymentSchedule) return 0;
    switch (income.paymentSchedule.frequency) {
      case 'monthly': return income.paymentSchedule.amount;
      case 'quarterly': return income.paymentSchedule.amount * 4 / 12;
      case 'annually': return income.paymentSchedule.amount / 12;
      case 'custom': 
        if (income.paymentSchedule.customAmounts) {
          const total = Object.values(income.paymentSchedule.customAmounts).reduce((sum: number, amount: number) => sum + amount, 0);
          return total / 12;
        }
        return 0;
      default: return 0;
    }
  },
  calculateTotalMonthlyIncome: (incomes: any[]) => incomes.reduce((total, income) => total + mockIncomeCalculatorService.calculateMonthlyIncome(income), 0),
  calculatePassiveIncome: (incomes: any[]) => incomes.filter(i => i.isPassive).reduce((total, income) => total + mockIncomeCalculatorService.calculateMonthlyIncome(income), 0),
  calculatePassiveIncomeRatio: (monthlyIncome: number, passiveIncome: number) => monthlyIncome > 0 ? (passiveIncome / monthlyIncome) * 100 : 0,
  calculateAnnualIncome: (monthlyIncome: number) => monthlyIncome * 12,
  calculateIncomeAllocation: (incomes: any[], assets: any[]) => [],
};

export const mockExpenseCalculatorService = {
  calculateMonthlyExpense: (expense: any) => {
    if (!expense.paymentSchedule) return 0;
    switch (expense.paymentSchedule.frequency) {
      case 'monthly': return expense.paymentSchedule.amount;
      case 'quarterly': return expense.paymentSchedule.amount / 3;
      case 'annually': return expense.paymentSchedule.amount / 12;
      case 'weekly': return expense.paymentSchedule.amount * 52 / 12;
      case 'bi-weekly': return expense.paymentSchedule.amount * 26 / 12;
      case 'custom': 
        if (expense.paymentSchedule.customAmounts) {
          const total = Object.values(expense.paymentSchedule.customAmounts).reduce((sum: number, amount: number) => sum + amount, 0);
          return total / 12;
        }
        return 0;
      default: return 0;
    }
  },
  calculateTotalMonthlyExpenses: (expenses: any[]) => expenses.reduce((total, expense) => total + mockExpenseCalculatorService.calculateMonthlyExpense(expense), 0),
  calculateAnnualExpenses: (monthlyExpenses: number) => monthlyExpenses * 12,
  calculateExpenseBreakdown: (expenses: any[]) => {
    const categoryTotals: Record<string, number> = {};
    let total = 0;
    
    expenses.forEach(expense => {
      const monthlyAmount = mockExpenseCalculatorService.calculateMonthlyExpense(expense);
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + monthlyAmount;
      total += monthlyAmount;
    });
    
    return Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      totalAmount: amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
    }));
  },
};

export const mockLiabilityCalculatorService = {
  calculateLiabilityMonthlyPayment: (liability: any) => {
    if (!liability.paymentSchedule) return 0;
    switch (liability.paymentSchedule.frequency) {
      case 'monthly': return liability.paymentSchedule.amount;
      case 'quarterly': return liability.paymentSchedule.amount * 4 / 12;
      case 'annually': return liability.paymentSchedule.amount / 12;
      case 'custom': 
        if (liability.paymentSchedule.customAmounts) {
          const total = Object.values(liability.paymentSchedule.customAmounts).reduce((sum: number, amount: number) => sum + amount, 0);
          return total / 12;
        }
        return 0;
      default: return 0;
    }
  },
  calculateTotalDebt: (liabilities: any[]) => liabilities.reduce((total, liability) => total + liability.currentBalance, 0),
  calculateTotalMonthlyLiabilityPayments: (liabilities: any[]) => liabilities.reduce((total, liability) => total + mockLiabilityCalculatorService.calculateLiabilityMonthlyPayment(liability), 0),
};

export const mockAssetCalculatorService = {
  calculateAssetMonthlyIncome: (asset: any) => {
    if (!asset.dividendSchedule) return 0;
    const amount = asset.dividendSchedule.amount * asset.quantity;
    switch (asset.dividendSchedule.frequency) {
      case 'quarterly': return amount * 4 / 12;
      case 'monthly': return amount;
      case 'annually': return amount / 12;
      default: return 0;
    }
  },
  calculateAssetIncomeForMonth: (asset: any, monthNumber: number) => {
    if (!asset.dividendSchedule) return 0;
    if (asset.dividendSchedule.months && asset.dividendSchedule.months.includes(monthNumber)) {
      return asset.dividendSchedule.amount * asset.quantity;
    }
    return 0;
  },
  calculateTotalAssetValue: (assets: any[]) => assets.reduce((sum, asset) => sum + (asset.value || 0), 0),
  calculateLiquidAssetValue: (assets: any[]) => assets
    .filter(asset => ['stock', 'bond', 'cash'].includes(asset.type))
    .reduce((sum, asset) => sum + asset.value, 0),
  calculateTotalMonthlyAssetIncome: (assets: any[]) => assets.reduce((total, asset) => total + mockAssetCalculatorService.calculateAssetMonthlyIncome(asset), 0),
  calculateTotalAssetIncomeForMonth: (assets: any[], monthNumber: number) => assets.reduce((total, asset) => total + mockAssetCalculatorService.calculateAssetIncomeForMonth(asset, monthNumber), 0),
  calculateAnnualAssetIncome: (monthlyIncome: number) => monthlyIncome * 12,
  calculateAssetAllocation: (assets: any[]) => [],
  calculateAssetMonthlyIncomeWithCache: (asset: any) => ({
    monthlyAmount: asset.dividendSchedule?.amount || 0,
    annualAmount: (asset.dividendSchedule?.amount || 0) * 12,
    monthlyBreakdown: {},
    cacheHit: false,
  }),
  areAssetsCached: (assets: any[]) => false,
};

export const mockFinancialCalculatorService = {
  calculateMonthlyCashFlow: (income: number, expenses: number, liabilities: number) => income - expenses - liabilities,
  calculateNetWorth: (assets: number, debt: number) => assets - debt,
  calculateProjections: () => [],
  calculateProjectionsWithCache: () => [],
  calculatePortfolioAnalytics: () => ({ totalValue: 0, totalIncome: 0, yieldPercentage: 0, positions: [] }),
  calculateIncomeAnalytics: () => ({ monthlyIncome: 0, annualIncome: 0, incomeBreakdown: [], yieldAnalysis: {} }),
};

export const mockFormatService = {
  formatCurrency: (amount: number) => {
    const isNegative = amount < 0;
    const absAmount = Math.abs(amount);
    const formatted = `$${absAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return isNegative ? `-${formatted}` : formatted;
  },
  formatPercentage: (value: number, options?: any) => `${(value).toLocaleString('en-US', { minimumFractionDigits: options?.minimumFractionDigits ?? 2, maximumFractionDigits: options?.maximumFractionDigits ?? 2 })} %`,
};

export const mockStockAPIService = {
  getCurrentStockPrice: async (symbol: string) => {
    if (symbol === 'AAPL') {
      return {
        symbol: 'AAPL',
        price: 150.25,
        change: 2.50,
        changePercent: 1.69,
        timestamp: new Date(),
      };
    } else if (symbol === 'BRK.B') {
      return {
        symbol: 'BRK.B',
        price: 300.50,
        change: -1.25,
        changePercent: -0.41,
        timestamp: new Date(),
      };
    } else if (symbol === 'MSFT') {
      return {
        symbol: 'MSFT',
        price: 350.75,
        change: 5.25,
        changePercent: 1.52,
        timestamp: new Date(),
      };
    }
    return {
      symbol,
      price: 100,
      change: 1,
      changePercent: 1,
      timestamp: new Date(),
    };
  },
  getHistory: async (symbol: string, start: string, end: string) => [
    {
      date: '2023-01-01',
      open: 130.28,
      high: 133.41,
      low: 129.89,
      close: 131.86,
      volume: 70790813,
    },
    {
      date: '2023-01-02',
      open: 131.99,
      high: 132.41,
      low: 125.70,
      close: 126.04,
      volume: 63896155,
    },
  ],
  getHistory30Days: async (symbol: string) => Array.from({ length: 30 }, (_, i) => ({
    date: `2023-12-${String(i + 1).padStart(2, '0')}`,
    open: 150 + Math.random() * 10,
    high: 155 + Math.random() * 10,
    low: 145 + Math.random() * 10,
    close: 150 + Math.random() * 10,
    volume: 50000000 + Math.random() * 20000000,
  })),
  getIntradayHistory: async (symbol: string) => [
    {
      time: '09:30',
      price: 150.25,
      volume: 1250000,
    },
    {
      time: '09:31',
      price: 150.50,
      volume: 980000,
    },
    {
      time: '09:32',
      price: 150.75,
      volume: 1100000,
    },
  ],
};