import { Asset, AssetDefinition } from '../../../types';
import { calculatePortfolioHistoryForDays } from './calculatePortfolioHistoryForDays';
import { PortfolioHistoryPoint } from '../interfaces/IPortfolioHistoryService';
import Logger from '../../Logger/logger';

/**
 * Common time range options for portfolio history calculations
 */
export enum TimeRange {
  WEEK = 7,
  MONTH = 30,
  QUARTER = 90,
  HALF_YEAR = 180,
  YEAR = 365,
  TWO_YEARS = 730,
  FIVE_YEARS = 1825
}

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
