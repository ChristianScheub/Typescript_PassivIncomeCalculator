import { Transaction as Asset, AssetDefinition } from '../../../types/domains/assets/';
import { Liability, Expense, Income } from '../../../types/domains/financial/';
import { PortfolioRecommendation } from '../interfaces/IAnalyticsService';
import { generateAssetRecommendations } from './generateAssetRecommendations';
import { generateIncomeRecommendations } from './generateIncomeRecommendations';
import { generateExpenseRecommendations } from './generateExpenseRecommendations';
import { generateLiabilityRecommendations } from './generateLiabilityRecommendations';
import { generatePlanningRecommendations } from './generatePlanningRecommendations';

export const generateRecommendations = (
  assets: Asset[],
  liabilities: Liability[],
  expenses: Expense[],
  income: Income[],
  assetDefinitions: AssetDefinition[] = []
): PortfolioRecommendation[] => {
  // Collect all recommendations from different categories
  const assetRecommendations = generateAssetRecommendations(assets, assetDefinitions);
  const incomeRecommendations = generateIncomeRecommendations(assets, income, assetDefinitions);
  const expenseRecommendations = generateExpenseRecommendations(expenses, income);
  const liabilityRecommendations = generateLiabilityRecommendations(assets, liabilities);
  const planningRecommendations = generatePlanningRecommendations(assets, income, expenses, liabilities);

  // Combine all recommendations
  const allRecommendations = [
    ...assetRecommendations,
    ...incomeRecommendations,
    ...expenseRecommendations,
    ...liabilityRecommendations,
    ...planningRecommendations
  ];

  // Sort by priority: high -> medium -> low
  const sortedRecommendations = allRecommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  // Limit to most important recommendations (can be configured)
  const maxRecommendations = 10;
  return sortedRecommendations.slice(0, maxRecommendations);
};
