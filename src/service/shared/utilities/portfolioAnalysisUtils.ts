/**
 * Portfolio analysis utilities
 */

export interface PortfolioAsset {
  symbol: string;
  shares: number;
  price: number;
  category: 'stocks' | 'bonds' | 'etf' | 'crypto' | 'real_estate';
  dividendYield?: number;
}

export interface PortfolioAllocation {
  category: string;
  value: number;
  percentage: number;
  count: number;
}

export const portfolioAnalysisUtils = {
  // Portfolio value calculations
  calculateAssetValue: (asset: PortfolioAsset): number => {
    return asset.shares * asset.price;
  },

  calculateTotalPortfolioValue: (assets: PortfolioAsset[]): number => {
    return assets.reduce((total, asset) => {
      return total + portfolioAnalysisUtils.calculateAssetValue(asset);
    }, 0);
  },

  // Portfolio allocation analysis
  calculateAllocationByCategory: (assets: PortfolioAsset[]): PortfolioAllocation[] => {
    const totalValue = portfolioAnalysisUtils.calculateTotalPortfolioValue(assets);
    const categoryMap = new Map<string, { value: number; count: number }>();

    assets.forEach(asset => {
      const value = portfolioAnalysisUtils.calculateAssetValue(asset);
      const existing = categoryMap.get(asset.category) || { value: 0, count: 0 };
      categoryMap.set(asset.category, {
        value: existing.value + value,
        count: existing.count + 1
      });
    });

    return Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      value: data.value,
      percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0,
      count: data.count
    }));
  },

  // Dividend analysis
  calculateDividendIncome: (assets: PortfolioAsset[]): number => {
    return assets.reduce((total, asset) => {
      if (asset.dividendYield) {
        const assetValue = portfolioAnalysisUtils.calculateAssetValue(asset);
        return total + (assetValue * asset.dividendYield / 100);
      }
      return total;
    }, 0);
  },

  calculatePortfolioDividendYield: (assets: PortfolioAsset[]): number => {
    const totalValue = portfolioAnalysisUtils.calculateTotalPortfolioValue(assets);
    const dividendIncome = portfolioAnalysisUtils.calculateDividendIncome(assets);
    
    if (totalValue === 0) return 0;
    return (dividendIncome / totalValue) * 100;
  },

  // Portfolio metrics
  calculateAssetWeights: (assets: PortfolioAsset[]): Map<string, number> => {
    const totalValue = portfolioAnalysisUtils.calculateTotalPortfolioValue(assets);
    const weights = new Map<string, number>();

    assets.forEach(asset => {
      const value = portfolioAnalysisUtils.calculateAssetValue(asset);
      const weight = totalValue > 0 ? (value / totalValue) * 100 : 0;
      weights.set(asset.symbol, weight);
    });

    return weights;
  },

  findTopHoldings: (assets: PortfolioAsset[], limit: number = 10): PortfolioAsset[] => {
    return assets
      .map(asset => ({
        ...asset,
        value: portfolioAnalysisUtils.calculateAssetValue(asset)
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, limit);
  },

  // Risk analysis
  calculateConcentrationRisk: (assets: PortfolioAsset[]): number => {
    const weights = portfolioAnalysisUtils.calculateAssetWeights(assets);
    const weightsArray = Array.from(weights.values());
    
    // Calculate Herfindahl-Hirschman Index (HHI) for concentration
    const hhi = weightsArray.reduce((sum, weight) => {
      return sum + Math.pow(weight, 2);
    }, 0);

    return hhi / 100; // Normalize to 0-100 scale
  },

  checkAllocationBalance: (assets: PortfolioAsset[], targets: Record<string, number>): Record<string, { current: number; target: number; difference: number }> => {
    const allocations = portfolioAnalysisUtils.calculateAllocationByCategory(assets);
    const result: Record<string, { current: number; target: number; difference: number }> = {};

    Object.entries(targets).forEach(([category, target]) => {
      const current = allocations.find(a => a.category === category)?.percentage || 0;
      result[category] = {
        current,
        target,
        difference: current - target
      };
    });

    return result;
  },

  // Rebalancing recommendations
  calculateRebalancingNeeds: (
    assets: PortfolioAsset[], 
    targets: Record<string, number>
  ): { category: string; action: 'buy' | 'sell'; amount: number; percentage: number }[] => {
    const totalValue = portfolioAnalysisUtils.calculateTotalPortfolioValue(assets);
    const balance = portfolioAnalysisUtils.checkAllocationBalance(assets, targets);
    
    return Object.entries(balance)
      .filter(([, data]) => Math.abs(data.difference) > 1) // Only suggest if >1% difference
      .map(([category, data]) => ({
        category,
        action: data.difference > 0 ? 'sell' as const : 'buy' as const,
        amount: Math.abs(data.difference * totalValue / 100),
        percentage: Math.abs(data.difference)
      }))
      .sort((a, b) => b.percentage - a.percentage);
  }
};