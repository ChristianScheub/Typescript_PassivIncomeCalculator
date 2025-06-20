import type { AnalyticsCategory, AnalyticsSubCategory } from '../types/analytics';
import { sharedActivityManager } from '../core/sharedManager';
import Logger from "@/service/shared/logging/Logger/logger";

export const addAnalyticsActivity = (
  category: AnalyticsCategory,
  subCategory: AnalyticsSubCategory
): void => {
  const activity = sharedActivityManager.activityFactory.createAnalyticsActivity(category, subCategory);
  sharedActivityManager.addActivity(activity);
  Logger.info(`Added analytics activity: ${category}/${subCategory}`);
};
