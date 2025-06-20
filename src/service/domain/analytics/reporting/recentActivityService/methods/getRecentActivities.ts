import type { RecentActivity } from '../types';
import { sharedActivityManager } from '../core/sharedManager';

export const getRecentActivities = (maxEntries: number = 5): RecentActivity[] => {
  return sharedActivityManager.getRecentActivities(maxEntries);
};
