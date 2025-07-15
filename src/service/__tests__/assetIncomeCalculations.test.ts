import { 
  getStockDividendBreakdown,
  getInterestBreakdown,
  getRealEstateBreakdown,
  calculateAssetIncomeBreakdown
} from '../shared/calculations/assetIncomeCalculations';

// Mock dependencies
jest.mock('../shared/logging/Logger/logger', () => ({
  infoService: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
}));

jest.mock('../../utils/dividendCacheUtils', () => ({
  getCachedDividendData: jest.fn()
}));

jest.mock('../domain/financial/income/incomeCalculatorService/methods/calculatePayment', () => ({
  calculateDividendSchedule: jest.fn((dividendInfo, quantity) => ({
    monthlyAmount: (dividendInfo.amount * quantity) / 12,
    annualAmount: dividendInfo.amount * quantity
  })),
  calculateDividendForMonth: jest.fn((dividendInfo, quantity, month) => {
    // Simple mock - return monthly amount
    return (dividendInfo.amount * quantity) / 12;
  })
}));

jest.mock('../../utils/transactionCalculations', () => ({
  getCurrentQuantity: jest.fn((asset) => asset.quantity || 100)
}));

describe('AssetIncomeCalculations', () => {
  describe('getStockDividendBreakdown', () => {
    test('should calculate stock dividend breakdown correctly', () => {
      const mockStockAsset = {
        type: 'stock',
        quantity: 100,
        assetDefinition: {
          dividendInfo: {
            amount: 12, // $12 annual dividend per share
            frequency: 'quarterly'
          }
        }
      };

      const result = getStockDividendBreakdown(mockStockAsset as any);

      expect(result).toBeDefined();
      expect(result?.monthlyAmount).toBe(100); // (12 * 100) / 12
      expect(result?.annualAmount).toBe(1200); // 12 * 100
      expect(result?.monthlyBreakdown).toBeDefined();
      expect(Object.keys(result?.monthlyBreakdown || {})).toHaveLength(12);
    });

    test('should return null for non-stock assets', () => {
      const mockBondAsset = {
        type: 'bond',
        value: 10000
      };

      const result = getStockDividendBreakdown(mockBondAsset as any);

      expect(result).toBeNull();
    });

    test('should return null when no dividend info exists', () => {
      const mockStockAsset = {
        type: 'stock',
        quantity: 100,
        assetDefinition: {}
      };

      const result = getStockDividendBreakdown(mockStockAsset as any);

      expect(result).toBeNull();
    });

    test('should return null when quantity is zero or negative', () => {
      const { getCurrentQuantity } = require('../../../utils/transactionCalculations');
      getCurrentQuantity.mockReturnValue(0);

      const mockStockAsset = {
        type: 'stock',
        assetDefinition: {
          dividendInfo: {
            amount: 12,
            frequency: 'quarterly'
          }
        }
      };

      const result = getStockDividendBreakdown(mockStockAsset as any);

      expect(result).toBeNull();
    });

    test('should handle infinite or NaN values gracefully', () => {
      const { calculateDividendSchedule } = require('../domain/financial/income/incomeCalculatorService/methods/calculatePayment');
      calculateDividendSchedule.mockReturnValue({
        monthlyAmount: Infinity,
        annualAmount: NaN
      });

      const mockStockAsset = {
        type: 'stock',
        quantity: 100,
        assetDefinition: {
          dividendInfo: {
            amount: 12,
            frequency: 'quarterly'
          }
        }
      };

      const result = getStockDividendBreakdown(mockStockAsset as any);

      expect(result).toBeDefined();
      expect(result?.monthlyAmount).toBe(0);
      expect(result?.annualAmount).toBe(0);
    });
  });

  describe('getInterestBreakdown', () => {
    test('should calculate bond interest breakdown correctly', () => {
      const mockBondAsset = {
        type: 'bond',
        value: 10000,
        assetDefinition: {
          bondInfo: {
            interestRate: 5.0 // 5% annual interest
          }
        }
      };

      const result = getInterestBreakdown(mockBondAsset as any);

      expect(result).toBeDefined();
      expect(result?.monthlyAmount).toBeCloseTo(41.67, 2); // (5% * 10000) / 12
      expect(result?.annualAmount).toBe(500); // 5% * 10000
      expect(result?.monthlyBreakdown).toBeDefined();
      expect(Object.keys(result?.monthlyBreakdown || {})).toHaveLength(12);
      
      // Check that all months have the same amount
      const monthlyValues = Object.values(result?.monthlyBreakdown || {});
      monthlyValues.forEach(value => {
        expect(value).toBeCloseTo(41.67, 2);
      });
    });

    test('should calculate cash interest breakdown correctly', () => {
      const mockCashAsset = {
        type: 'cash',
        value: 50000,
        assetDefinition: {
          bondInfo: {
            interestRate: 2.5 // 2.5% annual interest
          }
        }
      };

      const result = getInterestBreakdown(mockCashAsset as any);

      expect(result).toBeDefined();
      expect(result?.monthlyAmount).toBeCloseTo(104.17, 2); // (2.5% * 50000) / 12
      expect(result?.annualAmount).toBe(1250); // 2.5% * 50000
    });

    test('should return null for non-bond/cash assets', () => {
      const mockStockAsset = {
        type: 'stock',
        value: 10000
      };

      const result = getInterestBreakdown(mockStockAsset as any);

      expect(result).toBeNull();
    });

    test('should return null when interest rate is undefined', () => {
      const mockBondAsset = {
        type: 'bond',
        value: 10000,
        assetDefinition: {
          bondInfo: {}
        }
      };

      const result = getInterestBreakdown(mockBondAsset as any);

      expect(result).toBeNull();
    });

    test('should return null when asset value is missing', () => {
      const mockBondAsset = {
        type: 'bond',
        assetDefinition: {
          bondInfo: {
            interestRate: 5.0
          }
        }
      };

      const result = getInterestBreakdown(mockBondAsset as any);

      expect(result).toBeNull();
    });
  });

  describe('getRealEstateBreakdown', () => {
    test('should calculate real estate rental breakdown correctly', () => {
      const mockRealEstateAsset = {
        type: 'real_estate',
        assetDefinition: {
          rentalInfo: {
            baseRent: 2500 // $2500 monthly rent
          }
        }
      };

      const result = getRealEstateBreakdown(mockRealEstateAsset as any);

      expect(result).toBeDefined();
      expect(result?.monthlyAmount).toBe(2500);
      expect(result?.annualAmount).toBe(30000); // 2500 * 12
      expect(result?.monthlyBreakdown).toBeDefined();
      expect(Object.keys(result?.monthlyBreakdown || {})).toHaveLength(12);
      
      // Check that all months have the same rent amount
      const monthlyValues = Object.values(result?.monthlyBreakdown || {});
      monthlyValues.forEach(value => {
        expect(value).toBe(2500);
      });
    });

    test('should return null for non-real-estate assets', () => {
      const mockStockAsset = {
        type: 'stock',
        value: 10000
      };

      const result = getRealEstateBreakdown(mockStockAsset as any);

      expect(result).toBeNull();
    });

    test('should return null when rental info is missing', () => {
      const mockRealEstateAsset = {
        type: 'real_estate',
        assetDefinition: {}
      };

      const result = getRealEstateBreakdown(mockRealEstateAsset as any);

      expect(result).toBeNull();
    });

    test('should return null when base rent is undefined', () => {
      const mockRealEstateAsset = {
        type: 'real_estate',
        assetDefinition: {
          rentalInfo: {}
        }
      };

      const result = getRealEstateBreakdown(mockRealEstateAsset as any);

      expect(result).toBeNull();
    });

    test('should handle infinite rental amounts gracefully', () => {
      const mockRealEstateAsset = {
        type: 'real_estate',
        assetDefinition: {
          rentalInfo: {
            baseRent: Infinity
          }
        }
      };

      const result = getRealEstateBreakdown(mockRealEstateAsset as any);

      expect(result).toBeDefined();
      expect(result?.monthlyAmount).toBe(0);
      expect(result?.annualAmount).toBe(0);
    });
  });

  describe('calculateAssetIncomeBreakdown', () => {
    test('should return stock dividend breakdown for stocks', () => {
      const mockStockAsset = {
        type: 'stock',
        quantity: 100,
        assetDefinition: {
          dividendInfo: {
            amount: 12,
            frequency: 'quarterly'
          }
        }
      };

      const result = calculateAssetIncomeBreakdown(mockStockAsset as any);

      expect(result).toBeDefined();
      expect(result.monthlyAmount).toBe(100);
      expect(result.annualAmount).toBe(1200);
    });

    test('should return interest breakdown for bonds', () => {
      const mockBondAsset = {
        type: 'bond',
        value: 10000,
        assetDefinition: {
          bondInfo: {
            interestRate: 5.0
          }
        }
      };

      const result = calculateAssetIncomeBreakdown(mockBondAsset as any);

      expect(result).toBeDefined();
      expect(result.monthlyAmount).toBeCloseTo(41.67, 2);
      expect(result.annualAmount).toBe(500);
    });

    test('should return rental breakdown for real estate', () => {
      const mockRealEstateAsset = {
        type: 'real_estate',
        assetDefinition: {
          rentalInfo: {
            baseRent: 2500
          }
        }
      };

      const result = calculateAssetIncomeBreakdown(mockRealEstateAsset as any);

      expect(result).toBeDefined();
      expect(result.monthlyAmount).toBe(2500);
      expect(result.annualAmount).toBe(30000);
    });

    test('should return zero breakdown for assets with no income', () => {
      const mockAsset = {
        type: 'other',
        value: 5000
      };

      const result = calculateAssetIncomeBreakdown(mockAsset as any);

      expect(result).toBeDefined();
      expect(result.monthlyAmount).toBe(0);
      expect(result.annualAmount).toBe(0);
      expect(result.monthlyBreakdown).toEqual({});
    });

    test('should prioritize specific income types correctly', () => {
      // Should prefer stock dividend over other types
      const mockAsset = {
        type: 'stock',
        quantity: 100,
        value: 10000,
        assetDefinition: {
          dividendInfo: {
            amount: 12,
            frequency: 'quarterly'
          },
          bondInfo: {
            interestRate: 5.0
          }
        }
      };

      const result = calculateAssetIncomeBreakdown(mockAsset as any);

      expect(result).toBeDefined();
      // Should use dividend calculation, not interest
      expect(result.monthlyAmount).toBe(100); // dividend calculation
      expect(result.annualAmount).toBe(1200);
    });
  });

  describe('Integration tests', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should handle portfolio of mixed asset types', () => {
      const assets = [
        {
          type: 'stock',
          quantity: 50,
          assetDefinition: {
            dividendInfo: { amount: 24, frequency: 'quarterly' }
          }
        },
        {
          type: 'bond',
          value: 20000,
          assetDefinition: {
            bondInfo: { interestRate: 4.0 }
          }
        },
        {
          type: 'real_estate',
          assetDefinition: {
            rentalInfo: { baseRent: 3000 }
          }
        }
      ];

      const results = assets.map(asset => calculateAssetIncomeBreakdown(asset as any));

      expect(results).toHaveLength(3);
      expect(results[0].monthlyAmount).toBe(100); // Stock dividend
      expect(results[1].monthlyAmount).toBeCloseTo(66.67, 2); // Bond interest
      expect(results[2].monthlyAmount).toBe(3000); // Real estate rent

      // Calculate total monthly income
      const totalMonthlyIncome = results.reduce((sum, result) => sum + result.monthlyAmount, 0);
      expect(totalMonthlyIncome).toBeCloseTo(3166.67, 2);
    });
  });
});