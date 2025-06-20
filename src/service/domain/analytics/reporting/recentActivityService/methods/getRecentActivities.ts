import type { RecentActivity } from '@/types/domains/analytics/reporting';
import { sharedActivityManager } from '../core/sharedManager';

export const getRecentActivities = (maxEntries: number = 5): RecentActivity[] => {
  return sharedActivityManager.getRecentActivities(maxEntries);
};
