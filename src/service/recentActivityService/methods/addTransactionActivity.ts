import type { ActivityType } from '../types';
import { sharedActivityManager } from '../core/sharedManager';
import Logger from '../../Logger/logger';

export const addTransactionActivity = (
  type: Exclude<ActivityType, 'analytics' | 'portfolio'>,
  titleKey: string,
  subtitleKey?: string,
  entityId?: string,
  amount?: number,
  currency?: string
): void => {
  const activity = sharedActivityManager.activityFactory.createTransactionActivity(
    type, titleKey, subtitleKey, entityId, amount, currency
  );
  sharedActivityManager.addActivity(activity);
  Logger.info(`Added transaction activity: ${type} - ${titleKey}`);
};
