import { IPortfolioHistoryService } from './interfaces/IPortfolioHistoryService';
import { calculatePortfolioHistory } from './methods/calculatePortfolioHistory';
import { calculatePortfolioHistoryForDays } from './methods/calculatePortfolioHistoryForDays';
import { calculatePerformanceMetrics } from './methods/calculatePerformanceMetrics';
import { formatForChart } from './methods/formatForChart';
import { calculatePortfolioValueForDate } from './methods/calculatePortfolioValueForDate';
import { getHistoricalPrice } from './methods/getHistoricalPrice';
import { PortfolioHistoryTimeRanges } from './methods/calculatePortfolioHistoryTimeRanges';

const portfolioHistoryService: IPortfolioHistoryService = {
  // Portfolio history calculations
  calculatePortfolioHistory,
  calculatePortfolioHistoryForDays,

  // Performance calculations  
  calculatePerformanceMetrics,

  // Chart formatting
  formatForChart,

  // Time range helpers
  getLastWeek: (assets, assetDefinitions = []) => 
    PortfolioHistoryTimeRanges.getLastWeek(assets, assetDefinitions),
  getLastMonth: (assets, assetDefinitions = []) => 
    PortfolioHistoryTimeRanges.getLastMonth(assets, assetDefinitions),
  getLastQuarter: (assets, assetDefinitions = []) => 
    PortfolioHistoryTimeRanges.getLastQuarter(assets, assetDefinitions),
  getLastHalfYear: (assets, assetDefinitions = []) => 
    PortfolioHistoryTimeRanges.getLastHalfYear(assets, assetDefinitions),
  getLastYear: (assets, assetDefinitions = []) => 
    PortfolioHistoryTimeRanges.getLastYear(assets, assetDefinitions),
  getLastTwoYears: (assets, assetDefinitions = []) => 
    PortfolioHistoryTimeRanges.getLastTwoYears(assets, assetDefinitions),
  getLastFiveYears: (assets, assetDefinitions = []) => 
    PortfolioHistoryTimeRanges.getLastFiveYears(assets, assetDefinitions),
  getCustomDays: (assets, assetDefinitions, days) => 
    PortfolioHistoryTimeRanges.getCustomDays(assets, assetDefinitions, days),
};

export default portfolioHistoryService;

// Export individual methods for direct use
export { 
  calculatePortfolioHistory,
  calculatePortfolioHistoryForDays,
  calculatePerformanceMetrics,
  formatForChart,
  calculatePortfolioValueForDate,
  getHistoricalPrice,
  PortfolioHistoryTimeRanges
};

// Export interfaces and types
export * from './interfaces/IPortfolioHistoryService';

// Export legacy class for backward compatibility
export { PortfolioHistoryService } from './PortfolioHistoryService';
