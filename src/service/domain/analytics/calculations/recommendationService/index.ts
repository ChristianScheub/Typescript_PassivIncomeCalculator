import { Transaction as Asset } from '@/types/domains/assets/';
import { Income, Expense, Liability } from '@/types/domains/financial/';
import { PortfolioRecommendation } from '@/types/domains/analytics';
import { IRecommendationService } from './recommendationService.interface';
import { calculatorService } from '@/service/';

export const recommendationService: IRecommendationService = {
  generatePlanningRecommendations(
    assets: Asset[],
    income: Income[],
    expenses: Expense[],
    liabilities: Liability[]
  ): PortfolioRecommendation[] {
    const recommendations: PortfolioRecommendation[] = [];

    // Calculate financial metrics
    const totalMonthlyIncome = calculatorService.calculateTotalMonthlyIncome(income);
    const totalMonthlyExpenses = calculatorService.calculateTotalMonthlyExpenses(expenses);
    const monthlyCashFlow = totalMonthlyIncome - totalMonthlyExpenses;
    const passiveIncome = calculatorService.calculatePassiveIncome(income, assets);
    const cashAssets = findCashAssets(assets);
    const retirementAssets = findRetirementAssets(assets);

    // 27. Emergency Fund
    const emergencyFundNeeded = totalMonthlyExpenses * 3;
    const currentCashValue = cashAssets.reduce((sum, asset) => sum + (asset.value || 0), 0);
    if (currentCashValue < emergencyFundNeeded) {
      recommendations.push({
        id: 'build-emergency-fund',
        category: 'planning',
        priority: 'high',
        titleKey: 'recommendations.planning.buildEmergencyFund.title',
        descriptionKey: 'recommendations.planning.buildEmergencyFund.description',
        actionCategory: 'assets',
        actionSubCategory: 'management',
        metadata: {
          needed: Math.round(emergencyFundNeeded),
          current: Math.round(currentCashValue),
          shortfall: Math.round(emergencyFundNeeded - currentCashValue)
        }
      });
    }

    // 28. Cashflow Improvement
    if (monthlyCashFlow < 0) {
      recommendations.push({
        id: 'improve-cashflow',
        category: 'planning',
        priority: 'high',
        titleKey: 'recommendations.planning.improveCashflow.title',
        descriptionKey: 'recommendations.planning.improveCashflow.description',
        actionCategory: 'income',
        actionSubCategory: 'optimization',
        metadata: {
          deficit: Math.round(Math.abs(monthlyCashFlow)),
          incomeNeeded: Math.round(totalMonthlyExpenses - totalMonthlyIncome)
        }
      });
    }

    // 29. Retirement Planning
    const totalAssetValue = calculatorService.calculateTotalAssetValue(assets);
    const retirementValue = retirementAssets.reduce((sum, asset) => sum + (asset.value || 0), 0);
    const retirementPercentage = totalAssetValue > 0 ? (retirementValue / totalAssetValue) * 100 : 0;

    if (retirementPercentage < 10 && assets.length > 0) {
      recommendations.push({
        id: 'increase-retirement-savings',
        category: 'planning',
        priority: 'medium',
        titleKey: 'recommendations.planning.increaseRetirementSavings.title',
        descriptionKey: 'recommendations.planning.increaseRetirementSavings.description',
        actionCategory: 'assets',
        actionSubCategory: 'retirement',
        metadata: {
          currentPercentage: Math.round(retirementPercentage),
          suggestedIncrease: Math.round(10 - retirementPercentage)
        }
      });
    }

    // 30. Financial Independence
    const expenseCoverage = totalMonthlyExpenses > 0 ? (passiveIncome / totalMonthlyExpenses) * 100 : 0;
    if (expenseCoverage < 25 && passiveIncome > 0) {
      recommendations.push({
        id: 'work-toward-financial-independence',
        category: 'planning',
        priority: 'low',
        titleKey: 'recommendations.planning.workTowardFinancialIndependence.title',
        descriptionKey: 'recommendations.planning.workTowardFinancialIndependence.description',
        actionCategory: 'income',
        actionSubCategory: 'passive',
        metadata: {
          currentCoverage: Math.round(expenseCoverage),
          passiveIncomeNeeded: Math.round(totalMonthlyExpenses * 0.25 - passiveIncome)
        }
      });
    }

    return recommendations;
  }
};

// Helper functions
const findCashAssets = (assets: Asset[]): Asset[] => {
  return assets.filter(asset => asset.type === 'cash');
};

const findRetirementAssets = (assets: Asset[]): Asset[] => {
  return assets.filter(asset =>
    asset.name.toLowerCase().includes('retirement') ||
    asset.name.toLowerCase().includes('401k') ||
    asset.name.toLowerCase().includes('ira') ||
    asset.name.toLowerCase().includes('pension')
  );
};
