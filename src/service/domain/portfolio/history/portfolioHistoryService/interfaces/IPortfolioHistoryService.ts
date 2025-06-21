import { Transaction as Asset, AssetDefinition } from '@/types/domains/assets/';
import { 
  PortfolioHistoryPoint,
  PerformanceMetrics,
  ChartDataPoint 
} from '@/types/domains/portfolio/history';



/**
 * Portfolio History Service Interface
 */
export interface IPortfolioHistoryService {
  // Portfolio history calculations
  calculatePortfolioHistory(
    assets: Asset[], 
    assetDefinitions: AssetDefinition[]
  ): PortfolioHistoryPoint[];
  
  calculatePortfolioHistoryForDays(
    assets: Asset[], 
    assetDefinitions: AssetDefinition[],
    daysBack: number
  ): PortfolioHistoryPoint[];
  
  // Performance calculations
  calculatePerformanceMetrics(
    historyPoints: PortfolioHistoryPoint[], 
    totalInvestment: number
  ): PerformanceMetrics;
  
  // Chart formatting
  formatForChart(historyPoints: PortfolioHistoryPoint[]): ChartDataPoint[];

  // Time range helpers
  getLastWeek(assets: Asset[], assetDefinitions?: AssetDefinition[]): PortfolioHistoryPoint[];
  getLastMonth(assets: Asset[], assetDefinitions?: AssetDefinition[]): PortfolioHistoryPoint[];
  getLastQuarter(assets: Asset[], assetDefinitions?: AssetDefinition[]): PortfolioHistoryPoint[];
  getLastHalfYear(assets: Asset[], assetDefinitions?: AssetDefinition[]): PortfolioHistoryPoint[];
  getLastYear(assets: Asset[], assetDefinitions?: AssetDefinition[]): PortfolioHistoryPoint[];
  getLastTwoYears(assets: Asset[], assetDefinitions?: AssetDefinition[]): PortfolioHistoryPoint[];
  getLastFiveYears(assets: Asset[], assetDefinitions?: AssetDefinition[]): PortfolioHistoryPoint[];
  getCustomDays(assets: Asset[], days: number, assetDefinitions?: AssetDefinition[]): PortfolioHistoryPoint[];
}
