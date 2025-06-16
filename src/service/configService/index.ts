import { IConfigService } from './interfaces/IConfigService';
import { getDashboardQuickActions } from './methods/getDashboardQuickActions';
import { getDashboardMiniAnalytics } from './methods/getDashboardMiniAnalytics';
import { getDashboardMilestones } from './methods/getDashboardMilestones';

const configService: IConfigService = {
  getDashboardQuickActions,
  getDashboardMiniAnalytics,
  getDashboardMilestones,
};

export type { IConfigService };
export default configService;
