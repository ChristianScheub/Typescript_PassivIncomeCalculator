import { calculatePortfolio } from '../domain/portfolio/management/portfolioService/methods/calculatePortfolio';
import { calculateProjectedIncome } from '../domain/portfolio/management/portfolioService/methods/calculateProjectedIncome';
import { getPosition } from '../domain/portfolio/management/portfolioService/methods/getPosition';
import { getPositionTransactions } from '../domain/portfolio/management/portfolioService/methods/getPositionTransactions';

// Mock dependencies
jest.mock('../domain/portfolio/management/portfolioService/portfolioCalculations', () => ({
  calculatePortfolioPositions: jest.fn((assets) => assets.map((asset, index) => ({
    id: `position_${index}`,
    symbol: asset.name || `ASSET_${index}`,
    quantity: asset.quantity || 100,
    value: asset.value || 1000,
    monthlyIncome: 50
  }))),
  calculatePortfolioTotals: jest.fn((positions) => ({
    totalValue: positions.reduce((sum, p) => sum + p.value, 0),
    monthlyIncome: positions.reduce((sum, p) => sum + p.monthlyIncome, 0),
    positionCount: positions.length
  }))
}));

jest.mock('@/utils/transactionCalculations', () => ({
  getCurrentQuantity: jest.fn((transaction) => transaction.quantity || 100)
}));

jest.mock('@service/domain/financial/calculations/compositeCalculatorService', () => ({
  calculateDividendSchedule: jest.fn((dividendInfo, quantity) => ({
    monthlyAmount: (dividendInfo.amount || 1) * quantity,
    annualAmount: (dividendInfo.amount || 1) * quantity * 12
  }))
}));

jest.mock('../shared/logging/Logger/logger', () => ({
  infoService: jest.fn()
}));

