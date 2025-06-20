
import { PortfolioCategory, PortfolioSubCategory, ActivityType, AnalyticsCategory, AnalyticsSubCategory } from '@/types/domains/analytics/reporting';

// Icon Resolver for different activity types
export const createIconResolver = () => {
  const getAnalyticsIcon = (category: AnalyticsCategory, subCategory: AnalyticsSubCategory): string => {
    const iconMap: Record<string, string> = {
      'overview-dashboard': 'BarChart3',
      'overview-summary': 'PieChart',
      'distributions-assets': 'PieChart',
      'distributions-income': 'TrendingUp',
      'distributions-expenses': 'TrendingDown',
      'distributions-geographic': 'Globe',
      'performance-portfolioPerformance': 'Activity',
      'performance-returns': 'TrendingUp',
      'performance-historical': 'Calendar',
      'custom-calendar': 'Calendar',
      'custom-history': 'History',
      'custom-timeline': 'GitBranch',
      'milestones-fire': 'Target',
      'milestones-debt': 'CreditCard',
      'milestones-savings': 'PiggyBank',
      'forecasting-cashflow': 'TrendingUp',
      'forecasting-portfolio': 'LineChart',
      'forecasting-scenarios': 'GitBranch'
    };
    
    return iconMap[`${category}-${subCategory}`] || 'PieChart';
  };

  const getPortfolioIcon = (category: PortfolioCategory, subCategory?: PortfolioSubCategory): string => {
    const iconMap: Record<string, string> = {
      'overview': 'Home',
      'assets-portfolio': 'Wallet',
      'assets-definitions': 'Settings',
      'assets-categories': 'FolderOpen',
      'assets-calendar': 'Calendar',
      'assets-history': 'History',
      'liabilities-debts': 'Landmark',
      'liabilities-payments': 'CreditCard',
      'liabilities-projections': 'TrendingDown',
      'income-sources': 'DollarSign',
      'income-streams': 'TrendingUp',
      'expenses-categories': 'ReceiptText',
      'expenses-budgets': 'Calculator',
      'expenses-tracking': 'PieChart',
      'transactions-recent': 'Activity',
      'transactions-import': 'Upload',
      'transactions-export': 'Download'
    };

    const key = subCategory ? `${category}-${subCategory}` : category;
    return iconMap[key] || 'Activity';
  };

  const getTransactionIcon = (type: Exclude<ActivityType, 'analytics' | 'portfolio'>): string => {
    const iconMap: Record<string, string> = {
      'asset': 'TrendingUp',
      'transaction': 'Activity',
      'income': 'Plus',
      'expense': 'Minus',
      'liability': 'CreditCard'
    };

    return iconMap[type] || 'Activity';
  };

  return {
    getAnalyticsIcon,
    getPortfolioIcon,
    getTransactionIcon
  };
};
