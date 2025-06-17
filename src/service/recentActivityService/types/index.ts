
// Import Analytics types from separate file
import type { AnalyticsCategory, AnalyticsSubCategory } from './analytics';

// Re-export Analytics types for external use
export type { AnalyticsCategory, AnalyticsSubCategory } from './analytics';

// Portfolio Hub Categories
export type PortfolioCategory = 
  | 'overview' | 'assets' | 'liabilities' | 'income' | 'expenses' | 'transactions';

export type PortfolioSubCategory = 
  | 'dashboard' | 'summary' | 'allocations'
  | 'portfolio' | 'definitions' | 'categories' | 'calendar' | 'history' | 'addTransaction'
  | 'debts' | 'payments' | 'projections' | 'addDebt'
  | 'sources' | 'streams' | 'addIncome'
  | 'budgets' | 'tracking' | 'addExpense'
  | 'recent' | 'import' | 'export';

// Activity Types
export type ActivityType = 'analytics' | 'portfolio' | 'asset' | 'transaction' | 'income' | 'expense' | 'liability';

// Base Activity Interface
export interface BaseActivity {
  id: string;
  type: ActivityType;
  timestamp: number;
  titleKey: string; // i18n key instead of translated title
  subtitleKey?: string; // i18n key instead of translated subtitle
  icon: string;
  date?: string;
}

// Analytics Activity
export interface AnalyticsActivity extends BaseActivity {
  type: 'analytics';
  category: AnalyticsCategory;
  subCategory: AnalyticsSubCategory;
}

// Portfolio Activity
export interface PortfolioActivity extends BaseActivity {
  type: 'portfolio';
  category: PortfolioCategory;
  subCategory?: PortfolioSubCategory;
}

// Transaction Activity
export interface TransactionActivity extends BaseActivity {
  type: 'asset' | 'transaction' | 'income' | 'expense' | 'liability';
  entityId?: string;
  amount?: number;
  currency?: string;
}

// Union type for all activities
export type RecentActivity = AnalyticsActivity | PortfolioActivity | TransactionActivity;

// Service Configuration
export interface ActivityServiceConfig {
  maxHistoryEntries: number;
  storageKeys: {
    analytics: string;
    portfolio: string;
    transactions: string;
  };
}
