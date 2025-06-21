import { Transaction as Asset, AssetDefinition } from '@/types/domains/assets/';
import { Liability, Expense, Income } from '@/types/domains/financial/';
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
  assetDefinitions: AssetDefinition[] = [],
  portfolioCache?: { totals: { monthlyIncome: number } } | null // Optional portfolio cache
): PortfolioRecommendation[] => {
  // Collect all recommendations from different categories
  const assetRecommendations = generateAssetRecommendations(assets, assetDefinitions);
  const incomeRecommendations = generateIncomeRecommendations(assets, income, assetDefinitions, portfolioCache);
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
  const priorityOrder = { high: 3, medium: 2, low: 1 };
  const sortedRecommendations = allRecommendations.toSorted((a, b) => {
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  // Limit to most important recommendations (can be configured)
  const maxRecommendations = 10;
  return sortedRecommendations.slice(0, maxRecommendations);
};
