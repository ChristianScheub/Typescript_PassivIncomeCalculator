/**
 * Tests for PortfolioAnalysisUtils
 * Comprehensive tests for portfolio analysis functions
 */

import { describe, test, expect } from '@jest/globals';
import { 
  portfolioAnalysisUtils,
  PortfolioAsset
} from '../shared/utilities/portfolioAnalysisUtils';

describe('PortfolioAnalysisUtils', () => {
  const mockAssets: PortfolioAsset[] = [
    { symbol: 'AAPL', shares: 100, price: 150, category: 'stocks', dividendYield: 2.0 },
    { symbol: 'GOOGL', shares: 50, price: 2800, category: 'stocks', dividendYield: 0 },
    { symbol: 'BND', shares: 200, price: 85, category: 'bonds', dividendYield: 3.5 },
    { symbol: 'VTI', shares: 75, price: 220, category: 'etf', dividendYield: 1.8 },
    { symbol: 'BTC', shares: 2, price: 45000, category: 'crypto' },
  ];

  describe('Portfolio Value Calculations', () => {
    test('should calculate individual asset value correctly', () => {
      const asset = mockAssets[0]; // AAPL
      const value = portfolioAnalysisUtils.calculateAssetValue(asset);
      expect(value).toBe(15000); // 100 * 150
    });

    test('should calculate total portfolio value correctly', () => {
      const totalValue = portfolioAnalysisUtils.calculateTotalPortfolioValue(mockAssets);
      // AAPL: 15000, GOOGL: 140000, BND: 17000, VTI: 16500, BTC: 90000
      expect(totalValue).toBe(278500);
    });

    test('should handle empty portfolio', () => {
      const totalValue = portfolioAnalysisUtils.calculateTotalPortfolioValue([]);
      expect(totalValue).toBe(0);
    });
  });

  describe('Portfolio Allocation Analysis', () => {
    test('should calculate allocation by category correctly', () => {
      const allocations = portfolioAnalysisUtils.calculateAllocationByCategory(mockAssets);
      
      expect(allocations).toHaveLength(4); // stocks, bonds, etf, crypto
      
      const stocksAllocation = allocations.find(a => a.category === 'stocks');
      expect(stocksAllocation?.value).toBe(155000); // AAPL + GOOGL
      expect(stocksAllocation?.percentage).toBeCloseTo(55.65, 2); // 155000/278500 * 100
      expect(stocksAllocation?.count).toBe(2);

      const bondsAllocation = allocations.find(a => a.category === 'bonds');
      expect(bondsAllocation?.value).toBe(17000);
      expect(bondsAllocation?.percentage).toBeCloseTo(6.10, 2);
      expect(bondsAllocation?.count).toBe(1);
    });

    test('should handle zero total value', () => {
      const zeroAssets: PortfolioAsset[] = [
        { symbol: 'ZERO', shares: 0, price: 100, category: 'stocks' }
      ];
      const allocations = portfolioAnalysisUtils.calculateAllocationByCategory(zeroAssets);
      expect(allocations[0].percentage).toBe(0);
    });
  });

  describe('Dividend Analysis', () => {
    test('should calculate total dividend income correctly', () => {
      const dividendIncome = portfolioAnalysisUtils.calculateDividendIncome(mockAssets);
      // AAPL: 15000 * 0.02 = 300
      // GOOGL: 140000 * 0 = 0
      // BND: 17000 * 0.035 = 595
      // VTI: 16500 * 0.018 = 297
      // BTC: no dividendYield = 0
      expect(dividendIncome).toBeCloseTo(1192, 2);
    });

    test('should calculate portfolio dividend yield correctly', () => {
      const yield = portfolioAnalysisUtils.calculatePortfolioDividendYield(mockAssets);
      const expectedYield = (1192 / 278500) * 100;
      expect(yield).toBeCloseTo(expectedYield, 2);
    });

    test('should handle zero portfolio value for dividend yield', () => {
      const emptyAssets: PortfolioAsset[] = [];
      const yield = portfolioAnalysisUtils.calculatePortfolioDividendYield(emptyAssets);
      expect(yield).toBe(0);
    });
  });

  describe('Portfolio Metrics', () => {
    test('should calculate asset weights correctly', () => {
      const weights = portfolioAnalysisUtils.calculateAssetWeights(mockAssets);
      
      expect(weights.get('AAPL')).toBeCloseTo(5.39, 2); // 15000/278500 * 100
      expect(weights.get('GOOGL')).toBeCloseTo(50.27, 2); // 140000/278500 * 100
      expect(weights.get('BTC')).toBeCloseTo(32.32, 2); // 90000/278500 * 100
      
      // All weights should sum to 100%
      const totalWeight = Array.from(weights.values()).reduce((sum, weight) => sum + weight, 0);
      expect(totalWeight).toBeCloseTo(100, 1);
    });

    test('should find top holdings correctly', () => {
      const topHoldings = portfolioAnalysisUtils.findTopHoldings(mockAssets, 3);
      
      expect(topHoldings).toHaveLength(3);
      expect(topHoldings[0].symbol).toBe('GOOGL'); // Highest value
      expect(topHoldings[1].symbol).toBe('BTC'); // Second highest
      expect(topHoldings[2].symbol).toBe('VTI'); // Third highest
    });

    test('should limit top holdings to available assets', () => {
      const topHoldings = portfolioAnalysisUtils.findTopHoldings(mockAssets, 10);
      expect(topHoldings).toHaveLength(5); // Only 5 assets available
    });
  });

  describe('Risk Analysis', () => {
    test('should calculate concentration risk correctly', () => {
      const concentrationRisk = portfolioAnalysisUtils.calculateConcentrationRisk(mockAssets);
      
      // With GOOGL being ~50% of portfolio, there should be significant concentration
      expect(concentrationRisk).toBeGreaterThan(30); // High concentration
      expect(concentrationRisk).toBeLessThan(100); // But not completely concentrated
    });

    test('should show low concentration for balanced portfolio', () => {
      const balancedAssets: PortfolioAsset[] = [
        { symbol: 'A', shares: 100, price: 20, category: 'stocks' },
        { symbol: 'B', shares: 100, price: 20, category: 'stocks' },
        { symbol: 'C', shares: 100, price: 20, category: 'stocks' },
        { symbol: 'D', shares: 100, price: 20, category: 'stocks' },
        { symbol: 'E', shares: 100, price: 20, category: 'stocks' }
      ];
      
      const concentrationRisk = portfolioAnalysisUtils.calculateConcentrationRisk(balancedAssets);
      expect(concentrationRisk).toBeLessThan(25); // Low concentration for equally weighted
    });

    test('should check allocation balance correctly', () => {
      const targets = { stocks: 60, bonds: 20, etf: 10, crypto: 10 };
      const balance = portfolioAnalysisUtils.checkAllocationBalance(mockAssets, targets);
      
      expect(balance.stocks.target).toBe(60);
      expect(balance.stocks.current).toBeCloseTo(55.65, 2);
      expect(balance.stocks.difference).toBeCloseTo(-4.35, 2); // Under-allocated
      
      expect(balance.crypto.target).toBe(10);
      expect(balance.crypto.current).toBeCloseTo(32.32, 2);
      expect(balance.crypto.difference).toBeCloseTo(22.32, 2); // Over-allocated
    });
  });

  describe('Rebalancing Recommendations', () => {
    test('should provide rebalancing recommendations', () => {
      const targets = { stocks: 60, bonds: 20, etf: 15, crypto: 5 };
      const recommendations = portfolioAnalysisUtils.calculateRebalancingNeeds(mockAssets, targets);
      
      // Should suggest selling crypto (over-allocated) and buying stocks/etf/bonds
      const cryptoRec = recommendations.find(r => r.category === 'crypto');
      expect(cryptoRec?.action).toBe('sell');
      expect(cryptoRec?.percentage).toBeGreaterThan(20); // Significantly over-allocated
      
      const stocksRec = recommendations.find(r => r.category === 'stocks');
      expect(stocksRec?.action).toBe('buy');
    });

    test('should not recommend changes for small differences', () => {
      const targets = { stocks: 56, bonds: 6, etf: 6, crypto: 32 }; // Close to current
      const recommendations = portfolioAnalysisUtils.calculateRebalancingNeeds(mockAssets, targets);
      
      // Should have fewer recommendations due to small differences
      expect(recommendations.length).toBeLessThan(4);
    });

    test('should sort recommendations by percentage difference', () => {
      const targets = { stocks: 80, bonds: 5, etf: 5, crypto: 10 };
      const recommendations = portfolioAnalysisUtils.calculateRebalancingNeeds(mockAssets, targets);
      
      // Should be sorted by percentage difference (descending)
      for (let i = 1; i < recommendations.length; i++) {
        expect(recommendations[i-1].percentage).toBeGreaterThanOrEqual(recommendations[i].percentage);
      }
    });
  });

  describe('Integration Tests', () => {
    test('should provide comprehensive portfolio analysis', () => {
      const totalValue = portfolioAnalysisUtils.calculateTotalPortfolioValue(mockAssets);
      const allocations = portfolioAnalysisUtils.calculateAllocationByCategory(mockAssets);
      const dividendIncome = portfolioAnalysisUtils.calculateDividendIncome(mockAssets);
      const dividendYield = portfolioAnalysisUtils.calculatePortfolioDividendYield(mockAssets);
      const topHoldings = portfolioAnalysisUtils.findTopHoldings(mockAssets, 3);
      const concentrationRisk = portfolioAnalysisUtils.calculateConcentrationRisk(mockAssets);
      
      // Verify all calculations are consistent
      expect(totalValue).toBeGreaterThan(0);
      expect(allocations.length).toBeGreaterThan(0);
      expect(dividendIncome).toBeGreaterThan(0);
      expect(dividendYield).toBeGreaterThan(0);
      expect(topHoldings.length).toBe(3);
      expect(concentrationRisk).toBeGreaterThan(0);
      
      // Verify allocations sum to 100%
      const totalPercentage = allocations.reduce((sum, alloc) => sum + alloc.percentage, 0);
      expect(totalPercentage).toBeCloseTo(100, 1);
      
      // Verify dividend calculations are consistent
      const manualDividendYield = (dividendIncome / totalValue) * 100;
      expect(dividendYield).toBeCloseTo(manualDividendYield, 2);
    });

    test('should handle edge cases gracefully', () => {
      const edgeCaseAssets: PortfolioAsset[] = [
        { symbol: 'ZERO', shares: 0, price: 100, category: 'stocks' },
        { symbol: 'FREE', shares: 100, price: 0, category: 'stocks' }
      ];
      
      const totalValue = portfolioAnalysisUtils.calculateTotalPortfolioValue(edgeCaseAssets);
      const allocations = portfolioAnalysisUtils.calculateAllocationByCategory(edgeCaseAssets);
      const dividendIncome = portfolioAnalysisUtils.calculateDividendIncome(edgeCaseAssets);
      
      expect(totalValue).toBe(0);
      expect(allocations[0].percentage).toBe(0);
      expect(dividendIncome).toBe(0);
    });
  });
});