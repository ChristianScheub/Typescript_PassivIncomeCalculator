import { useDeviceCheck } from '../shared/utilities/helper/useDeviceCheck';
import { getDynamicFontSize } from '../shared/utilities/helper/fontSizeHelper';
import { renderHook, act } from '@testing-library/react';

// Mock formatService for fontSizeHelper
jest.mock('../infrastructure', () => ({
  formatService: {
    formatCurrency: jest.fn((value) => {
      // Simple mock currency formatting
      return `$${value.toLocaleString()}`;
    })
  }
}));

describe('Helper Utilities', () => {
  describe('useDeviceCheck', () => {
    let originalInnerWidth: number;

    beforeEach(() => {
      originalInnerWidth = window.innerWidth;
      // Reset to default mobile width
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768
      });
    });

    afterEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: originalInnerWidth
      });
    });

    test('should return false for mobile screen width', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768
      });

      const { result } = renderHook(() => useDeviceCheck());
      
      expect(result.current).toBe(false);
    });

    test('should return true for desktop screen width', () => {
      // Set desktop width before rendering
      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 1200
        });
      });

      const { result } = renderHook(() => useDeviceCheck());
      
      expect(result.current).toBe(true);
    });

    test('should update when window is resized from mobile to desktop', () => {
      // Start with mobile width
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 800
      });

      const { result } = renderHook(() => useDeviceCheck());
      
      expect(result.current).toBe(false);

      // Resize to desktop width
      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 1200
        });
        
        // Trigger resize event
        const resizeEvent = new Event('resize');
        window.dispatchEvent(resizeEvent);
      });

      expect(result.current).toBe(true);
    });

    test('should update when window is resized from desktop to mobile', () => {
      // Start with desktop width
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200
      });

      const { result } = renderHook(() => useDeviceCheck());
      
      expect(result.current).toBe(true);

      // Resize to mobile width
      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 600
        });
        
        // Trigger resize event
        const resizeEvent = new Event('resize');
        window.dispatchEvent(resizeEvent);
      });

      expect(result.current).toBe(false);
    });

    test('should handle boundary case at 1024px', () => {
      // Test exactly at the boundary
      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 1024
        });
      });

      const { result } = renderHook(() => useDeviceCheck());
      
      expect(result.current).toBe(true);
    });

    test('should handle boundary case just below 1024px', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1023
      });

      const { result } = renderHook(() => useDeviceCheck());
      
      expect(result.current).toBe(false);
    });

    test('should clean up event listener on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      
      const { unmount } = renderHook(() => useDeviceCheck());
      
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
      
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('getDynamicFontSize', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should return largest font size for small numbers (4 or fewer digits)', () => {
      const { formatService } = require('../infrastructure');
      formatService.formatCurrency.mockReturnValue('$1,234');
      
      const result = getDynamicFontSize(1234);
      
      expect(result).toBe('text-xl sm:text-2xl');
      expect(formatService.formatCurrency).toHaveBeenCalledWith(1234);
    });

    test('should return medium-large font size for 5 digits', () => {
      const { formatService } = require('../infrastructure');
      formatService.formatCurrency.mockReturnValue('$12,345');
      
      const result = getDynamicFontSize(12345);
      
      expect(result).toBe('text-lg sm:text-xl');
    });

    test('should return medium font size for 6 digits', () => {
      const { formatService } = require('../infrastructure');
      formatService.formatCurrency.mockReturnValue('$123,456');
      
      const result = getDynamicFontSize(123456);
      
      expect(result).toBe('text-base sm:text-lg');
    });

    test('should return smallest font size for 7+ digits', () => {
      const { formatService } = require('../infrastructure');
      formatService.formatCurrency.mockReturnValue('$1,234,567');
      
      const result = getDynamicFontSize(1234567);
      
      expect(result).toBe('text-sm sm:text-base');
    });

    test('should handle very large numbers (8+ digits)', () => {
      const { formatService } = require('../infrastructure');
      formatService.formatCurrency.mockReturnValue('$12,345,678');
      
      const result = getDynamicFontSize(12345678);
      
      expect(result).toBe('text-sm sm:text-base');
    });

    test('should handle zero value', () => {
      const { formatService } = require('../infrastructure');
      formatService.formatCurrency.mockReturnValue('$0');
      
      const result = getDynamicFontSize(0);
      
      expect(result).toBe('text-xl sm:text-2xl');
    });

    test('should handle negative values', () => {
      const { formatService } = require('../infrastructure');
      formatService.formatCurrency.mockReturnValue('-$1,234');
      
      const result = getDynamicFontSize(-1234);
      
      expect(result).toBe('text-xl sm:text-2xl');
    });

    test('should handle decimal values', () => {
      const { formatService } = require('../infrastructure');
      formatService.formatCurrency.mockReturnValue('$1,234.56');
      
      const result = getDynamicFontSize(1234.56);
      
      expect(result).toBe('text-xl sm:text-2xl');
    });

    test('should extract only digits from formatted currency', () => {
      const { formatService } = require('../infrastructure');
      // Mock a currency format with lots of non-digit characters
      formatService.formatCurrency.mockReturnValue('€ 1.234.567,89 EUR');
      
      const result = getDynamicFontSize(1234567.89);
      
      // Should extract digits: 123456789 (9 digits) -> smallest font
      expect(result).toBe('text-sm sm:text-base');
    });

    test('should handle edge cases at boundaries', () => {
      const { formatService } = require('../infrastructure');
      
      // Test exactly 4 digits
      formatService.formatCurrency.mockReturnValue('$9,999');
      let result = getDynamicFontSize(9999);
      expect(result).toBe('text-xl sm:text-2xl');
      
      // Test exactly 5 digits
      formatService.formatCurrency.mockReturnValue('$10,000');
      result = getDynamicFontSize(10000);
      expect(result).toBe('text-lg sm:text-xl');
      
      // Test exactly 6 digits
      formatService.formatCurrency.mockReturnValue('$100,000');
      result = getDynamicFontSize(100000);
      expect(result).toBe('text-base sm:text-lg');
      
      // Test exactly 7 digits
      formatService.formatCurrency.mockReturnValue('$1,000,000');
      result = getDynamicFontSize(1000000);
      expect(result).toBe('text-sm sm:text-base');
    });
  });

  describe('Integration tests', () => {
    test('should work together for responsive design scenarios', () => {
      const { formatService } = require('../infrastructure');
      
      // Test small value on different screen sizes
      formatService.formatCurrency.mockReturnValue('$1,234');
      const fontSizeSmall = getDynamicFontSize(1234);
      
      // Test large value
      formatService.formatCurrency.mockReturnValue('$1,234,567');
      const fontSizeLarge = getDynamicFontSize(1234567);
      
      expect(fontSizeSmall).toBe('text-xl sm:text-2xl');
      expect(fontSizeLarge).toBe('text-sm sm:text-base');
      
      // Both should include responsive classes
      expect(fontSizeSmall).toContain('sm:');
      expect(fontSizeLarge).toContain('sm:');
    });

    test('should handle edge cases for both utilities', () => {
      // Test device check with extreme values
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 0
      });
      
      const { result } = renderHook(() => useDeviceCheck());
      expect(result.current).toBe(false);
      
      // Test font size with extreme values
      const { formatService } = require('../infrastructure');
      formatService.formatCurrency.mockReturnValue('$999,999,999,999');
      
      const fontSize = getDynamicFontSize(999999999999);
      expect(fontSize).toBe('text-sm sm:text-base');
    });
  });
});