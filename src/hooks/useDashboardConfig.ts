import { useMemo } from 'react';
import { FinancialRatios } from '../service/analytics/financialAnalyticsService/interfaces/IAnalyticsService';
import { NavigationHandlers } from '../service/configService/interfaces/IConfigService';
import configService from '../service/infrastructure/configService';

export const useDashboardConfig = (
  ratios: FinancialRatios,
  totalLiabilities: number,
  navigationHandlers: NavigationHandlers
) => {
  const quickActions = useMemo(() => 
    configService.getDashboardQuickActions(navigationHandlers),
    [navigationHandlers]
  );

  const miniAnalytics = useMemo(() => 
    configService.getDashboardMiniAnalytics(ratios, navigationHandlers),
    [ratios, navigationHandlers]
  );

  const milestones = useMemo(() => 
    configService.getDashboardMilestones(ratios, totalLiabilities, navigationHandlers),
    [ratios, totalLiabilities, navigationHandlers]
  );

  return { quickActions, miniAnalytics, milestones };
};
