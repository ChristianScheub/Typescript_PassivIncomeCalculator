import type { ActivityType } from '@/types/domains/analytics/reporting';
import { sharedActivityManager } from '../core/sharedManager';

export const clearActivities = (type?: ActivityType): void => {
  sharedActivityManager.clearActivities(type);
};
