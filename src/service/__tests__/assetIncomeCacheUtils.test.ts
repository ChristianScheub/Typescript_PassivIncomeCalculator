import { 
  areAssetsCached, 
  calculateTotalMonthlyAssetIncomeFromCache, 
  invalidateAssetIncomeCache 
} from '../shared/cache/assetIncomeCacheUtils';

// Mock dependencies
jest.mock('../shared/logging/Logger/logger', () => ({
  cache: jest.fn(),
  infoService: jest.fn()
}));

jest.mock('../../utils/dividendCacheUtils', () => ({
  getCachedDividendData: jest.fn(),
  invalidateDividendCache: jest.fn()
}));

describe('AssetIncomeCacheUtils', () => {
  const mockAssets = [
    {
      id: '1',
      name: 'AAPL',
      type: 'stock',
      value: 15000
    },
    {
      id: '2', 
      name: 'GOOGL',
      type: 'stock',
      value: 140000
    },
    {
      id: '3',
      name: 'BND',
      type: 'bond',
      value: 17000
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('areAssetsCached', () => {
    test('should return true when all assets have cached data', () => {
      const { getCachedDividendData } = require('@/utils/dividendCacheUtils');
      getCachedDividendData.mockReturnValue({
        monthlyAmount: 100,
        annualAmount: 1200,
        lastUpdated: new Date()
      });

      const result = areAssetsCached(mockAssets as any);

      expect(result).toBe(true);
      expect(getCachedDividendData).toHaveBeenCalledTimes(3);
    });

    test('should return false when any asset lacks cached data', () => {
      const { getCachedDividendData } = require('@/utils/dividendCacheUtils');
      getCachedDividendData
        .mockReturnValueOnce({ monthlyAmount: 100 }) // First asset cached
        .mockReturnValueOnce(null) // Second asset not cached
        .mockReturnValueOnce({ monthlyAmount: 50 }); // Third asset cached

      const result = areAssetsCached(mockAssets as any);

      expect(result).toBe(false);
      expect(getCachedDividendData).toHaveBeenCalledTimes(3);
    });

    test('should return false when all assets lack cached data', () => {
      const { getCachedDividendData } = require('@/utils/dividendCacheUtils');
      getCachedDividendData.mockReturnValue(null);

      const result = areAssetsCached(mockAssets as any);

      expect(result).toBe(false);
      expect(getCachedDividendData).toHaveBeenCalledTimes(3);
    });

    test('should handle empty asset array', () => {
      const result = areAssetsCached([]);

      expect(result).toBe(true); // Empty array should be considered "all cached"
    });

    test('should handle single asset', () => {
      const { getCachedDividendData } = require('@/utils/dividendCacheUtils');
      getCachedDividendData.mockReturnValue({ monthlyAmount: 50 });

      const singleAsset = [mockAssets[0]];
      const result = areAssetsCached(singleAsset as any);

      expect(result).toBe(true);
      expect(getCachedDividendData).toHaveBeenCalledTimes(1);
    });
  });

  describe('calculateTotalMonthlyAssetIncomeFromCache', () => {
    test('should calculate total monthly income when all assets are cached', () => {
      const { getCachedDividendData } = require('@/utils/dividendCacheUtils');
      getCachedDividendData
        .mockReturnValueOnce({ monthlyAmount: 100 })
        .mockReturnValueOnce({ monthlyAmount: 200 })
        .mockReturnValueOnce({ monthlyAmount: 50 });

      const result = calculateTotalMonthlyAssetIncomeFromCache(mockAssets as any);

      expect(result).toBe(350); // 100 + 200 + 50
      expect(getCachedDividendData).toHaveBeenCalledTimes(3);
    });

    test('should return null when any asset is not cached', () => {
      const { getCachedDividendData } = require('@/utils/dividendCacheUtils');
      getCachedDividendData
        .mockReturnValueOnce({ monthlyAmount: 100 }) // First asset cached
        .mockReturnValueOnce(null); // Second asset not cached

      const result = calculateTotalMonthlyAssetIncomeFromCache(mockAssets as any);

      expect(result).toBeNull();
      expect(getCachedDividendData).toHaveBeenCalledTimes(2); // Should exit early
    });

    test('should return null when cached data has no monthlyAmount', () => {
      const { getCachedDividendData } = require('@/utils/dividendCacheUtils');
      getCachedDividendData
        .mockReturnValueOnce({ monthlyAmount: 100 })
        .mockReturnValueOnce({ annualAmount: 1200 }); // No monthlyAmount

      const result = calculateTotalMonthlyAssetIncomeFromCache(mockAssets as any);

      expect(result).toBeNull();
    });

    test('should handle zero monthly amounts', () => {
      const { getCachedDividendData } = require('@/utils/dividendCacheUtils');
      getCachedDividendData
        .mockReturnValueOnce({ monthlyAmount: 0 })
        .mockReturnValueOnce({ monthlyAmount: 100 })
        .mockReturnValueOnce({ monthlyAmount: 0 });

      const result = calculateTotalMonthlyAssetIncomeFromCache(mockAssets as any);

      expect(result).toBe(100);
    });

    test('should handle empty asset array', () => {
      const result = calculateTotalMonthlyAssetIncomeFromCache([]);

      expect(result).toBe(0);
    });

    test('should log cache operations', () => {
      const Logger = require('../shared/logging/Logger/logger');
      const { getCachedDividendData } = require('@/utils/dividendCacheUtils');
      
      getCachedDividendData
        .mockReturnValueOnce({ monthlyAmount: 100 })
        .mockReturnValueOnce({ monthlyAmount: 200 });

      const twoAssets = mockAssets.slice(0, 2);
      calculateTotalMonthlyAssetIncomeFromCache(twoAssets as any);

      expect(Logger.cache).toHaveBeenCalledWith('Checking cache status for 2 assets');
      expect(Logger.cache).toHaveBeenCalledWith('Asset AAPL: using cached income 100');
      expect(Logger.cache).toHaveBeenCalledWith('Asset GOOGL: using cached income 200');
    });

    test('should log when cache data is unavailable', () => {
      const Logger = require('../shared/logging/Logger/logger');
      const { getCachedDividendData } = require('@/utils/dividendCacheUtils');
      
      getCachedDividendData
        .mockReturnValueOnce({ monthlyAmount: 100 })
        .mockReturnValueOnce(null);

      calculateTotalMonthlyAssetIncomeFromCache(mockAssets as any);

      expect(Logger.cache).toHaveBeenCalledWith('Asset GOOGL: no cached data available');
    });
  });

  describe('invalidateAssetIncomeCache', () => {
    test('should invalidate cache for all provided assets', () => {
      const { invalidateDividendCache } = require('@/utils/dividendCacheUtils');

      invalidateAssetIncomeCache(mockAssets as any);

      expect(invalidateDividendCache).toHaveBeenCalledTimes(3);
      expect(invalidateDividendCache).toHaveBeenCalledWith(mockAssets[0]);
      expect(invalidateDividendCache).toHaveBeenCalledWith(mockAssets[1]);
      expect(invalidateDividendCache).toHaveBeenCalledWith(mockAssets[2]);
    });

    test('should handle empty asset array', () => {
      const { invalidateDividendCache } = require('@/utils/dividendCacheUtils');

      invalidateAssetIncomeCache([]);

      expect(invalidateDividendCache).not.toHaveBeenCalled();
    });

    test('should handle single asset', () => {
      const { invalidateDividendCache } = require('@/utils/dividendCacheUtils');
      const singleAsset = [mockAssets[0]];

      invalidateAssetIncomeCache(singleAsset as any);

      expect(invalidateDividendCache).toHaveBeenCalledTimes(1);
      expect(invalidateDividendCache).toHaveBeenCalledWith(mockAssets[0]);
    });

    test('should log cache invalidation', () => {
      const Logger = require('../shared/logging/Logger/logger');

      invalidateAssetIncomeCache(mockAssets as any);

      expect(Logger.infoService).toHaveBeenCalledWith('Asset income cache invalidated for 3 assets');
    });
  });

  describe('Integration tests', () => {
    test('should handle mixed cache scenarios', () => {
      const { getCachedDividendData } = require('@/utils/dividendCacheUtils');
      
      // First check - partial cache
      getCachedDividendData
        .mockReturnValueOnce({ monthlyAmount: 100 })
        .mockReturnValueOnce(null);

      const areAllCached = areAssetsCached(mockAssets as any);
      expect(areAllCached).toBe(false);

      const totalIncome = calculateTotalMonthlyAssetIncomeFromCache(mockAssets as any);
      expect(totalIncome).toBeNull();

      // Simulate cache population
      getCachedDividendData
        .mockReturnValueOnce({ monthlyAmount: 100 })
        .mockReturnValueOnce({ monthlyAmount: 200 })
        .mockReturnValueOnce({ monthlyAmount: 50 });

      const areAllCachedAfter = areAssetsCached(mockAssets as any);
      expect(areAllCachedAfter).toBe(true);

      const totalIncomeAfter = calculateTotalMonthlyAssetIncomeFromCache(mockAssets as any);
      expect(totalIncomeAfter).toBe(350);
    });

    test('should handle cache invalidation workflow', () => {
      const { getCachedDividendData, invalidateDividendCache } = require('@/utils/dividendCacheUtils');
      
      // Initially cached
      getCachedDividendData.mockReturnValue({ monthlyAmount: 100 });
      
      let areAllCached = areAssetsCached(mockAssets as any);
      expect(areAllCached).toBe(true);

      // Invalidate cache
      invalidateAssetIncomeCache(mockAssets as any);
      expect(invalidateDividendCache).toHaveBeenCalledTimes(3);

      // After invalidation, cache should be empty
      getCachedDividendData.mockReturnValue(null);
      
      areAllCached = areAssetsCached(mockAssets as any);
      expect(areAllCached).toBe(false);
    });

    test('should handle edge cases gracefully', () => {
      const { getCachedDividendData } = require('@/utils/dividendCacheUtils');
      
      // Test with undefined/null assets
      expect(() => areAssetsCached([])).not.toThrow();
      expect(() => calculateTotalMonthlyAssetIncomeFromCache([])).not.toThrow();
      expect(() => invalidateAssetIncomeCache([])).not.toThrow();

      // Test with cached data containing edge values
      getCachedDividendData
        .mockReturnValueOnce({ monthlyAmount: 0 })
        .mockReturnValueOnce({ monthlyAmount: Number.MAX_SAFE_INTEGER })
        .mockReturnValueOnce({ monthlyAmount: 0.01 });

      const result = calculateTotalMonthlyAssetIncomeFromCache(mockAssets as any);
      expect(result).toBe(Number.MAX_SAFE_INTEGER + 0.01);
    });
  });
});