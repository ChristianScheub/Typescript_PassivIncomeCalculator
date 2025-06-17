import type { ActivityType } from '../types';
import { sharedActivityManager } from '../core/sharedManager';

export const clearActivities = (type?: ActivityType): void => {
  sharedActivityManager.clearActivities(type);
};
