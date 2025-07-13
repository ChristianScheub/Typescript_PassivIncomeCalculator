// Jest setup file for service tests

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index) => {
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

// Mock React for hook testing
const React = require('react');
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
global.testUtils = {
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