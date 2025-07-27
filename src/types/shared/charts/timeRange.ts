/**
 * Chart-specific time range types and configurations
 */

/**
 * Time range for portfolio charts
 * Combines standard time periods with specific chart periods
 */
export type TimeRangeChart = '1T' | '1W' | '1M' | '3M' | '6M' | '1J' | 'Max';

/**
 * Time range filter configuration for charts
 */
export interface TimeRangeChartFilter {
  key: TimeRangeChart;
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
 */
export const DEFAULT_TIME_RANGE_FILTERS: TimeRangeChartFilter[] = [
  { key: '1T', label: '1 Tag' },
  { key: '1W', label: '1 Woche' },
  { key: '1M', label: '1 Monat' },
  { key: '3M', label: '3 Monate' },
  { key: '6M', label: '6 Monate' },
  { key: '1J', label: '1 Jahr' },
  { key: 'Max', label: 'Max' }
];
