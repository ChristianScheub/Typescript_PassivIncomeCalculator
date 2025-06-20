import { Transaction as Asset } from '@/types/domains/assets';
import { Liability } from '@/types/domains/financial';
import { PortfolioRecommendation } from '../interfaces/IAnalyticsService';
import calculatorService from '../../../../financial/calculations/compositeCalculatorService';

export const generateLiabilityRecommendations = (
  assets: Asset[],
  liabilities: Liability[]
): PortfolioRecommendation[] => {
  const recommendations: PortfolioRecommendation[] = [];

  if (liabilities.length === 0) {
    return recommendations;
  }

  // Calculate liability metrics
  const totalAssetValue = calculatorService.calculateTotalAssetValue(assets);
  const totalDebt = calculatorService.calculateTotalDebt(liabilities);
  const debtToAssetRatio = totalAssetValue > 0 ? (totalDebt / totalAssetValue) * 100 : 0;
  const highInterestLiabilities = findHighInterestLiabilities(liabilities);
  const longTermLiabilities = findLongTermLiabilities(liabilities);

  // 23. High Interest Rate
  if (highInterestLiabilities.length > 0) {
    const maxInterestRate = Math.max(...highInterestLiabilities.map(l => l.interestRate || 0));
    recommendations.push({
      id: 'reduce-high-interest-debt',
      category: 'liabilities',
      priority: 'high',
      titleKey: 'recommendations.liabilities.reduceHighInterestDebt.title',
      descriptionKey: 'recommendations.liabilities.reduceHighInterestDebt.description',
      actionCategory: 'liabilities',
      actionSubCategory: 'optimization',
      metadata: { 
        count: highInterestLiabilities.length,
        maxRate: Math.round(maxInterestRate * 100) / 100
      }
    });
  }

  // 24. Accelerate Debt Repayment
  if (longTermLiabilities.length > 0) {
    recommendations.push({
      id: 'accelerate-debt-repayment',
      category: 'liabilities',
      priority: 'medium',
      titleKey: 'recommendations.liabilities.accelerateDebtRepayment.title',
      descriptionKey: 'recommendations.liabilities.accelerateDebtRepayment.description',
      actionCategory: 'liabilities',
      actionSubCategory: 'repayment',
      metadata: { count: longTermLiabilities.length }
    });
  }

  // 25. Debt Consolidation
  if (liabilities.length > 3) {
    recommendations.push({
      id: 'consider-debt-consolidation',
      category: 'liabilities',
      priority: 'medium',
      titleKey: 'recommendations.liabilities.considerDebtConsolidation.title',
      descriptionKey: 'recommendations.liabilities.considerDebtConsolidation.description',
      actionCategory: 'liabilities',
      actionSubCategory: 'consolidation',
      metadata: { count: liabilities.length }
    });
  }

  // 26. Debt-to-Asset Ratio
  if (debtToAssetRatio > 50) {
    recommendations.push({
      id: 'reduce-debt-ratio',
      category: 'liabilities',
      priority: 'high',
      titleKey: 'recommendations.liabilities.reduceDebtRatio.title',
      descriptionKey: 'recommendations.liabilities.reduceDebtRatio.description',
      actionCategory: 'liabilities',
      actionSubCategory: 'management',
      metadata: { currentRatio: Math.round(debtToAssetRatio) }
    });
  }

  return recommendations;
};

// Helper functions
const findHighInterestLiabilities = (liabilities: Liability[]): Liability[] => {
  return liabilities.filter(liability => (liability.interestRate || 0) > 8);
};

const findLongTermLiabilities = (liabilities: Liability[]): Liability[] => {
  return liabilities.filter(liability => {
    if (!liability.startDate || !liability.endDate) return false;
    
    const startDate = new Date(liability.startDate);
    const endDate = new Date(liability.endDate);
    const termInYears = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    
    return termInYears > 20;
  });
};
