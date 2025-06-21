/**
 * Analytics recommendations and insights
 */

// Recommendation types
export type RecommendationPriority = 'high' | 'medium' | 'low';
export type RecommendationCategory = 'assets' | 'income' | 'expenses' | 'liabilities' | 'planning';

// Financial metrics for analysis
export interface FinancialMetrics {
  netWorth: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  savingsRate: number;
  debtToIncomeRatio: number;
  emergencyFundMonths: number;
  portfolioValue: number;
  monthlyPassiveIncome: number;
  financialIndependenceRatio: number;
}
