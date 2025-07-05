import React, { useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { loadDashboardSettingsFromStorage } from '@/store/slices/dashboardSettingsSlice';
import { 
  selectFinancialSummary
} from '@/store/slices/calculatedDataSlice';
import DashboardView from '@/view/finance-hub/overview/DashboardView';
import AssetFocusDashboardContainer from './AssetDashboardContainer';
import analyticsService from '@/service/domain/analytics/calculations/financialAnalyticsService';
import alertsService from '@/service/application/notifications/alertsService';
import { useDashboardConfig } from '../../hooks/useDashboardConfig';
import cacheRefreshService from '@/service/application/orchestration/cacheRefreshService';
import Logger from '@/service/shared/logging/Logger/logger';
import { useAsyncOperation } from '../../utils/containerUtils';

const DashboardContainer: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { executeAsyncOperation } = useAsyncOperation();

  // Redux state
  const { mode: dashboardMode } = useAppSelector(state => state.dashboardSettings);
  
  // Cached financial summary from Redux (should be available after initialization)
  const financialSummaryCache = useAppSelector(selectFinancialSummary);

  // Get financial summary from cache or provide fallback
  const financialSummary = useMemo(() => financialSummaryCache || {
    netWorth: 0,
    totalAssets: 0,
    totalLiabilities: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    monthlyCashFlow: 0
  }, [financialSummaryCache]);

  const ratios = useMemo(() => 
    analyticsService.calculateRatios(financialSummary),
    [financialSummary]
  );

  // Navigation handlers
  const navigationHandlers = useMemo(() => ({
    onNavigateToIncome: () => navigate('/portfolio'),
    onNavigateToExpenses: () => navigate('/portfolio'),
    onNavigateToAssets: () => navigate('/portfolio'),
    onNavigateToLiabilities: () => navigate('/portfolio'),
    onNavigateToForecast: () => navigate('/analytics'),
    onNavigateToSettings: () => navigate('/settings'),
    // Quick Action specific handlers - navigate to portfolio with URL parameters
    onAddIncome: () => navigate('/portfolio?category=income&action=addIncome'),
    onAddExpense: () => navigate('/portfolio?category=expenses&action=addExpense'),
    onAddTransaction: () => navigate('/portfolio?category=assets&action=addTransaction'),
    onAddLiability: () => navigate('/portfolio?category=liabilities&action=addDebt')
  }), [navigate]);

  // UI Configuration using custom hook
  const { quickActions, miniAnalytics, milestones } = useDashboardConfig(
    ratios,
    financialSummary.totalLiabilities,
    navigationHandlers
  );

  // Alerts configuration
  const alerts = useMemo(() => {
    const financialAlerts = alertsService.generateFinancialAlerts(financialSummary, {
      maxAlerts: 3,
      includeSuccess: true,
      priorityThreshold: 1
    });

    return alertsService.transformToUIAlerts(financialAlerts, t, navigate);
  }, [financialSummary, navigate, t]);

  // Effects
  // Load dashboard settings from localStorage on mount
  useEffect(() => {
    dispatch(loadDashboardSettingsFromStorage());
  }, [dispatch]);

  // Debug: Log dashboard mode changes
  useEffect(() => {
    Logger.infoService(`DashboardContainer: Dashboard mode is '${dashboardMode}'`);
  }, [dashboardMode]);

  // Pull-to-refresh state for PullToRefresh
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Pull to refresh handler - only works when user is at the top of the page
  const handleRefresh = useCallback(async () => {
    const isAtTop = window.scrollY <= 10; // Allow 10px tolerance
    if (!isAtTop) {
      Logger.infoService("Dashboard pull-to-refresh ignored - user not at top of page (scrollY: " + window.scrollY + ")");
      return;
    }
    Logger.infoService("Dashboard pull-to-refresh triggered - user at top of page");
    setIsRefreshing(true);
    try {
      await executeAsyncOperation(
        'refresh dashboard cache',
        () => cacheRefreshService.refreshAllCaches()
      );
    } finally {
      setIsRefreshing(false);
    }
  }, [executeAsyncOperation]);

  // Dashboard mode routing
  if (dashboardMode === 'assetFocus') {
    Logger.infoService("DashboardContainer: Rendering AssetFocusDashboardContainer");
    return <AssetFocusDashboardContainer />;
  }

  // Default: Smart Summary Dashboard
  Logger.infoService("DashboardContainer: Rendering DashboardView (Smart Summary)");
  return (
    <DashboardView
      financialSummary={financialSummary}
      quickActions={quickActions}
      miniAnalytics={miniAnalytics}
      milestones={milestones}
      alerts={alerts}
      navigationHandlers={navigationHandlers}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
    />
  );
};

export default DashboardContainer;
