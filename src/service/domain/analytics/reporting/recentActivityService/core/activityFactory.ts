
import type { 
  AnalyticsActivity, 
  PortfolioActivity, 
  TransactionActivity,
  PortfolioCategory,
  PortfolioSubCategory,
  ActivityType,
  AnalyticsCategory, 
  AnalyticsSubCategory
} from '@/types/domains/analytics/reporting';
import { createIconResolver } from '../resolvers/iconResolver';

// Activity Factory for creating different activity types
export const createActivityFactory = () => {
  const iconResolver = createIconResolver();

  const createAnalyticsActivity = (
    category: AnalyticsCategory,
    subCategory: AnalyticsSubCategory
  ): AnalyticsActivity => {
    const titleKey = `analytics.hub.activities.${category}.${subCategory}`;
    const icon = iconResolver.getAnalyticsIcon(category, subCategory);
    
    return {
      id: `analytics-${category}-${subCategory}-${Date.now()}`,
      type: 'analytics',
      category,
      subCategory,
      timestamp: Date.now(),
      titleKey,
      icon,
      date: new Date().toISOString()
    };
  };

  const createPortfolioActivity = (
    category: PortfolioCategory,
    subCategory?: PortfolioSubCategory
  ): PortfolioActivity => {
    // Generate flattened key to avoid nested object issues
    const titleKey = subCategory 
      ? `portfolio.hub.activities.${category}.${subCategory}`
      : `portfolio.hub.activities.${category}`;
    const icon = iconResolver.getPortfolioIcon(category, subCategory);
    
    return {
      id: `portfolio-${category}-${subCategory || 'default'}-${Date.now()}`,
      type: 'portfolio',
      category,
      subCategory,
      timestamp: Date.now(),
      titleKey,
      icon,
      date: new Date().toISOString()
    };
  };

  const createTransactionActivity = (
    type: Exclude<ActivityType, 'analytics' | 'portfolio'>,
    titleKey: string,
    subtitleKey?: string,
    entityId?: string,
    amount?: number,
    currency: string = 'EUR'
  ): TransactionActivity => {
    const icon = iconResolver.getTransactionIcon(type);
    
    return {
      id: `${type}-${entityId || 'unknown'}-${Date.now()}`,
      type,
      timestamp: Date.now(),
      titleKey,
      subtitleKey,
      icon,
      date: new Date().toISOString(),
      entityId,
      amount,
      currency
    };
  };

  return {
    createAnalyticsActivity,
    createPortfolioActivity,
    createTransactionActivity
  };
};
