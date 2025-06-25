import { useMemo } from 'react';
import configService from '@/service/infrastructure/configService';
import { NavigationHandlers } from '@/service/infrastructure/configService/interfaces/IConfigService';
import { FinancialRatios } from '@/types/domains/analytics';

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
