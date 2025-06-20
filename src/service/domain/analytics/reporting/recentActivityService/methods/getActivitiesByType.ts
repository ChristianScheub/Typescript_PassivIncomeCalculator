import type { ActivityType, RecentActivity } from '@/types/domains/analytics/reporting';
import { sharedActivityManager } from '../core/sharedManager';

export const getActivitiesByType = (type: ActivityType, maxEntries?: number): RecentActivity[] => {
  return sharedActivityManager.getActivities(type, maxEntries);
};
