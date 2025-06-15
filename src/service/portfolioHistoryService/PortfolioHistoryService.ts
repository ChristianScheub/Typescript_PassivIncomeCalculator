import { Asset, AssetDefinition } from '../../types';
import { PerformanceMetrics, PortfolioHistoryPoint, ChartDataPoint } from './interfaces/IPortfolioHistoryService';
import { calculatePortfolioHistory } from './methods/calculatePortfolioHistory';
import { calculatePortfolioHistoryForDays } from './methods/calculatePortfolioHistoryForDays';
import { calculatePerformanceMetrics } from './methods/calculatePerformanceMetrics';
import { formatForChart } from './methods/formatForChart';
import { PortfolioHistoryTimeRanges } from './methods/calculatePortfolioHistoryTimeRanges';
import Logger from '../Logger/logger';

/**
 * Portfolio History Service
 * 
 * Static service class that provides portfolio value tracking over time.
 * Uses static methods for consistency with other services in the codebase.
 */
export class PortfolioHistoryService {
  
  /**
   * Calculates portfolio value history based on assets and asset definitions
   */
  static calculatePortfolioHistory(
    assets: Asset[], 
    assetDefinitions: AssetDefinition[] = []
  ): PortfolioHistoryPoint[] {
    Logger.infoService('PortfolioHistoryService: Starting portfolio history calculation');
    
    try {
      const result = calculatePortfolioHistory(assets, assetDefinitions);
      Logger.infoService(`PortfolioHistoryService: Successfully calculated ${result.length} history points`);
      return result;
    } catch (error) {
      Logger.error(`PortfolioHistoryService: Error calculating portfolio history - ${error}`);
      return [];
    }
  }

  /**
   * Calculates portfolio value history for a specific number of days back from today
   */
  static calculatePortfolioHistoryForDays(
    assets: Asset[], 
    assetDefinitions: AssetDefinition[] = [],
    daysBack: number = 30
  ): PortfolioHistoryPoint[] {
    Logger.infoService(`PortfolioHistoryService: Starting portfolio history calculation for ${daysBack} days`);
    
    try {
      const result = calculatePortfolioHistoryForDays(assets, assetDefinitions, daysBack);
      Logger.infoService(`PortfolioHistoryService: Successfully calculated ${result.length} history points for ${daysBack} days`);
      return result;
    } catch (error) {
      Logger.error(`PortfolioHistoryService: Error calculating portfolio history for days - ${error}`);
      return [];
    }
  }

  /**
   * Calculates performance metrics from portfolio history
   */
  static calculatePerformanceMetrics(
    historyPoints: PortfolioHistoryPoint[], 
    totalInvestment: number
  ): PerformanceMetrics {
    Logger.infoService('PortfolioHistoryService: Calculating performance metrics');
    
    try {
      const result = calculatePerformanceMetrics(historyPoints, totalInvestment);
      Logger.infoService('PortfolioHistoryService: Successfully calculated performance metrics');
      return result;
    } catch (error) {
      Logger.error(`PortfolioHistoryService: Error calculating performance metrics - ${error}`);
      return {
        totalReturn: 0,
        totalReturnPercentage: 0,
        startValue: 0,
        endValue: 0,
        peakValue: 0,
        lowestValue: 0
      };
    }
  }

  /**
   * Formats portfolio history for chart display
   */
  static formatForChart(historyPoints: PortfolioHistoryPoint[]): ChartDataPoint[] {
    Logger.infoService('PortfolioHistoryService: Formatting data for chart');
    
    try {
      const result = formatForChart(historyPoints);
      Logger.infoService(`PortfolioHistoryService: Successfully formatted ${result.length} chart points`);
      return result;
    } catch (error) {
      Logger.error(`PortfolioHistoryService: Error formatting chart data - ${error}`);
      return [];
    }
  }
}
