
import { ActivityServiceConfig } from '../types';

// Default Configuration for Recent Activity Service
export const DEFAULT_CONFIG: ActivityServiceConfig = {
  maxHistoryEntries: 10,
  storageKeys: {
    analytics: 'recent_activities_analytics',
    portfolio: 'recent_activities_portfolio', 
    transactions: 'recent_activities_transactions'
  }
};

// Configuration Factory
export const createConfig = (overrides?: Partial<ActivityServiceConfig>): ActivityServiceConfig => {
  return {
    ...DEFAULT_CONFIG,
    ...overrides,
    storageKeys: {
      ...DEFAULT_CONFIG.storageKeys,
      ...overrides?.storageKeys
    }
  };
};

// Environment-specific configs
export const getConfigForEnvironment = (env: 'development' | 'production' | 'test' = 'production'): ActivityServiceConfig => {
  switch (env) {
    case 'development':
      return createConfig({
        maxHistoryEntries: 50, // More entries for development
        storageKeys: {
          analytics: 'dev_recent_activities_analytics',
          portfolio: 'dev_recent_activities_portfolio',
          transactions: 'dev_recent_activities_transactions'
        }
      });
    
    case 'test':
      return createConfig({
        maxHistoryEntries: 5,
        storageKeys: {
          analytics: 'test_recent_activities_analytics',
          portfolio: 'test_recent_activities_portfolio',
          transactions: 'test_recent_activities_transactions'
        }
      });
    
    default:
      return DEFAULT_CONFIG;
  }
};
