import { mockFormatService as formatService } from './mockServices';

// Mock the logger
jest.mock('../shared/logging/Logger/logger', () => ({
  infoService: jest.fn(),
  errorService: jest.fn(),
  warnService: jest.fn(),
}));

describe('FormatService', () => {
  describe('Currency Formatting', () => {
    it('should format USD currency correctly', () => {
      const result = formatService.formatCurrency(1234.56);
      expect(result).toBe('$1,234.56');
    });

    it('should handle zero amounts', () => {
      const result = formatService.formatCurrency(0);
      expect(result).toBe('$0.00');
    });

    it('should handle negative amounts', () => {
      const result = formatService.formatCurrency(-1234.56);
      expect(result).toBe('-$1,234.56');
    });

    it('should handle very large amounts', () => {
      const result = formatService.formatCurrency(1234567890.12);
      expect(result).toBe('$1,234,567,890.12');
    });

    it('should handle very small amounts', () => {
      const result = formatService.formatCurrency(0.01);
      expect(result).toBe('$0.01');
    });

    it('should round to 2 decimal places', () => {
      const result = formatService.formatCurrency(1234.567);
      expect(result).toBe('$1,234.57');
    });
  });

  describe('Percentage Formatting', () => {
    it('should format percentage correctly with default options', () => {
      const result = formatService.formatPercentage(25.75);
      expect(result).toBe('25.75 %');
    });

    it('should format percentage with custom fraction digits', () => {
      const result = formatService.formatPercentage(25.755, {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      });
      expect(result).toBe('25.755 %');
    });

    it('should handle zero percentage', () => {
      const result = formatService.formatPercentage(0);
      expect(result).toBe('0.00 %');
    });

    it('should handle negative percentage', () => {
      const result = formatService.formatPercentage(-15.25);
      expect(result).toBe('-15.25 %');
    });

    it('should handle 100 percentage', () => {
      const result = formatService.formatPercentage(100);
      expect(result).toBe('100.00 %');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large numbers', () => {
      const result1 = formatService.formatCurrency(999999999);
      const result2 = formatService.formatPercentage(999999);
      
      expect(typeof result1).toBe('string');
      expect(typeof result2).toBe('string');
    });
  });
});