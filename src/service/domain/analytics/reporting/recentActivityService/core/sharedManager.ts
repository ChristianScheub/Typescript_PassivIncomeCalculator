import { ActivityServiceConfig } from '@/types/domains/analytics';
import { createActivityManager } from '../managers/activityManager';

// Default Configuration for Recent Activity Service
const DEFAULT_CONFIG: ActivityServiceConfig = {
  maxHistoryEntries: 10,
  storageKeys: {
    analytics: 'recent_activities_analytics',
    portfolio: 'recent_activities_portfolio', 
    transactions: 'recent_activities_transactions'
  }
};

// Shared activity manager instance to ensure consistent state
export const sharedActivityManager = createActivityManager(DEFAULT_CONFIG);
