// Neue Domain-Driven Types
import { 
  Transaction as Asset, 
  AssetDefinition 
} from '@/types/domains/assets/';
import { 
  Liability, 
  Expense, 
  Income 
} from '@/types/domains/financial/';

export interface FinancialSummary {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyLiabilityPayments: number;
  monthlyAssetIncome: number;
  passiveIncome: number;
  monthlyCashFlow: number;
  totalMonthlyIncome: number;
  totalPassiveIncome: number;
  totalMonthlyExpenses: number;
}

export interface FinancialRatios {
  passiveRatio: number;
  expenseCoverage: number;
  debtRatio: number;
  savingsRate: number;
}

export type RecommendationPriority = 'high' | 'medium' | 'low';
export type RecommendationCategory = 'assets' | 'income' | 'expenses' | 'liabilities' | 'planning';

export interface PortfolioRecommendation {
  id: string;
  category: RecommendationCategory;
  priority: RecommendationPriority;
  titleKey: string;
  descriptionKey: string;
  actionCategory?: string; // Portfolio category for navigation
  actionSubCategory?: string; // Portfolio subcategory for navigation
  metadata?: Record<string, any>; // Additional data for the recommendation
}

export interface IAnalyticsService {
  calculateFinancialSummary: (
    assets: Asset[],
    liabilities: Liability[],
    expenses: Expense[],
    income: Income[],
    assetDefinitions?: AssetDefinition[]
  ) => FinancialSummary;

  calculateRatios: (summary: FinancialSummary) => FinancialRatios;

  generateRecommendations: (
    assets: Asset[],
    liabilities: Liability[],
    expenses: Expense[],
    income: Income[],
    assetDefinitions?: AssetDefinition[]
  ) => PortfolioRecommendation[];
}
