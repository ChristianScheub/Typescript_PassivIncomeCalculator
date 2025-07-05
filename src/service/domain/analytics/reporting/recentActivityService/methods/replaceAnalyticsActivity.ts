import { AnalyticsCategory, AnalyticsSubCategory } from '@/types/domains/analytics';
import { sharedActivityManager } from '../core/sharedManager';
import Logger from "@/service/shared/logging/Logger/logger";

export const replaceAnalyticsActivity = (
  oldCategory: AnalyticsCategory,
  oldSubCategory: AnalyticsSubCategory,
  newCategory: AnalyticsCategory,
  newSubCategory: AnalyticsSubCategory
): void => {
  sharedActivityManager.replaceAnalyticsActivity(oldCategory, oldSubCategory, newCategory, newSubCategory);
  Logger.info(`Replaced analytics activity: ${oldCategory}/${oldSubCategory} -> ${newCategory}/${newSubCategory}`);
};
