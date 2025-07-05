/**
 * Analytics reporting and dashboard types
 */

// Chart configuration types
export type ChartType = 'pie' | 'bar' | 'line';
export type AnalyticsDataSource = 'assetValue' | 'income' | 'growth'; // Renamed to avoid conflict
export type GroupBy = 'assetType' | 'sector' | 'country' | 'category' | 'categoryOptions' | 'specificCategory' | 'assetDefinition';



// Financial summary for analytics
export interface FinancialSummary {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyLiabilityPayments: number;
  monthlyAssetIncome: number;
  passiveIncome: number;
  monthlyCashFlow: number;
  totalMonthlyIncome: number;
  totalPassiveIncome: number;
  totalMonthlyExpenses: number;
  // Legacy/computed properties for backward compatibility
  monthlyNetCashFlow?: number;
  passiveIncomeCoverage?: number;
  debtToIncomeRatio?: number;
  savingsRate?: number;
  emergencyFundMonths?: number;
  riskScore?: number;
  diversificationScore?: number;
  lastUpdated?: string;
}

// Dashboard state and configuration
export interface DashboardConfig {
  layout: 'desktop' | 'mobile';
  widgets: DashboardWidget[];
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'list' | 'summary';
  title: string;
  position: WidgetPosition;
  config: Record<string, unknown>;
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

// === Activity & Portfolio Analytics Types (moved from service layer) ===

export type AnalyticsCategory = 
  | 'overview' 
  | 'forecasting' 
  | 'milestones' 
  | 'distributions' 
  | 'performance' 
  | 'custom';

export type AnalyticsSubCategory = 
  | 'dashboard' 
  | 'summary'
  | 'cashflow' 
  | 'portfolio' 
  | 'scenarios'
  | 'fire' 
  | 'debt' 
  | 'savings' 
  | 'customMilestones'
  | 'assets' 
  | 'income' 
  | 'expenses' 
  | 'geographic'
  | 'portfolioPerformance' 
  | 'returns' 
  | 'historical'
  | 'calendar' 
  | 'history' 
  | 'liabilities'
  | 'distributions'
  | 'timeline';

export type PortfolioCategory = 
  | 'overview' | 'assets' | 'liabilities' | 'income' | 'expenses' | 'transactions';

export type PortfolioSubCategory = 
  | 'dashboard' | 'summary' | 'allocations'
  | 'portfolio' | 'definitions' | 'categories' | 'calendar' | 'history' | 'addTransaction'
  | 'debts' | 'payments' | 'liabilityProjections' | 'addDebt'
  | 'sources' | 'streams' | 'incomeProjections' | 'addIncome'
  | 'budgets' | 'tracking' | 'addExpense'
  | 'recent' | 'import' | 'export';

export type ActivityType = 'analytics' | 'portfolio' | 'asset' | 'transaction' | 'income' | 'expense' | 'liability';

export interface BaseActivity {
  id: string;
  type: ActivityType;
  timestamp: number;
  titleKey: string;
  subtitleKey?: string;
  icon: string;
  date?: string;
}

export interface AnalyticsActivity extends BaseActivity {
  type: 'analytics';
  category: AnalyticsCategory;
  subCategory: AnalyticsSubCategory;
}

export interface PortfolioActivity extends BaseActivity {
  type: 'portfolio';
  category: PortfolioCategory;
  subCategory?: PortfolioSubCategory;
}

export interface TransactionActivity extends BaseActivity {
  type: 'asset' | 'transaction' | 'income' | 'expense' | 'liability';
  entityId?: string;
  amount?: number;
  currency?: string;
}

export type RecentActivity = AnalyticsActivity | PortfolioActivity | TransactionActivity;

export interface ActivityServiceConfig {
  maxHistoryEntries: number;
  storageKeys: {
    analytics: string;
    portfolio: string;
    transactions: string;
  };
}

// === Financial Analytics Types (moved from service layer) ===

export interface FinancialSummary {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyLiabilityPayments: number;
  monthlyAssetIncome: number;
  passiveIncome: number;
  monthlyCashFlow: number;
  totalMonthlyIncome: number;
  totalPassiveIncome: number;
  totalMonthlyExpenses: number;
}

export interface FinancialRatios {
  passiveRatio: number;
  expenseCoverage: number;
  debtRatio: number;
  savingsRate: number;
}

export type RecommendationPriority = 'high' | 'medium' | 'low';
export type RecommendationCategory = 'assets' | 'income' | 'expenses' | 'liabilities' | 'planning';

export interface PortfolioRecommendation {
  id: string;
  // Internationalization support
  titleKey?: string; // i18n key for title
  title?: string; // Direct title (fallback)
  descriptionKey?: string; // i18n key for description  
  description?: string; // Direct description (fallback)
  
