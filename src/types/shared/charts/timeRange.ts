/**
 * Chart-specific time range types and configurations
 */

import { AssetFocusTimeRange } from "../analytics";

/**
 * Time range filter configuration for charts
 */
export interface TimeRangeChartFilter {
  key: AssetFocusTimeRange;
  label: string;
}

/**
 * Base data structure for portfolio chart data points
 */
export interface PortfolioChartDataPoint {
  date: string;
  value: number;
  change?: number;
  changePercentage?: number;
  formattedDate?: string;
  hasTransactions?: boolean;
}

/**
 * Chart display configuration
 */
export interface ChartConfig {
  chartType: 'line' | 'area';
  height: number;
  showDots: boolean;
  showGrid: boolean;
  strokeWidth: number;
  colors: {
    primary: string;
    positive: string;
    negative: string;
    grid: string;
  };
}

/**
 * Default time range filters with German labels
 * ToDo: Use i18Next Keys for translations and use it in AssetFocusDashboard
 */
export const DEFAULT_TIME_RANGE_FILTERS: TimeRangeChartFilter[] = [
  { key: '1T', label: 'chart.timeRange.1D' },
  { key: '5D', label: 'chart.timeRange.5D' },
  { key: '1M', label: 'chart.timeRange.1M' },
  { key: '3M', label: 'chart.timeRange.3M' },
  { key: '6M', label: 'chart.timeRange.6M' },
  { key: '1Y', label: 'chart.timeRange.1Y' },
  { key: 'Max', label: 'chart.timeRange.max' }
];

/**
 * Utility function to get the number of days for a given time range
 */
export function getTimeRangeDays(timeRange: AssetFocusTimeRange): number {
  switch (timeRange) {
    case '1T':
      return 1;
    case '5D':
      return 5;
    case '1M':
      return 30;
    case '3M':
      return 90;
    case '6M':
      return 180;
    case '1Y':
      return 365;
    case 'Max':
      return -1; // Special case: return all data
    default:
      return 30; // Default fallback
  }
}
