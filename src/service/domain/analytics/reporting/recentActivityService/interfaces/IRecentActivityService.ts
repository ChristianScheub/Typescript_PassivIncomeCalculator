import type { 
  ActivityType, 
  RecentActivity, 
  AnalyticsCategory, 
  AnalyticsSubCategory,
  PortfolioCategory,
  PortfolioSubCategory 
} from '@/types/domains/analytics/reporting';

export interface IRecentActivityService {
  // Analytics Methods
  addAnalyticsActivity: (
    category: AnalyticsCategory,
    subCategory: AnalyticsSubCategory
  ) => void;

  // Portfolio Methods
  addPortfolioActivity: (
    category: PortfolioCategory,
    subCategory?: PortfolioSubCategory
  ) => void;

  // Transaction Methods
  addTransactionActivity: (
    type: Exclude<ActivityType, 'analytics' | 'portfolio'>,
    titleKey: string,
    subtitleKey?: string,
    entityId?: string,
    amount?: number,
    currency?: string
  ) => void;

  // Get Methods
  getRecentActivities: (maxEntries?: number) => RecentActivity[];
  getActivitiesByType: (type: ActivityType, maxEntries?: number) => RecentActivity[];

  // Clear Methods
  clearActivities: (type?: ActivityType) => void;
  
  // Replace previous analytics activity with new one (for sub-navigation)
  replaceAnalyticsActivity: (
    oldCategory: AnalyticsCategory,
    oldSubCategory: AnalyticsSubCategory,
    newCategory: AnalyticsCategory,
    newSubCategory: AnalyticsSubCategory
  ) => void;
}
