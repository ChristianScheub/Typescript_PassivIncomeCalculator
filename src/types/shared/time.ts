/**
 * Time-related types and interfaces
 */

/**
 * Time range periods for historical data queries
 */
export type TimeRangePeriod = "1d" | "5d" | "1mo" | "3mo" | "6mo" | "1y" | "2y" | "5y" | "10y" | "ytd" | "max";

/**
 * Time range option interface for UI components
 */
export interface TimeRangeOption {
  value: TimeRangePeriod;
  label: string;
  description: string;
}
