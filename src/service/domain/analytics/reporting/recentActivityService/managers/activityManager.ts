
import { RecentActivity, ActivityType, ActivityServiceConfig } from '@/types/domains/analytics/reporting';
import { createStorageManager } from './storageManager';
import { createActivityFactory } from '../core/activityFactory';
import Logger from "@/service/shared/logging/Logger/logger";

// Activity Manager for CRUD operations
export const createActivityManager = (config: ActivityServiceConfig) => {
  const storageManager = createStorageManager(config);
  const activityFactory = createActivityFactory();

  const addActivity = (activity: RecentActivity): void => {
    try {
      let activities = storageManager.loadActivities(activity.type);
      
      // Remove duplicate activity (same category/subcategory for analytics/portfolio)
      if (activity.type === 'analytics' || activity.type === 'portfolio') {
        activities = activities.filter(existing => {
          if (existing.type !== activity.type) return true;
          
          if (activity.type === 'analytics' && existing.type === 'analytics') {
            return !(existing.category === activity.category && 
                    existing.subCategory === activity.subCategory);
          }
          
          if (activity.type === 'portfolio' && existing.type === 'portfolio') {
            return !(existing.category === activity.category && 
                    existing.subCategory === activity.subCategory);
          }
          
          return true;
        });
      }
      
      // Add new activity at the beginning
      activities.unshift(activity);
      storageManager.saveActivities(activity.type, activities);
      Logger.info(`Added ${activity.type} activity: ${activity.titleKey}`);
    } catch (error) {
      Logger.error(`Error adding activity: ${JSON.stringify(error as Error)}`);
    }
  };

  const getActivities = (type?: ActivityType, maxEntries?: number): RecentActivity[] => {
    try {
      if (type) {
        const activities = storageManager.loadActivities(type);
        return maxEntries ? activities.slice(0, maxEntries) : activities;
      }
      
      const allActivities = storageManager.getAllActivities();
      return maxEntries ? allActivities.slice(0, maxEntries) : allActivities;
    } catch (error) {
      Logger.error(`Error getting activities: ${JSON.stringify(error as Error)}`);
      return [];
    }
  };

  const clearActivities = (type?: ActivityType): void => {
    try {
      if (type) {
        storageManager.clearActivities(type);
      } else {
        // Clear all activity types
        storageManager.clearActivities('analytics');
        storageManager.clearActivities('portfolio');
        storageManager.clearActivities('asset');
      }
      Logger.info(`Cleared ${type || 'all'} activities`);
    } catch (error) {
      Logger.error(`Error clearing activities: ${JSON.stringify(error as Error)}`);
    }
  };

  const getRecentActivities = (maxEntries: number = 5): RecentActivity[] => {
    return getActivities(undefined, maxEntries);
  };

  return {
    addActivity,
    getActivities,
    clearActivities,
    getRecentActivities,
    activityFactory
  };
};
