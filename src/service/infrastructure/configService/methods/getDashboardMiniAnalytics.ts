import { TrendingUp, TrendingDown, Target, ArrowUpRight } from 'lucide-react';
import { MiniAnalytic, NavigationHandlers } from '../interfaces/IConfigService';
import { FinancialRatios } from '@/types/domains/analytics';

export const getDashboardMiniAnalytics = (
  ratios: FinancialRatios,
  handlers: NavigationHandlers
): MiniAnalytic[] => [
  {
    id: 'passiveRatio',
    titleKey: 'dashboard.passiveRatio',
    value: `${ratios.passiveRatio.toFixed(1)}%`,
    icon: TrendingUp,
    colorClass: 'text-purple-600 dark:text-purple-400',
    onClick: handlers.onNavigateToIncome
  },
  {
    id: 'expenseCoverage',
    titleKey: 'dashboard.expenseCoverage',
    value: `${ratios.expenseCoverage.toFixed(1)}%`,
    icon: Target,
    colorClass: 'text-green-600 dark:text-green-400',
    onClick: handlers.onNavigateToForecast
  },
  {
    id: 'debtRatio',
    titleKey: 'dashboard.debtRatio',
    value: `${ratios.debtRatio.toFixed(1)}%`,
    icon: TrendingDown,
    colorClass: 'text-orange-600 dark:text-orange-400',
    onClick: handlers.onNavigateToLiabilities
  },
  {
    id: 'savingsRate',
    titleKey: 'dashboard.savingsRate',
    value: `${ratios.savingsRate.toFixed(1)}%`,
    icon: ArrowUpRight,
    colorClass: 'text-blue-600 dark:text-blue-400',
    onClick: handlers.onNavigateToForecast
  }
];
