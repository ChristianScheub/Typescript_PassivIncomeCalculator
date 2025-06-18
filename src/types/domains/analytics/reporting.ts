/**
 * Analytics reporting and dashboard types
 */

// Chart configuration types
export type ChartType = 'pie' | 'bar' | 'line';
export type AnalyticsDataSource = 'assetValue' | 'income' | 'growth'; // Renamed to avoid conflict
export type GroupBy = 'assetType' | 'sector' | 'country' | 'category' | 'categoryOptions' | 'specificCategory' | 'assetDefinition';

export interface CustomAnalyticsConfig {
  id: string;
  name: string;
  chartType: ChartType;
  dataSource: AnalyticsDataSource;
  groupBy: GroupBy;
  specificCategoryId?: string; // Only used when groupBy is 'specificCategory'
  filters?: Record<string, any>;
  isActive: boolean;
  sortOrder: number;
}

// Financial summary for analytics
export interface FinancialSummary {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyNetCashFlow: number;
  passiveIncome: number;
  passiveIncomeCoverage: number;
  debtToIncomeRatio: number;
  savingsRate: number;
  emergencyFundMonths: number;
  riskScore: number;
  diversificationScore: number;
  lastUpdated: string;
}

// Dashboard state and configuration
export interface DashboardConfig {
  layout: 'desktop' | 'mobile';
  widgets: DashboardWidget[];
  preferences: UserPreferences;
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'list' | 'summary';
  title: string;
  position: WidgetPosition;
  config: any;
  isVisible: boolean;
}

export interface WidgetPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  currency: string;
  language: string;
  dateFormat: string;
  numberFormat: string;
  refreshInterval: number;
}
