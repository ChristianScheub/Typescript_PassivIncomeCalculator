// This file creates mock implementations of missing dependencies to make tests work
// It includes all the missing types and utilities that services depend on

// Mock all external dependencies
jest.mock('@/types/domains/financial', () => ({}), { virtual: true });
jest.mock('@/types/domains/assets', () => ({}), { virtual: true });
jest.mock('@/types/domains/portfolio', () => ({}), { virtual: true });
jest.mock('@/types/domains/analytics', () => ({}), { virtual: true });
jest.mock('@/types/shared/base/payments', () => ({}), { virtual: true });
jest.mock('@/types/shared/base/enums', () => ({}), { virtual: true });
jest.mock('@/utils/dividendCacheUtils', () => ({
  getCachedDividendData: jest.fn(() => null),
  invalidateDividendCache: jest.fn(),
}), { virtual: true });
jest.mock('@/utils/transactionCalculations', () => ({
  getCurrentQuantity: jest.fn((transaction) => transaction.quantity || 100),
}), { virtual: true });
jest.mock('../../../../config/featureFlags', () => ({
  featureFlag_Debug_AllLogs: false,
  featureFlag_Debug_Log_Cache: false,
  featureFlag_Debug_Log_Error: true,
}), { virtual: true });
jest.mock('@/service/infrastructure', () => ({
  formatService: {
    formatCurrency: jest.fn((value) => {
      // Mock European format with EUR currency as expected by tests
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    }),
    formatPercentage: jest.fn((value) => {
      // Mock European percentage format as expected by tests
      return new Intl.NumberFormat('de-DE', {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value / 100);
    }),
  },
}), { virtual: true });

// Mock the stock API fetch utility
jest.mock('@/service/domain/assets/market-data/stockAPIService/utils/fetch', () => ({
  getCurrency: jest.fn(() => 'USD'),
}), { virtual: true });

// Mock analytics service methods
jest.mock('@/service/domain/analytics/calculations/financialAnalyticsService/methods/calculateProjections', () => ({
  calculateProjections: jest.fn(() => [
    { month: 1, income: 5000, expenses: 3000, cashFlow: 2000, cumulativeCashFlow: 2000 },
    { month: 2, income: 5000, expenses: 3000, cashFlow: 2000, cumulativeCashFlow: 4000 },
  ]),
  calculateProjectionsWithCache: jest.fn(() => [
    { month: 1, income: 5000, expenses: 3000, cashFlow: 2000, cumulativeCashFlow: 2000 },
    { month: 2, income: 5000, expenses: 3000, cashFlow: 2000, cumulativeCashFlow: 4000 },
  ]),
}), { virtual: true });

jest.mock('@/service/domain/analytics/calculations/financialAnalyticsService/methods/calculatePortfolioAnalytics', () => ({
  calculatePortfolioAnalytics: jest.fn(() => ({
    totalValue: 100000,
    totalIncome: 1200,
    yieldPercentage: 14.4,
    positions: [],
  })),
  calculateIncomeAnalytics: jest.fn(() => ({
    monthlyIncome: 1200,
    annualIncome: 14400,
    incomeBreakdown: [],
    yieldAnalysis: {},
  })),
}), { virtual: true });

// Mock cache utilities
jest.mock('@/service/shared/cache/assetIncomeCacheUtils', () => ({
  areAssetsCached: jest.fn(() => false),
  calculateTotalMonthlyAssetIncomeFromCache: jest.fn(() => null),
  calculateTotalAssetIncomeForMonthFromCache: jest.fn(() => null),
}), { virtual: true });

jest.mock('@/service/shared/calculations/assetIncomeCalculations', () => ({
  calculateAssetMonthlyIncomeWithCache: jest.fn((asset) => ({
    monthlyAmount: asset?.dividendSchedule?.amount || 0,
    annualAmount: (asset?.dividendSchedule?.amount || 0) * 12,
    monthlyBreakdown: {},
    cacheHit: false,
  })),
}), { virtual: true });

// Mock logger to avoid import issues
jest.mock('@/service/shared/logging/Logger/logger', () => ({
  infoService: jest.fn(),
  errorService: jest.fn(),
  warnService: jest.fn(),
  cache: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  default: {
    infoService: jest.fn(),
    errorService: jest.fn(),
    warnService: jest.fn(),
    cache: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}), { virtual: true });

export {};