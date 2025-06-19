/**
 * Chart Data Types for proper TypeScript support
 */

// Base chart data entry
export interface BaseChartData {
  name: string;
  value: number;
  [key: string]: string | number | undefined;
}

// Recharts payload structure
export interface RechartsPayload {
  value: number;
  dataKey: string;
  name?: string;
  color?: string;
  fill?: string;
  stroke?: string;
  payload?: BaseChartData;
}

// Specific payload for cash flow charts
export interface CashFlowPayload {
  value: number;
  dataKey: string;
  name?: string;
  color?: string;
  fill?: string;
  stroke?: string;
  payload?: MonthlyProjectionData;
}

// Monthly projection data type
export interface MonthlyProjectionData {
  activeIncome: number;
  assetIncome: number;
  expenseTotal: number;
  liabilityPayments: number;
  netCashFlow: number;
  month: string;
  [key: string]: string | number;
}

// Chart tooltip props with proper typing
export interface ChartTooltipPayload {
  active?: boolean;
  payload?: RechartsPayload[];
  label?: string;
}

// Cash flow tooltip props with specific payload typing
export interface CashFlowTooltipPayload {
  active?: boolean;
  payload?: CashFlowPayload[];
  label?: string;
}

// Bar chart specific data
export interface BarChartData extends BaseChartData {
  fill?: string;
}

// Pie chart specific data  
export interface PieChartData extends BaseChartData {
  fill?: string;
  percentage?: number;
}

// Line chart specific data
export interface LineChartData extends BaseChartData {
  date?: string;
  timestamp?: number;
}

// Stacked bar chart data
export interface StackedBarChartData extends BaseChartData {
  [categoryKey: string]: string | number;
}

// Portfolio history specific data
export interface PortfolioHistoryChartData extends LineChartData {
  change: number;
  changePercentage: number;
}

// Cash flow projection data
export interface CashFlowProjectionData extends BarChartData {
  activeIncome: number;
  assetIncome: number;
  expenseTotal: number;
  liabilityPayments: number;
  month: string;
}

// Net cash flow chart data
export interface NetCashFlowData extends BarChartData {
  income: number;
  expenses: number;
  netCashFlow: number;
  month: string;
}

// Asset allocation data
export interface AssetAllocationData extends PieChartData {
  type: string;
  percentage: number;
  count?: number;
}

// Performance chart data
export interface PerformanceChartData extends BaseChartData {
  totalReturn: number;
  totalReturnPercentage: number;
  currentValue: number;
  totalInvestment: number;
}

// Generic chart component props
export interface GenericChartProps<T extends BaseChartData> {
  data: T[];
  width?: number;
  height?: number;
  margin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
}

// Chart event handlers
export interface ChartEventHandlers<T = BaseChartData> {
  onBarClick?: (data: T, index: number) => void;
  onPieClick?: (data: T, index: number) => void;
  onLineClick?: (data: T, index: number) => void;
}
