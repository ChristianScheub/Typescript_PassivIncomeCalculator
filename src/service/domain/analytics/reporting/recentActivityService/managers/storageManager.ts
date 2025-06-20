
import { RecentActivity, ActivityType, ActivityServiceConfig } from '@/types/domains/analytics/reporting';
import Logger from "@/service/shared/logging/Logger/logger";

// Storage Manager for Recent Activities
export const createStorageManager = (config: ActivityServiceConfig) => {
  const getStorageKey = (type: ActivityType): string => {
    switch (type) {
      case 'analytics':
        return config.storageKeys.analytics;
      case 'portfolio':
        return config.storageKeys.portfolio;
      case 'asset':
      case 'transaction':
      case 'income':
      case 'expense':
      case 'liability':
        return config.storageKeys.transactions;
      default:
        return config.storageKeys.portfolio;
    }
  };

  const loadActivities = (type: ActivityType): RecentActivity[] => {
    try {
      const key = getStorageKey(type);
      const stored = localStorage.getItem(key);
      if (!stored) return [];
      
      const activities: RecentActivity[] = JSON.parse(stored);
      return activities.toSorted((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      Logger.error(`Error loading ${type} activities: ${JSON.stringify(error as Error)}`);
      return [];
    }
  };

  const saveActivities = (type: ActivityType, activities: RecentActivity[]): void => {
    try {
      const key = getStorageKey(type);
      const sortedActivities = activities
        .toSorted((a, b) => b.timestamp - a.timestamp)
        .slice(0, config.maxHistoryEntries);
      
      localStorage.setItem(key, JSON.stringify(sortedActivities));
      Logger.info(`Saved ${sortedActivities.length} ${type} activities`);
    } catch (error) {
      Logger.error(`Error saving ${type} activities: ${JSON.stringify(error as Error)}`);
    }
  };

  const clearActivities = (type: ActivityType): void => {
    try {
      const key = getStorageKey(type);
      localStorage.removeItem(key);
      Logger.info(`Cleared ${type} activities`);
    } catch (error) {
      Logger.error(`Error clearing ${type} activities: ${JSON.stringify(error as Error)}`);
    }
  };

  const getAllActivities = (): RecentActivity[] => {
    const allActivities: RecentActivity[] = [];
    
    Object.values(config.storageKeys).forEach(key => {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const activities: RecentActivity[] = JSON.parse(stored);
          allActivities.push(...activities);
        }
      } catch (error) {
        Logger.error(`Error loading activities from ${key}: ${JSON.stringify(error as Error)}`);
      }
    });
    
    return allActivities.sort((a, b) => b.timestamp - a.timestamp);
  };

  return {
    loadActivities,
    saveActivities,
    clearActivities,
    getAllActivities
  };
};
