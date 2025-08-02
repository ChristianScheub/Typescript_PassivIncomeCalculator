import { IFinancialCalculatorService } from './interfaces/IFinancialCalculatorService';
import { calculateNetWorth } from './methods/calculateNetWorth';
import { calculateMonthlyCashFlow } from './methods/calculateCashFlow';
import { calculateProjections, calculateProjectionsWithCache } from '../../../analytics/calculations/financialAnalyticsService/methods/calculateProjections';
import { calculatePortfolioAnalytics as rawCalculatePortfolioAnalytics, calculateIncomeAnalytics as rawCalculateIncomeAnalytics } from '../../../analytics/calculations/financialAnalyticsService/methods/calculatePortfolioAnalytics';

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
  calculatePortfolioAnalytics: (positions, assetDefinitions = []) => rawCalculatePortfolioAnalytics(positions, assetDefinitions),
  calculateIncomeAnalytics: (positions, assetDefinitions = []) => rawCalculateIncomeAnalytics(positions, assetDefinitions),
};

// Export the service interface


// Export the service
export { financialCalculatorService };

// Export default instance for direct use
export default financialCalculatorService;