  // Core properties
  category: RecommendationCategory;
  priority: RecommendationPriority;
  
  // Action properties
  actionCategory?: string; // e.g., 'income', 'assets', 'expenses'
  actionSubCategory?: string; // e.g., 'passive', 'management', 'sources'
  
  // Metadata and context
  metadata?: Record<string, unknown>; // Flexible metadata object
  
  // Optional properties for enhanced recommendations
  impact?: number; // Expected impact score (0-100)
  confidence?: number; // Confidence level (0-100)
  actionItems?: string[];
  relatedAssets?: string[]; // Asset IDs
  estimatedTimeToImplement?: number; // in days
  potentialReturn?: number; // Expected return improvement
  riskLevel?: 'low' | 'medium' | 'high';
  tags?: string[];
  createdAt?: string;
  isRead?: boolean;
  isImplemented?: boolean;
}

// === Application Notifications Types (moved from service layer) ===

export interface FinancialMetrics {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyLiabilityPayments: number;
  monthlyAssetIncome: number;
  passiveIncome: number;
  monthlyCashFlow: number;
}

export interface UIAlert {
  type: 'warning' | 'info' | 'success';
  title: string;
  description: string;
  action: () => void;
  actionLabel: string;
}

export interface FinancialAlert {
  id: string;
  type: 'warning' | 'info' | 'success' | 'critical';
  category: 'cashflow' | 'debt' | 'passive_income' | 'savings' | 'emergency_fund' | 'diversification' | 'general';
  titleKey: string;
  descriptionKey: string;
  priority: number;
  actionType: 'navigate' | 'external' | 'none';
  actionData?: {
    route?: string;
    url?: string;
    params?: Record<string, unknown>;
  };
  actionLabelKey?: string;
  thresholds?: {
    warning?: number;
    critical?: number;
  };
  calculatedValue?: number;
  metadata?: Record<string, unknown>;
}

// Liability Analytics specific types
export interface LiabilityBreakdownItem {
  category: string;
  amount: number;
  percentage: number;
}

export interface LiabilityItem {
  name: string;
  amount: number;
  category: string;
  percentage: number;
}

export interface InterestRateComparisonItem {
  name: string;
  rate: number;
  type: string;
}

export interface PaymentScheduleItem {
  month: string;
  amount: number;
  breakdown: { name: string; amount: number }[];
}

export interface DebtProjectionItem {
  month: string;
  total: number;
  [liabilityName: string]: string | number;
}

export interface LiabilityAnalyticsData {
  monthlyBreakdown: LiabilityBreakdownItem[];
  annualBreakdown: LiabilityBreakdownItem[];
  monthlyIndividualLiabilities: LiabilityItem[];
  annualIndividualLiabilities: LiabilityItem[];
  debtBalanceBreakdown: LiabilityBreakdownItem[];
  annualInterestBreakdown: LiabilityBreakdownItem[];
  interestRateComparison: InterestRateComparisonItem[];
  paymentScheduleData: PaymentScheduleItem[];
  debtProjectionData5Years: DebtProjectionItem[];
  debtProjectionData10Years: DebtProjectionItem[];
  debtProjectionData30Years: DebtProjectionItem[];
  totalMonthlyPayments: number;
  totalAnnualPayments: number;
  totalDebt: number;
  totalAnnualInterest: number;
}
