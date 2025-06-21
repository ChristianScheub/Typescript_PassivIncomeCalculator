/**
 * Analytics component types
 */

import { BaseChartData } from '../charts';

// Debt projection data types
export interface DebtProjectionData {
  month: string;
  total: number;
  [key: string]: string | number;
}

// Portfolio analytics types
export interface PortfolioPosition {
  name: string;
  symbol?: string;
  currentValue: number;
  gainLoss: number;
  gainPercent: number;
  quantity: number;
  currentPrice: number;
  totalReturnPercentage: number;
  totalReturn: number;
  monthlyIncome: number;
}

// Analytics data mappers
export type AssetTypeDataMapper = (items: unknown[]) => BaseChartData[];
export type GenericDataMapper = (items: unknown[]) => BaseChartData[];

// Chart tooltip props for analytics
export interface AnalyticsTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    name?: string;
    color?: string;
    fill?: string;
    stroke?: string;
    payload?: unknown;
  }>;
  label?: string;
}

// Portfolio history data
export interface PortfolioHistoryItem {
  date: string;
  totalValue: number;
  monthlyIncome: number;
  [key: string]: string | number;
}

// Dashboard data types
export interface DashboardData {
  history30Days: PortfolioHistoryItem[];
  totalValue: number;
  monthlyIncome: number;
  totalExpenses: number;
  netCashFlow: number;
}

// Asset allocation data
export interface AssetAllocationItem {
  name: string;
  value: number;
  percentage: number;
  color?: string;
}

// Performance metrics
export interface PerformanceMetrics {
  totalReturn: number;
  totalReturnPercentage: number;
  averageReturn: number;
  bestPerformer: PortfolioPosition;
  worstPerformer: PortfolioPosition;
}

// Recharts dot props
export interface RechartsDotProps {
  cx: number;
  cy: number;
  stroke: string;
  fill: string;
  strokeWidth: number;
  r: number;
  payload?: unknown;
}
