import { IAnalyticsService } from './interfaces/IAnalyticsService';
import { calculateFinancialSummary } from './methods/calculateFinancialSummary';
import { calculateRatios } from './methods/calculateRatios';

const analyticsService: IAnalyticsService = {
  calculateFinancialSummary,
  calculateRatios,
};

export type { IAnalyticsService } from './interfaces/IAnalyticsService';
export default analyticsService;
