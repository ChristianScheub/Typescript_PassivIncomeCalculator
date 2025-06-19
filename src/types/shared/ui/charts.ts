/**
 * Chart component types
 */

// Base chart data interface
export interface ChartDataPoint {
  name: string;
  value: number;
  percentage?: number;
  displayName?: string;
  [key: string]: unknown;
}

// Tooltip component props
export interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: ChartDataPoint;
  }>;
  label?: string;
  formatValue?: (value: number) => string;
}

// Generic chart props
export interface BaseChartProps<T extends ChartDataPoint = ChartDataPoint> {
  title: string;
  data: T[];
  nameKey: Extract<keyof T, string>;
  valueKey: Extract<keyof T, string>;
  translationKey?: string;
  emptyStateMessage?: string;
}

// Bar chart specific props
export interface BarChartProps<T extends ChartDataPoint = ChartDataPoint> extends BaseChartProps<T> {
  orientation?: 'horizontal' | 'vertical';
}

// Pie chart specific props  
export interface PieChartProps<T extends ChartDataPoint = ChartDataPoint> extends BaseChartProps<T> {
  showLabels?: boolean;
  innerRadius?: number;
  outerRadius?: number;
}

// Line chart specific props
export interface LineChartProps<T extends ChartDataPoint = ChartDataPoint> extends BaseChartProps<T> {
  strokeColor?: string;
  showDots?: boolean;
  showArea?: boolean;
}

// Chart color configuration
export interface ChartColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  [key: string]: string;
}
