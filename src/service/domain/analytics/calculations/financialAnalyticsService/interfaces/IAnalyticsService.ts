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

export interface IAnalyticsService {
  calculateFinancialSummary: (
    assets: Asset[],
    liabilities: Liability[],
    expenses: Expense[],
    income: Income[],
    assetDefinitions?: AssetDefinition[]
  ) => import('@/types/domains/analytics/reporting').FinancialSummary;

  calculateRatios: (summary: import('@/types/domains/analytics/reporting').FinancialSummary) => import('@/types/domains/analytics/reporting').FinancialRatios;

  generateRecommendations: (
    assets: Asset[],
    liabilities: Liability[],
    expenses: Expense[],
    income: Income[],
    assetDefinitions?: AssetDefinition[]
  ) => import('@/types/domains/analytics/reporting').PortfolioRecommendation[];
}
