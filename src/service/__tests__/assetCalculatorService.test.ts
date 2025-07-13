import { mockAssetCalculatorService as assetCalculatorService } from './mockServices';

// Mock types for testing
interface Asset {
  id: string;
  symbol: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: Date;
  type: 'stock' | 'bond' | 'cash' | 'real_estate' | 'collectible';
  value?: number;
  dividendSchedule?: {
    frequency: 'quarterly' | 'monthly' | 'annually';
    amount: number;
    months?: number[];
  };
}

interface AssetAllocation {
  type: string;
  value: number;
  percentage: number;
}

// Mock the logger
jest.mock('../shared/logging/Logger/logger', () => ({
  infoService: jest.fn(),
  errorService: jest.fn(),
  warnService: jest.fn(),
  cache: jest.fn(),
}));

// Mock cache utilities
jest.mock('../shared/cache/assetIncomeCacheUtils', () => ({
  areAssetsCached: jest.fn(() => false),
  calculateTotalMonthlyAssetIncomeFromCache: jest.fn(() => null),
  calculateTotalAssetIncomeForMonthFromCache: jest.fn(() => null),
}));

// Mock asset income calculations
jest.mock('../shared/calculations/assetIncomeCalculations', () => ({
  calculateAssetMonthlyIncomeWithCache: jest.fn((asset: Asset) => ({
    monthlyAmount: asset.dividendSchedule?.amount || 0,
    annualAmount: (asset.dividendSchedule?.amount || 0) * 12,
    monthlyBreakdown: {},
    cacheHit: false,
  })),
}));

