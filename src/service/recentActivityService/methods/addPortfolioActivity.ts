import type { PortfolioCategory, PortfolioSubCategory } from '../types';
import { sharedActivityManager } from '../core/sharedManager';
import Logger from '../../Logger/logger';

export const addPortfolioActivity = (
  category: PortfolioCategory,
  subCategory?: PortfolioSubCategory
): void => {
  const activity = sharedActivityManager.activityFactory.createPortfolioActivity(category, subCategory);
  sharedActivityManager.addActivity(activity);
  Logger.info(`Added portfolio activity: ${category}${subCategory ? `/${subCategory}` : ''}`);
};
