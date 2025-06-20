import { IRecentActivityService } from './interfaces/IRecentActivityService';
import { addAnalyticsActivity } from './methods/addAnalyticsActivity';
import { addPortfolioActivity } from './methods/addPortfolioActivity';
import { addTransactionActivity } from './methods/addTransactionActivity';
import { getRecentActivities } from './methods/getRecentActivities';
import { getActivitiesByType } from './methods/getActivitiesByType';
import { clearActivities } from './methods/clearActivities';

const recentActivityService: IRecentActivityService = {
  addAnalyticsActivity,
  addPortfolioActivity,
  addTransactionActivity,
  getRecentActivities,
  getActivitiesByType,
  clearActivities
};

export type { IRecentActivityService };
export default recentActivityService;

// Keine fachlichen Types mehr exportieren, nur noch Service-Interface falls vorhanden.
