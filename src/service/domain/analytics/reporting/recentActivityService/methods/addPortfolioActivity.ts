import type { PortfolioCategory, PortfolioSubCategory } from '../types';
import { sharedActivityManager } from '../core/sharedManager';
import Logger from '../../../../../shared/logging/Logger/logger';

export const addPortfolioActivity = (
  category: PortfolioCategory,
  subCategory?: PortfolioSubCategory
): void => {
  const activity = sharedActivityManager.activityFactory.createPortfolioActivity(category, subCategory);
  sharedActivityManager.addActivity(activity);
  
  const activityPath = subCategory ? `${category}/${subCategory}` : category;
  Logger.info(`Added portfolio activity: ${activityPath}`);
};
