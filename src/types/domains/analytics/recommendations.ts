/**
 * Analytics recommendations and insights
 */

// Recommendation types
export type RecommendationPriority = 'high' | 'medium' | 'low';
export type RecommendationCategory = 'assets' | 'income' | 'expenses' | 'liabilities' | 'planning';

export interface PortfolioRecommendation {
  id: string;
  title: string;
  description: string;
  category: RecommendationCategory;
  priority: RecommendationPriority;
  impact: number; // Expected impact score (0-100)
  confidence: number; // Confidence level (0-100)
  actionItems: string[];
  relatedAssets?: string[]; // Asset IDs
  estimatedTimeToImplement?: number; // in days
  potentialReturn?: number; // Expected return improvement
  riskLevel?: 'low' | 'medium' | 'high';
  tags?: string[];
  createdAt: string;
  isRead?: boolean;
  isImplemented?: boolean;
}

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
