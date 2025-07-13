/**
 * Tests for FormatService
 * Tests the entire service interface for currency and percentage formatting
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';

// Mock the fetch utility to control currency settings
jest.mock('../domain/assets/market-data/stockAPIService/utils/fetch', () => ({
  getCurrency: jest.fn(),
}));

// Mock the logger
jest.mock('../shared/logging/Logger/logger', () => ({
  infoService: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

// Import after mocking
import formatService from '../infrastructure/formatService';
import { getCurrency } from '../domain/assets/market-data/stockAPIService/utils/fetch';

describe('FormatService', () => {
  const mockGetCurrency = getCurrency as jest.MockedFunction<typeof getCurrency>;

  beforeEach(() => {
    jest.clearAllMocks();
    // Default to EUR
    mockGetCurrency.mockReturnValue('EUR');
  });

  describe('formatCurrency', () => {
    test('should format USD currency correctly', () => {
      mockGetCurrency.mockReturnValue('USD');
      
      expect(formatService.formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatService.formatCurrency(0)).toBe('$0.00');
      expect(formatService.formatCurrency(-500.75)).toBe('-$500.75');
    });

    test('should format EUR currency correctly', () => {
      mockGetCurrency.mockReturnValue('EUR');
      
      expect(formatService.formatCurrency(1234.56)).toBe('1.234,56 €');
      expect(formatService.formatCurrency(0)).toBe('0,00 €');
      expect(formatService.formatCurrency(-500.75)).toBe('-500,75 €');
    });

    test('should handle edge cases', () => {
      mockGetCurrency.mockReturnValue('USD');
      
      expect(formatService.formatCurrency(0.01)).toBe('$0.01');
      expect(formatService.formatCurrency(999999.99)).toBe('$999,999.99');
      expect(formatService.formatCurrency(1000000)).toBe('$1,000,000.00');
    });

    test('should handle very large numbers', () => {
      mockGetCurrency.mockReturnValue('USD');
      
      expect(formatService.formatCurrency(1234567890.12)).toBe('$1,234,567,890.12');
    });

    test('should handle very small numbers', () => {
      mockGetCurrency.mockReturnValue('USD');
      
      expect(formatService.formatCurrency(0.001)).toBe('$0.00'); // Rounds to 2 decimal places
      expect(formatService.formatCurrency(0.005)).toBe('$0.01'); // Rounds up
    });
  });

  describe('formatPercentage', () => {
    test('should format percentage with default options', () => {
      expect(formatService.formatPercentage(12.34)).toBe('12,34 %');
      expect(formatService.formatPercentage(50)).toBe('50,00 %');
      expect(formatService.formatPercentage(125)).toBe('125,00 %');
      expect(formatService.formatPercentage(0)).toBe('0,00 %');
    });

    test('should format percentage with custom minimum fraction digits', () => {
      expect(formatService.formatPercentage(12.34, { minimumFractionDigits: 1 })).toBe('12,34 %');
      expect(formatService.formatPercentage(50, { minimumFractionDigits: 3 })).toBe('50,000 %');
      expect(formatService.formatPercentage(10, { minimumFractionDigits: 1 })).toBe('10,0 %');
    });

    test('should format percentage with custom maximum fraction digits', () => {
      expect(formatService.formatPercentage(12.3456, { maximumFractionDigits: 3 })).toBe('12,346 %');
      expect(formatService.formatPercentage(12.3456, { maximumFractionDigits: 1 })).toBe('12,3 %');
      expect(formatService.formatPercentage(12.9, { maximumFractionDigits: 1 })).toBe('12,9 %');
    });

    test('should format percentage with both min and max fraction digits', () => {
      expect(formatService.formatPercentage(10, { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })).toBe('10,00 %');
      
      expect(formatService.formatPercentage(12.3456, { 
        minimumFractionDigits: 1, 
        maximumFractionDigits: 3 
      })).toBe('12,346 %');
    });

    test('should handle edge cases', () => {
      expect(formatService.formatPercentage(0.01)).toBe('0,01 %');
      expect(formatService.formatPercentage(0.001, { minimumFractionDigits: 3 })).toBe('0,001 %');
      expect(formatService.formatPercentage(-25)).toBe('-25,00 %');
      expect(formatService.formatPercentage(1000)).toBe('1.000,00 %');
    });

    test('should handle very large percentages', () => {
      expect(formatService.formatPercentage(10000)).toBe('10.000,00 %');
      expect(formatService.formatPercentage(100000)).toBe('100.000,00 %');
    });

    test('should handle very small percentages', () => {
      expect(formatService.formatPercentage(0.0001)).toBe('0,00 %');
      expect(formatService.formatPercentage(0.0001, { minimumFractionDigits: 4 })).toBe('0,0001 %');
    });
  });

  describe('Service Integration', () => {
    test('should have all required methods', () => {
      expect(typeof formatService.formatCurrency).toBe('function');
      expect(typeof formatService.formatPercentage).toBe('function');
    });

    test('should handle concurrent calls correctly', () => {
      mockGetCurrency.mockReturnValue('USD');
      
      const results = [];
      for (let i = 0; i < 100; i++) {
        results.push(formatService.formatCurrency(i * 10.5));
      }
      
      expect(results).toHaveLength(100);
      expect(results[0]).toBe('$0.00');
      expect(results[10]).toBe('$105.00');
      expect(results[99]).toBe('$1,039.50');
    });

    test('should maintain consistency across different currency changes', () => {
      // Test USD
      mockGetCurrency.mockReturnValue('USD');
      const usdResult = formatService.formatCurrency(1000);
      
      // Test EUR  
      mockGetCurrency.mockReturnValue('EUR');
      const eurResult = formatService.formatCurrency(1000);
      
      expect(usdResult).toBe('$1,000.00');
      expect(eurResult).toBe('1.000,00 €');
      expect(usdResult).not.toBe(eurResult);
    });
  });
});