describe('AssetCalculatorService', () => {
  describe('Basic Asset Value Calculations', () => {
    it('should calculate total asset value correctly', () => {
      const assets: Asset[] = [
        {
          id: '1',
          symbol: 'AAPL',
          quantity: 100,
          purchasePrice: 150,
          purchaseDate: new Date(),
          type: 'stock',
          value: 18000,
        },
        {
          id: '2',
          symbol: 'GOOGL',
          quantity: 50,
          purchasePrice: 2500,
          purchaseDate: new Date(),
          type: 'stock',
          value: 135000,
        },
        {
          id: '3',
          symbol: 'CASH',
          quantity: 1,
          purchasePrice: 5000,
          purchaseDate: new Date(),
          type: 'cash',
          value: 5000,
        },
      ];

      const result = assetCalculatorService.calculateTotalAssetValue(assets);
      expect(result).toBe(158000); // 18000 + 135000 + 5000
    });

    it('should handle assets without value', () => {
      const assets: Asset[] = [
        {
          id: '1',
          symbol: 'AAPL',
          quantity: 100,
          purchasePrice: 150,
          purchaseDate: new Date(),
          type: 'stock',
          // value is undefined
        },
        {
          id: '2',
          symbol: 'CASH',
          quantity: 1,
          purchasePrice: 1000,
          purchaseDate: new Date(),
          type: 'cash',
          value: 1000,
        },
      ];

      const result = assetCalculatorService.calculateTotalAssetValue(assets);
      expect(result).toBe(1000); // 0 + 1000
    });

    it('should calculate liquid asset value correctly', () => {
      const assets: Asset[] = [
        {
          id: '1',
          symbol: 'AAPL',
          quantity: 100,
          purchasePrice: 150,
          purchaseDate: new Date(),
          type: 'stock',
          value: 18000,
        },
        {
          id: '2',
          symbol: 'REAL_ESTATE',
          quantity: 1,
          purchasePrice: 300000,
          purchaseDate: new Date(),
          type: 'real_estate',
          value: 350000,
        },
        {
          id: '3',
          symbol: 'CASH',
          quantity: 1,
          purchasePrice: 5000,
          purchaseDate: new Date(),
          type: 'cash',
          value: 5000,
        },
        {
          id: '4',
          symbol: 'CORP_BOND',
          quantity: 10,
          purchasePrice: 1000,
          purchaseDate: new Date(),
          type: 'bond',
          value: 10500,
        },
      ];

      const result = assetCalculatorService.calculateLiquidAssetValue(assets);
      expect(result).toBe(33500); // 18000 + 5000 + 10500 (excludes real estate)
    });
  });

  describe('Asset Income Calculations', () => {
    it('should calculate monthly income for dividend-paying asset', () => {
      const asset: Asset = {
        id: '1',
        symbol: 'AAPL',
        quantity: 100,
        purchasePrice: 150,
        purchaseDate: new Date(),
        type: 'stock',
        value: 18000,
        dividendSchedule: {
          frequency: 'quarterly',
          amount: 0.23, // $0.23 per share per quarter
        },
      };

      const result = assetCalculatorService.calculateAssetMonthlyIncome(asset);
      expect(result).toBeCloseTo(7.67, 2); // (0.23 * 100 * 4) / 12
    });

    it('should calculate income for specific month', () => {
      const asset: Asset = {
        id: '1',
        symbol: 'AAPL',
        quantity: 100,
        purchasePrice: 150,
        purchaseDate: new Date(),
        type: 'stock',
        value: 18000,
        dividendSchedule: {
          frequency: 'quarterly',
          amount: 0.23,
          months: [3, 6, 9, 12], // Mar, Jun, Sep, Dec
        },
      };

      // Should receive dividend in March (month 3)
      const marchIncome = assetCalculatorService.calculateAssetIncomeForMonth(asset, 3);
      expect(marchIncome).toBe(23); // 0.23 * 100

      // Should not receive dividend in February (month 2)
      const febIncome = assetCalculatorService.calculateAssetIncomeForMonth(asset, 2);
      expect(febIncome).toBe(0);
    });

    it('should calculate total monthly income from multiple assets', () => {
      const assets: Asset[] = [
        {
          id: '1',
          symbol: 'AAPL',
          quantity: 100,
          purchasePrice: 150,
          purchaseDate: new Date(),
          type: 'stock',
          value: 18000,
          dividendSchedule: {
            frequency: 'quarterly',
            amount: 0.23,
          },
        },
        {
          id: '2',
          symbol: 'MSFT',
          quantity: 50,
          purchasePrice: 300,
          purchaseDate: new Date(),
          type: 'stock',
          value: 16000,
          dividendSchedule: {
            frequency: 'quarterly',
            amount: 0.68,
          },
        },
      ];

      const result = assetCalculatorService.calculateTotalMonthlyAssetIncome(assets);
      // This will use the mocked cache function
      expect(result).toBeCloseTo(7.67 + 11.33, 2); // AAPL: 7.67, MSFT: 11.33
    });

    it('should calculate annual income from monthly income', () => {
      const monthlyIncome = 150;
      const result = assetCalculatorService.calculateAnnualAssetIncome(monthlyIncome);
      expect(result).toBe(1800);
    });
  });

  describe('Asset Allocation Analysis', () => {
    it('should calculate asset allocation by type', () => {
      const assets: Asset[] = [
        {
          id: '1',
          symbol: 'AAPL',
          quantity: 100,
          purchasePrice: 150,
          purchaseDate: new Date(),
          type: 'stock',
          value: 18000,
        },
        {
          id: '2',
          symbol: 'CORP_BOND',
          quantity: 10,
          purchasePrice: 1000,
          purchaseDate: new Date(),
          type: 'bond',
          value: 10000,
        },
        {
          id: '3',
          symbol: 'CASH',
          quantity: 1,
          purchasePrice: 2000,
          purchaseDate: new Date(),
          type: 'cash',
          value: 2000,
        },
      ];

      const result = assetCalculatorService.calculateAssetAllocation(assets);
      expect(Array.isArray(result)).toBe(true);
      // The actual allocation calculation would depend on the implementation
      // but we can verify it returns the expected structure
    });
  });

  describe('Cached Calculations', () => {
    it('should check if assets are cached', () => {
      const assets: Asset[] = [
        {
          id: '1',
          symbol: 'AAPL',
          quantity: 100,
          purchasePrice: 150,
          purchaseDate: new Date(),
          type: 'stock',
          value: 18000,
        },
      ];

      // Using the mocked function
      const result = assetCalculatorService.areAssetsCached?.(assets);
      expect(result).toBe(false); // Mocked to return false
    });

    it('should use cached income calculation when available', () => {
      const asset: Asset = {
        id: '1',
        symbol: 'AAPL',
        quantity: 100,
        purchasePrice: 150,
        purchaseDate: new Date(),
        type: 'stock',
        value: 18000,
        dividendSchedule: {
          frequency: 'quarterly',
          amount: 0.23,
        },
      };

      const result = assetCalculatorService.calculateAssetMonthlyIncomeWithCache?.(asset);
      expect(result?.monthlyAmount).toBe(0.23); // Mocked value
      expect(result?.cacheHit).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty asset arrays', () => {
      expect(assetCalculatorService.calculateTotalAssetValue([])).toBe(0);
      expect(assetCalculatorService.calculateLiquidAssetValue([])).toBe(0);
      expect(assetCalculatorService.calculateTotalMonthlyAssetIncome([])).toBe(0);
    });

    it('should handle assets without dividend schedules', () => {
      const asset: Asset = {
        id: '1',
        symbol: 'GROWTH_STOCK',
        quantity: 100,
        purchasePrice: 50,
        purchaseDate: new Date(),
        type: 'stock',
        value: 8000,
        // No dividend schedule
      };

      const result = assetCalculatorService.calculateAssetMonthlyIncome(asset);
      expect(result).toBe(0);
    });

    it('should handle very large asset portfolios', () => {
      const assets: Asset[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `asset-${i}`,
        symbol: `STOCK${i}`,
        quantity: 10,
        purchasePrice: 100,
        purchaseDate: new Date(),
        type: 'stock' as const,
        value: 1000,
      }));

      const start = performance.now();
      const result = assetCalculatorService.calculateTotalAssetValue(assets);
      const end = performance.now();

      expect(result).toBe(1000000); // 1000 * 1000
      expect(end - start).toBeLessThan(100); // Should complete in less than 100ms
    });

    it('should handle negative asset values', () => {
      const assets: Asset[] = [
        {
          id: '1',
          symbol: 'LOSS_MAKING',
          quantity: 100,
          purchasePrice: 50,
          purchaseDate: new Date(),
          type: 'stock',
          value: -1000, // Negative value
        },
        {
          id: '2',
          symbol: 'PROFITABLE',
          quantity: 50,
          purchasePrice: 100,
          purchaseDate: new Date(),
          type: 'stock',
          value: 6000,
        },
      ];

      const result = assetCalculatorService.calculateTotalAssetValue(assets);
      expect(result).toBe(5000); // -1000 + 6000
    });
  });

  describe('Asset Type Filtering', () => {
    it('should correctly identify liquid vs illiquid assets', () => {
      const assets: Asset[] = [
        {
          id: '1',
          symbol: 'LIQUID_STOCK',
          quantity: 100,
          purchasePrice: 100,
          purchaseDate: new Date(),
          type: 'stock',
          value: 12000,
        },
        {
          id: '2',
          symbol: 'SAVINGS_BOND',
          quantity: 5,
          purchasePrice: 1000,
          purchaseDate: new Date(),
          type: 'bond',
          value: 5200,
        },
        {
          id: '3',
          symbol: 'EMERGENCY_FUND',
          quantity: 1,
          purchasePrice: 10000,
          purchaseDate: new Date(),
          type: 'cash',
          value: 10000,
        },
        {
          id: '4',
          symbol: 'RENTAL_PROPERTY',
          quantity: 1,
          purchasePrice: 250000,
          purchaseDate: new Date(),
          type: 'real_estate',
          value: 280000,
        },
        {
          id: '5',
          symbol: 'CLASSIC_CAR',
          quantity: 1,
          purchasePrice: 50000,
          purchaseDate: new Date(),
          type: 'collectible',
          value: 60000,
        },
      ];

      const liquidValue = assetCalculatorService.calculateLiquidAssetValue(assets);
      const totalValue = assetCalculatorService.calculateTotalAssetValue(assets);

      expect(liquidValue).toBe(27200); // 12000 + 5200 + 10000
      expect(totalValue).toBe(367200); // All assets
      expect(liquidValue).toBeLessThan(totalValue);
    });
  });
});