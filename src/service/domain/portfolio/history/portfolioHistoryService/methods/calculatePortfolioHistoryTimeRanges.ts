import { Transaction as Asset, AssetDefinition } from '@/types/domains/assets/';
import { calculatePortfolioHistoryForDays } from './calculatePortfolioHistoryForDays';
import { TimeRange } from '@/types/domains/portfolio/history';
import { PortfolioHistoryPoint } from '@/types/domains/portfolio';
import Logger from "@/service/shared/logging/Logger/logger";



/**
 * Calculates portfolio history for common time ranges
 * Provides convenient presets for typical analysis periods
 */
export class PortfolioHistoryTimeRanges {
  
  /**
   * Get portfolio history for the last week
   */
  static getLastWeek(
    assets: Asset[], 
    assetDefinitions: AssetDefinition[] = []
  ): PortfolioHistoryPoint[] {
    Logger.infoService('Calculating portfolio history for last week');
    return calculatePortfolioHistoryForDays(assets, assetDefinitions, TimeRange.WEEK);
  }

  /**
   * Get portfolio history for the last month
   */
  static getLastMonth(
    assets: Asset[], 
    assetDefinitions: AssetDefinition[] = []
  ): PortfolioHistoryPoint[] {
    Logger.infoService('Calculating portfolio history for last month');
    return calculatePortfolioHistoryForDays(assets, assetDefinitions, TimeRange.MONTH);
  }

  /**
   * Get portfolio history for the last quarter (90 days)
   */
  static getLastQuarter(
    assets: Asset[], 
    assetDefinitions: AssetDefinition[] = []
  ): PortfolioHistoryPoint[] {
    Logger.infoService('Calculating portfolio history for last quarter');
    return calculatePortfolioHistoryForDays(assets, assetDefinitions, TimeRange.QUARTER);
  }

  /**
   * Get portfolio history for the last half year (180 days)
   */
  static getLastHalfYear(
    assets: Asset[], 
    assetDefinitions: AssetDefinition[] = []
  ): PortfolioHistoryPoint[] {
    Logger.infoService('Calculating portfolio history for last half year');
    return calculatePortfolioHistoryForDays(assets, assetDefinitions, TimeRange.HALF_YEAR);
  }

  /**
   * Get portfolio history for the last year
   */
  static getLastYear(
    assets: Asset[], 
    assetDefinitions: AssetDefinition[] = []
  ): PortfolioHistoryPoint[] {
    Logger.infoService('Calculating portfolio history for last year');
    return calculatePortfolioHistoryForDays(assets, assetDefinitions, TimeRange.YEAR);
  }

  /**
   * Get portfolio history for the last two years
   */
  static getLastTwoYears(
    assets: Asset[], 
    assetDefinitions: AssetDefinition[] = []
  ): PortfolioHistoryPoint[] {
    Logger.infoService('Calculating portfolio history for last two years');
    return calculatePortfolioHistoryForDays(assets, assetDefinitions, TimeRange.TWO_YEARS);
  }

  /**
   * Get portfolio history for the last five years
   */
  static getLastFiveYears(
    assets: Asset[], 
    assetDefinitions: AssetDefinition[] = []
  ): PortfolioHistoryPoint[] {
    Logger.infoService('Calculating portfolio history for last five years');
    return calculatePortfolioHistoryForDays(assets, assetDefinitions, TimeRange.FIVE_YEARS);
  }

  /**
   * Get portfolio history for a custom number of days
   */
  static getCustomDays(
    assets: Asset[], 
    days: number,
    assetDefinitions: AssetDefinition[] = []
  ): PortfolioHistoryPoint[] {
    Logger.infoService(`Calculating portfolio history for custom ${days} days`);
    return calculatePortfolioHistoryForDays(assets, assetDefinitions, days);
  }
}
