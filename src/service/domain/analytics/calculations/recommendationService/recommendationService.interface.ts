import { Transaction as Asset } from '@/types/domains/assets/';
import { Income, Expense, Liability } from '@/types/domains/financial/';
import { PortfolioRecommendation } from '@/types/domains/analytics';

export interface IRecommendationService {
  generatePlanningRecommendations(
    assets: Asset[],
    income: Income[],
    expenses: Expense[],
    liabilities: Liability[]
  ): PortfolioRecommendation[];
}
