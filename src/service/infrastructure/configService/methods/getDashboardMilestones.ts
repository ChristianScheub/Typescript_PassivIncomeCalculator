import { TrendingUp, Target, CheckCircle } from 'lucide-react';
import { FinancialRatios } from '../../analyticsService/interfaces/IAnalyticsService';
import { Milestone, NavigationHandlers } from '../interfaces/IConfigService';

export const getDashboardMilestones = (
  ratios: FinancialRatios,
  totalLiabilities: number,
  handlers: NavigationHandlers
): Milestone[] => [
  {
    id: 'expenseCoverage',
    titleKey: 'dashboard.milestone.expenseCoverage',
    progress: Math.min(ratios.expenseCoverage, 100),
    target: 100,
    color: 'green',
    icon: Target,
    onClick: handlers.onNavigateToForecast
  },
  {
    id: 'passiveIncome',
    titleKey: 'dashboard.milestone.passiveIncome',
    progress: ratios.passiveRatio,
    target: 50,
    color: 'purple',
    icon: TrendingUp,
    onClick: handlers.onNavigateToIncome
  },
  {
    id: 'debtFreedom',
    titleKey: 'dashboard.milestone.debtFreedom',
    progress: totalLiabilities > 0 ? Math.max(0, 100 - ratios.debtRatio) : 100,
    target: 100,
    color: 'orange',
    icon: CheckCircle,
    onClick: handlers.onNavigateToLiabilities
  }
];
