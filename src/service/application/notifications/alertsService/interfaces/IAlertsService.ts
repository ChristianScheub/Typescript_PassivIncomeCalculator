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
  titleKey: string; // Translation key instead of translated text
  descriptionKey: string; // Translation key instead of translated text
  priority: number; // 1-10, higher = more important
  actionType: 'navigate' | 'external' | 'none';
  actionData?: {
    route?: string;
    url?: string;
    params?: Record<string, any>;
  };
  actionLabelKey?: string; // Translation key for action label
  thresholds?: {
    warning?: number;
    critical?: number;
  };
  calculatedValue?: number;
  metadata?: Record<string, any>; // Additional data for the alert
}

export interface AlertGenerationOptions {
  maxAlerts?: number;
  includeSuccess?: boolean;
  priorityThreshold?: number;
  excludeCategories?: string[];
}

export interface IBaseAlertsService {
  generateFinancialAlerts: (
    metrics: FinancialMetrics, 
    options?: AlertGenerationOptions
  ) => FinancialAlert[];
  
  calculateAlertPriority: (alert: FinancialAlert, metrics: FinancialMetrics) => number;
  
  filterAlertsByType: (
    alerts: FinancialAlert[], 
    type?: FinancialAlert['type']
  ) => FinancialAlert[];
}

export interface IAlertsService extends IBaseAlertsService {
  transformToUIAlerts: (
    financialAlerts: FinancialAlert[],
    t: (key: string) => string,
    navigate: (route: string) => void
  ) => UIAlert[];
}
