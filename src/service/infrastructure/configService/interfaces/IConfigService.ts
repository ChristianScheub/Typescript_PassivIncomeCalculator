import { FinancialRatios } from '@/types/domains/analytics/reporting';

export interface QuickAction {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  translationKey: string;
  onClick: () => void;
}

export interface MiniAnalytic {
  id: string;
  titleKey: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  onClick: () => void;
}

export interface Milestone {
  id: string;
  titleKey: string;
  progress: number;
  target: number;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
}

export interface NavigationHandlers {
  onNavigateToIncome: () => void;
  onNavigateToExpenses: () => void;
  onNavigateToAssets: () => void;
  onNavigateToLiabilities: () => void;
  onNavigateToForecast: () => void;
  onNavigateToSettings: () => void;
  // Quick Action specific handlers
  onAddIncome: () => void;
  onAddExpense: () => void;
  onAddTransaction: () => void;
  onAddLiability: () => void;
}

export interface IConfigService {
  getDashboardQuickActions: (handlers: NavigationHandlers) => QuickAction[];
  getDashboardMiniAnalytics: (ratios: FinancialRatios, handlers: NavigationHandlers) => MiniAnalytic[];
  getDashboardMilestones: (ratios: FinancialRatios, totalLiabilities: number, handlers: NavigationHandlers) => Milestone[];
}
