import { IAnalyticsService } from './interfaces/IAnalyticsService';
import { calculateFinancialSummary } from './methods/calculateFinancialSummary';
import { calculateRatios } from './methods/calculateRatios';
import { generateRecommendations } from './methods/generateRecommendations';

const analyticsService: IAnalyticsService = {
  calculateFinancialSummary,
  calculateRatios,
  generateRecommendations,
};

export type { IAnalyticsService } from './interfaces/IAnalyticsService';
export default analyticsService;