describe('Portfolio Service Methods', () => {
  const mockAssets = [
    {
      id: '1',
      name: 'AAPL',
      type: 'stock',
      value: 15000,
      quantity: 100,
      assetDefinitionId: 'def1'
    },
    {
      id: '2',
      name: 'GOOGL',
      type: 'stock',
      value: 140000,
      quantity: 50,
      assetDefinitionId: 'def2'
    }
  ];

  const mockAssetDefinitions = [
    { id: 'def1', symbol: 'AAPL', name: 'Apple Inc.' },
    { id: 'def2', symbol: 'GOOGL', name: 'Alphabet Inc.' }
  ];

  const mockCategories = [
    { id: 'cat1', name: 'Technology', type: 'sector' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculatePortfolio', () => {
    test('should calculate portfolio with assets and definitions', () => {
      const result = calculatePortfolio(
        mockAssets as any,
        mockAssetDefinitions as any,
        mockCategories as any
      );

      expect(result).toBeDefined();
      expect(result.positions).toHaveLength(2);
      expect(result.totals).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    test('should include correct metadata', () => {
      const result = calculatePortfolio(mockAssets as any, mockAssetDefinitions as any);

      expect(result.metadata.assetCount).toBe(2);
      expect(result.metadata.definitionCount).toBe(2);
      expect(result.metadata.positionCount).toBe(2);
      expect(result.metadata.lastCalculated).toBeDefined();
      expect(new Date(result.metadata.lastCalculated)).toBeInstanceOf(Date);
    });

    test('should handle empty assets array', () => {
      const result = calculatePortfolio([], mockAssetDefinitions as any);

      expect(result.positions).toHaveLength(0);
      expect(result.metadata.assetCount).toBe(0);
      expect(result.metadata.positionCount).toBe(0);
    });

    test('should handle missing optional parameters', () => {
      const result = calculatePortfolio(mockAssets as any);

      expect(result).toBeDefined();
      expect(result.positions).toHaveLength(2);
      expect(result.metadata.definitionCount).toBe(0);
    });

    test('should log calculation process', () => {
      const Logger = require('../shared/logging/Logger/logger');
      
      calculatePortfolio(mockAssets as any, mockAssetDefinitions as any);

      expect(Logger.infoService).toHaveBeenCalledWith(
        'Calculating portfolio with 2 assets and 2 definitions'
      );
      expect(Logger.infoService).toHaveBeenCalledWith(
        expect.stringContaining('Portfolio calculated: 2 positions')
      );
    });

    test('should delegate to portfolio calculations correctly', () => {
      const { calculatePortfolioPositions, calculatePortfolioTotals } = require('../domain/portfolio/management/portfolioService/portfolioCalculations');

      calculatePortfolio(
        mockAssets as any,
        mockAssetDefinitions as any,
        mockCategories as any,
        [],
        []
      );

      expect(calculatePortfolioPositions).toHaveBeenCalledWith(
        mockAssets,
        mockAssetDefinitions,
        mockCategories,
        [],
        []
      );
      expect(calculatePortfolioTotals).toHaveBeenCalledWith(
        expect.any(Array)
      );
    });
  });

  describe('calculateProjectedIncome', () => {
    test('should calculate projected income for asset definition', () => {
      const newDividendInfo = {
        amount: 5,
        frequency: 'quarterly'
      };

      const result = calculateProjectedIncome(
        mockAssets as any,
        mockAssetDefinitions as any,
        'def1',
        newDividendInfo
      );

      expect(result).toBe(500); // 5 * 100 (quantity from getCurrentQuantity mock)
    });

    test('should return zero for non-existent asset definition', () => {
      const newDividendInfo = {
        amount: 5,
        frequency: 'quarterly'
      };

      const result = calculateProjectedIncome(
        mockAssets as any,
        mockAssetDefinitions as any,
        'nonexistent',
        newDividendInfo
      );

      expect(result).toBe(0);
    });

    test('should return zero when no dividend frequency', () => {
      const newDividendInfo = {
        amount: 5
        // frequency not provided
      };

      const result = calculateProjectedIncome(
        mockAssets as any,
        mockAssetDefinitions as any,
        'def1',
        newDividendInfo
      );

      expect(result).toBe(0);
    });

    test('should return zero when dividend frequency is none', () => {
      const newDividendInfo = {
        amount: 5,
        frequency: 'none' as any
      };

      const result = calculateProjectedIncome(
        mockAssets as any,
        mockAssetDefinitions as any,
        'def1',
        newDividendInfo
      );

      expect(result).toBe(0);
    });

    test('should handle zero quantity positions', () => {
      const { getCurrentQuantity } = require('@/utils/transactionCalculations');
      getCurrentQuantity.mockReturnValue(0);

      const newDividendInfo = {
        amount: 5,
        frequency: 'quarterly'
      };

      const result = calculateProjectedIncome(
        mockAssets as any,
        mockAssetDefinitions as any,
        'def1',
        newDividendInfo
      );

      expect(result).toBe(0);
    });

    test('should handle infinite monthly amounts gracefully', () => {
      const compositeCalculatorService = require('@service/domain/financial/calculations/compositeCalculatorService');
      compositeCalculatorService.calculateDividendSchedule.mockReturnValue({
        monthlyAmount: Infinity,
        annualAmount: Infinity
      });

      const newDividendInfo = {
        amount: 5,
        frequency: 'quarterly'
      };

      const result = calculateProjectedIncome(
        mockAssets as any,
        mockAssetDefinitions as any,
        'def1',
        newDividendInfo
      );

      expect(result).toBe(0);
    });

    test('should sum quantities from multiple transactions', () => {
      const multipleTransactions = [
        { ...mockAssets[0], quantity: 50 },
        { ...mockAssets[0], quantity: 30, id: '3' },
        { ...mockAssets[0], quantity: 20, id: '4' }
      ];

      const { getCurrentQuantity } = require('@/utils/transactionCalculations');
      getCurrentQuantity.mockImplementation((transaction) => transaction.quantity);

      const newDividendInfo = {
        amount: 1,
        frequency: 'monthly'
      };

      const result = calculateProjectedIncome(
        multipleTransactions as any,
        mockAssetDefinitions as any,
        'def1',
        newDividendInfo
      );

      expect(result).toBe(100); // 1 * (50 + 30 + 20)
    });
  });

  describe('getPosition', () => {
    test('should return position by ID', () => {
      const result = getPosition(
        mockAssets as any,
        mockAssetDefinitions as any,
        'position_0'
      );

      expect(result).toBeDefined();
      expect(result?.id).toBe('position_0');
      expect(result?.symbol).toBe('AAPL');
    });

    test('should return null for non-existent position', () => {
      const result = getPosition(
        mockAssets as any,
        mockAssetDefinitions as any,
        'nonexistent'
      );

      expect(result).toBeNull();
    });

    test('should handle empty assets array', () => {
      const result = getPosition(
        [],
        mockAssetDefinitions as any,
        'position_0'
      );

      expect(result).toBeNull();
    });

    test('should pass optional category parameters', () => {
      const { calculatePortfolioPositions } = require('../domain/portfolio/management/portfolioService/portfolioCalculations');

      getPosition(
        mockAssets as any,
        mockAssetDefinitions as any,
        'position_0',
        mockCategories as any,
        [],
        []
      );

      expect(calculatePortfolioPositions).toHaveBeenCalledWith(
        mockAssets,
        mockAssetDefinitions,
        mockCategories,
        [],
        []
      );
    });

    test('should use default empty arrays for optional parameters', () => {
      const { calculatePortfolioPositions } = require('../domain/portfolio/management/portfolioService/portfolioCalculations');

      getPosition(
        mockAssets as any,
        mockAssetDefinitions as any,
        'position_0'
      );

      expect(calculatePortfolioPositions).toHaveBeenCalledWith(
        mockAssets,
        mockAssetDefinitions,
        [],
        [],
        []
      );
    });
  });

  describe('getPositionTransactions', () => {
    test('should return transactions for asset definition ID', () => {
      const result = getPositionTransactions(mockAssets as any, 'def1');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('AAPL');
      expect(result[0].assetDefinitionId).toBe('def1');
    });

    test('should return empty array for non-existent position', () => {
      const result = getPositionTransactions(mockAssets as any, 'nonexistent');

      expect(result).toHaveLength(0);
    });

    test('should handle assets without assetDefinitionId using fallback', () => {
      const assetsWithoutDefId = [
        {
          id: '1',
          name: 'Bitcoin',
          type: 'crypto',
          value: 45000
          // no assetDefinitionId
        },
        {
          id: '2',
          name: 'Bitcoin',
          type: 'crypto',
          value: 46000
          // no assetDefinitionId
        }
      ];

      const result = getPositionTransactions(assetsWithoutDefId as any, 'fallback_Bitcoin_crypto');

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Bitcoin');
      expect(result[1].name).toBe('Bitcoin');
    });

    test('should return multiple transactions for same position', () => {
      const multipleTransactions = [
        { ...mockAssets[0] },
        { ...mockAssets[0], id: '3', value: 16000 },
        { ...mockAssets[1] }
      ];

      const result = getPositionTransactions(multipleTransactions as any, 'def1');

      expect(result).toHaveLength(2);
      expect(result.every(t => t.assetDefinitionId === 'def1')).toBe(true);
    });

    test('should handle empty assets array', () => {
      const result = getPositionTransactions([], 'def1');

      expect(result).toHaveLength(0);
    });

    test('should filter by exact position ID match', () => {
      const assetsWithSimilarIds = [
        { ...mockAssets[0], assetDefinitionId: 'def1' },
        { ...mockAssets[0], id: '3', assetDefinitionId: 'def10' },
        { ...mockAssets[0], id: '4', assetDefinitionId: 'def1_similar' }
      ];

      const result = getPositionTransactions(assetsWithSimilarIds as any, 'def1');

      expect(result).toHaveLength(1);
      expect(result[0].assetDefinitionId).toBe('def1');
    });
  });

  describe('Integration tests', () => {
    test('should work together for complete portfolio workflow', () => {
      // Calculate portfolio
      const portfolio = calculatePortfolio(mockAssets as any, mockAssetDefinitions as any);
      
      // Get specific position
      const position = getPosition(mockAssets as any, mockAssetDefinitions as any, 'position_0');
      
      // Get position transactions
      const transactions = getPositionTransactions(mockAssets as any, 'def1');
      
      // Calculate projected income
      const projectedIncome = calculateProjectedIncome(
        mockAssets as any,
        mockAssetDefinitions as any,
        'def1',
        { amount: 2, frequency: 'quarterly' }
      );

      expect(portfolio.positions).toHaveLength(2);
      expect(position).toBeDefined();
      expect(transactions).toHaveLength(1);
      expect(projectedIncome).toBe(200);
    });

    test('should handle edge cases consistently', () => {
      const emptyAssets: any[] = [];
      
      const portfolio = calculatePortfolio(emptyAssets, []);
      const position = getPosition(emptyAssets, [], 'any');
      const transactions = getPositionTransactions(emptyAssets, 'any');

      expect(portfolio.positions).toHaveLength(0);
      expect(position).toBeNull();
      expect(transactions).toHaveLength(0);
    });
  });
});