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

// Mock logger to avoid import issues
jest.mock('@/service/shared/logging/Logger/logger', () => ({
  infoService: jest.fn(),
  errorService: jest.fn(),
  warnService: jest.fn(),
  cache: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  infoCache: jest.fn(),
  errorCache: jest.fn(),
  deleteLogs: jest.fn(),
  exportLogs: jest.fn(() => 'mock logs'),
  default: {
    infoService: jest.fn(),
    errorService: jest.fn(),
    warnService: jest.fn(),
    cache: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    infoCache: jest.fn(),
    errorCache: jest.fn(),
    deleteLogs: jest.fn(),
    exportLogs: jest.fn(() => 'mock logs'),
  },
}), { virtual: true });

// Mock the stock API fetch utility
jest.mock('@/service/domain/assets/market-data/stockAPIService/utils/fetch', () => ({
  getCurrency: jest.fn(() => 'USD'),
}), { virtual: true });

// Mock analytics service methods
jest.mock('@/service/domain/analytics/calculations/financialAnalyticsService/methods/calculateProjections', () => ({
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

// Jest setup file for service tests

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }),
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock indexedDB for tests
const indexedDBMock = {
  open: jest.fn(() => ({
    result: {
      transaction: jest.fn(() => ({
        objectStore: jest.fn(() => ({
          add: jest.fn(),
          put: jest.fn(),
          delete: jest.fn(),
          get: jest.fn(),
          getAll: jest.fn(() => ({ onsuccess: null }))
        }))
      })),
      createObjectStore: jest.fn()
    },
    onsuccess: null,
    onerror: null,
    onupgradeneeded: null
  })),
  deleteDatabase: jest.fn(() => ({
    onsuccess: null,
    onerror: null
  }))
};

Object.defineProperty(global, 'indexedDB', {
  value: indexedDBMock,
  writable: true,
});

// Mock IDBRequest and other IndexedDB classes

// Plain object mocks for IndexedDB classes
Object.defineProperty(global, 'IDBRequest', {
  value: () => ({
    result: null,
    error: null,
    onsuccess: null,
    onerror: null,
  }),
  writable: true,
});

Object.defineProperty(global, 'IDBDatabase', {
  value: () => ({
    name: '',
    version: 1,
    transaction: () => ({}),
    createObjectStore: () => ({}),
  }),
  writable: true,
});

Object.defineProperty(global, 'IDBObjectStore', {
  value: () => ({
    name: '',
    add: () => ({ onsuccess: null, onerror: null }),
    put: () => ({ onsuccess: null, onerror: null }),
    get: () => ({ onsuccess: null, onerror: null }),
    delete: () => ({ onsuccess: null, onerror: null }),
  }),
  writable: true,
});

// Mock React for hook testing
import React from 'react';
Object.defineProperty(React, 'useState', {
  value: jest.fn((initial) => [initial, jest.fn()]),
  writable: true,
});
Object.defineProperty(React, 'useEffect', {
  value: jest.fn((fn) => fn()),
  writable: true,
});

Object.defineProperty(global, 'React', {
  value: React,
  writable: true,
});

// Mock fetch for tests
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  })
) as jest.Mock;

// Mock idb library
jest.mock('idb', () => ({
  openDB: jest.fn(() => Promise.resolve({
    transaction: jest.fn(() => ({
      objectStore: jest.fn(() => ({
        add: jest.fn(() => Promise.resolve()),
        put: jest.fn(() => Promise.resolve()),
        get: jest.fn(() => Promise.resolve()),
        delete: jest.fn(() => Promise.resolve()),
        getAll: jest.fn(() => Promise.resolve([])),
        clear: jest.fn(() => Promise.resolve())
      }))
    })),
    createObjectStore: jest.fn(),
    close: jest.fn()
  })),
  deleteDB: jest.fn(() => Promise.resolve())
}));

// Mock console methods to avoid noise during tests
const originalConsole = { ...console };

beforeEach(() => {
  // Reset console mocks before each test
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
  console.info = jest.fn();
  
  // Reset localStorage mock
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  localStorageMock.key.mockClear();
});

afterEach(() => {
  // Clean up after each test
  jest.clearAllMocks();
});

afterAll(() => {
  // Restore original console methods
  Object.assign(console, originalConsole);
});

// Global test utilities
(global as typeof global & { testUtils: unknown }).testUtils = {
  // Helper to create mock data
  createMockTransaction: (overrides = {}) => ({
    id: 'test-id',
    type: 'income',
    amount: 1000,
    title: 'Test Transaction',
    date: new Date('2024-01-01'),
    category: 'salary',
    ...overrides,
  }),
  
  createMockIncome: (overrides = {}) => ({
    id: 'test-income-id',
    title: 'Test Income',
    amount: 5000,
    type: 'active',
    frequency: 'monthly',
    ...overrides,
  }),
  
  createMockAsset: (overrides = {}) => ({
    id: 'test-asset-id',
    symbol: 'AAPL',
    shares: 100,
    price: 150,
    ...overrides,
  }),
};