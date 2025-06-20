import { IFinancialCalculatorService } from './interfaces/IFinancialCalculatorService';
import { calculateNetWorth } from './methods/calculateNetWorth';
import { calculateMonthlyCashFlow } from './methods/calculateCashFlow';
import { calculateProjections, calculateProjectionsWithCache } from '../../analytics/financialAnalyticsService/methods/calculateProjections';
import { calculatePortfolioAnalytics, calculateIncomeAnalytics } from '../../analytics/financialAnalyticsService/methods/calculatePortfolioAnalytics';

/**
 * Financial Calculator Service that coordinates complex financial calculations
 * This service acts as a coordinator for comprehensive financial analysis
 */
const financialCalculatorService: IFinancialCalculatorService = {
  // Cash flow calculations
  calculateMonthlyCashFlow,

  // Net worth calculations
  calculateNetWorth,

  // Financial projections and analytics
  calculateProjections,
  calculateProjectionsWithCache,

  // Portfolio Analytics
  calculatePortfolioAnalytics,
  calculateIncomeAnalytics,
};

// Export the service interface
export type { IFinancialCalculatorService };

// Export the service
export { financialCalculatorService };

// Export default instance for direct use
export default financialCalculatorService;
