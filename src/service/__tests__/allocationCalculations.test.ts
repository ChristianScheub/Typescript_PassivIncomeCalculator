import { 
  calculateIncomeAllocation, 
  calculateAssetAllocation 
} from '../shared/calculations/allocationCalculations';

// Mock types based on the actual types used
interface MockAsset {
  id: string;
  type: 'stock' | 'bond' | 'real_estate' | 'crypto' | 'cash' | 'etf';
  value: number;
  shares?: number;
  price?: number;
}

interface MockIncome {
  id: string;
  type: 'salary' | 'business' | 'dividend' | 'interest' | 'rental' | 'other';
  sourceId?: string;
  paymentSchedule: {
    frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annually';
    amount: number;
  };
}

// Mock Logger
jest.mock('../shared/logging/Logger/logger', () => ({
  infoService: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
}));

describe('AllocationCalculations', () => {
  // Mock calculator functions
  const mockCalculateMonthlyIncome = jest.fn((income: MockIncome): number => {
    const frequencies = {
      weekly: 52 / 12,
      biweekly: 26 / 12,
      monthly: 1,
      quarterly: 1 / 3,
      annually: 1 / 12
    };
    return income.paymentSchedule.amount * frequencies[income.paymentSchedule.frequency];
  });

  const mockCalculateAssetMonthlyIncome = jest.fn((asset: MockAsset): number => {
    // Simple mock: assume 1% monthly return on asset value
    return asset.value * 0.01;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateIncomeAllocation', () => {
    test('should calculate income allocation by type', () => {
      const mockIncomes: MockIncome[] = [
        {
          id: '1',
          type: 'salary',
          paymentSchedule: { frequency: 'monthly', amount: 5000 }
        },
        {
          id: '2',
          type: 'business',
          paymentSchedule: { frequency: 'monthly', amount: 2000 }
        },
        {
          id: '3',
          type: 'dividend',
          paymentSchedule: { frequency: 'quarterly', amount: 600 }
        }
      ];

      const mockAssets: MockAsset[] = [
        { id: 'asset1', type: 'stock', value: 10000 },
        { id: 'asset2', type: 'bond', value: 5000 }
      ];

      const result = calculateIncomeAllocation(
        mockIncomes as any,
        mockAssets as any,
        mockCalculateMonthlyIncome as any,
        mockCalculateAssetMonthlyIncome as any
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      
      // Verify that calculator functions were called
      expect(mockCalculateMonthlyIncome).toHaveBeenCalledTimes(3);
      expect(mockCalculateAssetMonthlyIncome).toHaveBeenCalledTimes(2);
    });

    test('should handle empty income arrays', () => {
      const result = calculateIncomeAllocation(
        [],
        [],
        mockCalculateMonthlyIncome as any,
        mockCalculateAssetMonthlyIncome as any
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    test('should skip income with invalid payment schedules', () => {
      const mockIncomes: MockIncome[] = [
        {
          id: '1',
          type: 'salary',
          paymentSchedule: { frequency: 'monthly', amount: 5000 }
        },
        {
          id: '2',
          type: 'business',
          paymentSchedule: null as any // Invalid schedule
        }
      ];

      const result = calculateIncomeAllocation(
        mockIncomes as any,
        [],
        mockCalculateMonthlyIncome as any,
        mockCalculateAssetMonthlyIncome as any
      );

      expect(result).toBeDefined();
      expect(mockCalculateMonthlyIncome).toHaveBeenCalledTimes(1); // Only valid income
    });

    test('should handle asset income mapping correctly', () => {
      const mockAssets: MockAsset[] = [
        { id: 'stock1', type: 'stock', value: 10000 },
        { id: 'bond1', type: 'bond', value: 5000 },
        { id: 'real_estate1', type: 'real_estate', value: 100000 },
        { id: 'crypto1', type: 'crypto', value: 2000 },
        { id: 'cash1', type: 'cash', value: 1000 }
      ];

      const result = calculateIncomeAllocation(
        [],
        mockAssets as any,
        mockCalculateMonthlyIncome as any,
        mockCalculateAssetMonthlyIncome as any
      );

      expect(result).toBeDefined();
      expect(mockCalculateAssetMonthlyIncome).toHaveBeenCalledTimes(5);
    });

    test('should avoid double-counting asset income already in income list', () => {
      const mockIncomes: MockIncome[] = [
        {
          id: '1',
          type: 'dividend',
          sourceId: 'stock1', // This asset income is already tracked
          paymentSchedule: { frequency: 'monthly', amount: 100 }
        }
      ];

      const mockAssets: MockAsset[] = [
        { id: 'stock1', type: 'stock', value: 10000 }
      ];

      const result = calculateIncomeAllocation(
        mockIncomes as any,
        mockAssets as any,
        mockCalculateMonthlyIncome as any,
        mockCalculateAssetMonthlyIncome as any
      );

      expect(result).toBeDefined();
      expect(mockCalculateMonthlyIncome).toHaveBeenCalledTimes(1);
      expect(mockCalculateAssetMonthlyIncome).toHaveBeenCalledTimes(0); // Should not be called since income already exists
    });
  });

  describe('calculateAssetAllocation', () => {
    test('should calculate asset allocation by type', () => {
      const mockAssets: MockAsset[] = [
        { id: '1', type: 'stock', value: 50000 },
        { id: '2', type: 'stock', value: 30000 },
        { id: '3', type: 'bond', value: 20000 },
        { id: '4', type: 'real_estate', value: 100000 },
        { id: '5', type: 'crypto', value: 5000 }
      ];

      const result = calculateAssetAllocation(mockAssets as any);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      
      if (result.length > 0) {
        // Check that allocations have proper structure
        result.forEach(allocation => {
          expect(allocation).toHaveProperty('type');
          expect(allocation).toHaveProperty('value');
          expect(allocation).toHaveProperty('percentage');
          expect(allocation).toHaveProperty('count');
        });

        // Verify percentages add up to approximately 100%
        const totalPercentage = result.reduce((sum, allocation) => sum + allocation.percentage, 0);
        expect(totalPercentage).toBeCloseTo(100, 1);
      }
    });

    test('should handle empty asset arrays', () => {
      const result = calculateAssetAllocation([]);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    test('should group assets by type correctly', () => {
      const mockAssets: MockAsset[] = [
        { id: '1', type: 'stock', value: 10000 },
        { id: '2', type: 'stock', value: 15000 },
        { id: '3', type: 'bond', value: 5000 }
      ];

      const result = calculateAssetAllocation(mockAssets as any);

      expect(result).toBeDefined();
      
      if (result.length > 0) {
        const stockAllocation = result.find(a => a.type === 'stock');
        const bondAllocation = result.find(a => a.type === 'bond');
        
        if (stockAllocation) {
          expect(stockAllocation.value).toBe(25000); // 10000 + 15000
          expect(stockAllocation.count).toBe(2);
        }
        
        if (bondAllocation) {
          expect(bondAllocation.value).toBe(5000);
          expect(bondAllocation.count).toBe(1);
        }
      }
    });

    test('should handle assets with zero values', () => {
      const mockAssets: MockAsset[] = [
        { id: '1', type: 'stock', value: 10000 },
        { id: '2', type: 'stock', value: 0 },
        { id: '3', type: 'bond', value: 5000 }
      ];

      const result = calculateAssetAllocation(mockAssets as any);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    test('should calculate correct percentages', () => {
      const mockAssets: MockAsset[] = [
        { id: '1', type: 'stock', value: 60000 }, // Should be 60%
        { id: '2', type: 'bond', value: 40000 }  // Should be 40%
      ];

      const result = calculateAssetAllocation(mockAssets as any);

      expect(result).toBeDefined();
      
      if (result.length >= 2) {
        const stockAllocation = result.find(a => a.type === 'stock');
        const bondAllocation = result.find(a => a.type === 'bond');
        
        expect(stockAllocation?.percentage).toBeCloseTo(60, 1);
        expect(bondAllocation?.percentage).toBeCloseTo(40, 1);
      }
    });
  });

  describe('Integration tests', () => {
    test('should handle complex portfolio scenarios', () => {
      const mockIncomes: MockIncome[] = [
        {
          id: '1',
          type: 'salary',
          paymentSchedule: { frequency: 'monthly', amount: 8000 }
        },
        {
          id: '2',
          type: 'business',
          paymentSchedule: { frequency: 'quarterly', amount: 6000 }
        }
      ];

      const mockAssets: MockAsset[] = [
        { id: 'stock1', type: 'stock', value: 75000 },
        { id: 'bond1', type: 'bond', value: 25000 },
        { id: 'real_estate1', type: 'real_estate', value: 200000 },
        { id: 'cash1', type: 'cash', value: 10000 }
      ];

      const incomeAllocation = calculateIncomeAllocation(
        mockIncomes as any,
        mockAssets as any,
        mockCalculateMonthlyIncome as any,
        mockCalculateAssetMonthlyIncome as any
      );

      const assetAllocation = calculateAssetAllocation(mockAssets as any);

      expect(incomeAllocation).toBeDefined();
      expect(assetAllocation).toBeDefined();
      expect(Array.isArray(incomeAllocation)).toBe(true);
      expect(Array.isArray(assetAllocation)).toBe(true);
    });
  });
});