import React, { useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { calculate30DayHistory } from '../../store/slices/portfolioHistorySlice';
import { loadDashboardSettingsFromStorage } from '../../store/slices/dashboardSettingsSlice';
import { 
  calculateFinancialSummary,
  selectFinancialSummary
} from '../../store/slices/calculatedDataSlice';
import DashboardView from '../../view/finance-hub/overview/DashboardView';
import AssetFocusContainer from './AssetFocusContainer';
import analyticsService from '../../service/domain/analytics/calculations/financialAnalyticsService';
import alertsService from '../../service/application/notifications/alertsService';
import { useDashboardConfig } from '../../hooks/useDashboardConfig';
import cacheRefreshService from '../../service/application/orchestration/cacheRefreshService';
import Logger from '../../service/shared/logging/Logger/logger';
import { useAsyncOperation } from '../../utils/containerUtils';

const DashboardContainer: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { executeAsyncOperation } = useAsyncOperation();

  // Redux state
  const { items: assets } = useAppSelector(state => state.transactions);
  const { items: assetDefinitions } = useAppSelector(state => state.assetDefinitions);
  const { items: liabilities } = useAppSelector(state => state.liabilities);
  const { items: expenses } = useAppSelector(state => state.expenses);
  const { items: income } = useAppSelector(state => state.income);
  const { history30Days = [], status } = useAppSelector(state => state.portfolioHistory || {});
  const { mode: dashboardMode } = useAppSelector(state => state.dashboardSettings);
  
  // Cached financial summary from Redux
  const financialSummaryCache = useAppSelector(selectFinancialSummary);

  // Trigger financial summary calculation if cache is empty
  const shouldCalculateFinancialSummary = useMemo(() => {
    return !financialSummaryCache || 
           assets.length > 0 || liabilities.length > 0 || 
           expenses.length > 0 || income.length > 0;
  }, [financialSummaryCache, assets.length, liabilities.length, expenses.length, income.length]);

  React.useEffect(() => {
    if (shouldCalculateFinancialSummary) {
      Logger.cache('Dashboard: Dispatching calculateFinancialSummary');
      dispatch(calculateFinancialSummary());
    }
  }, [shouldCalculateFinancialSummary, dispatch]);

  // Get financial summary from cache or provide fallback
  const financialSummary = financialSummaryCache || {
    netWorth: 0,
    totalAssets: 0,
    totalLiabilities: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    monthlyCashFlow: 0
  };

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
  useEffect(() => {
    if (status === 'idle') {
      dispatch(calculate30DayHistory());
    }
  }, [dispatch, status]);

  // Load dashboard settings from localStorage on mount
  useEffect(() => {
    dispatch(loadDashboardSettingsFromStorage());
  }, [dispatch]);

  // Debug: Log dashboard mode changes
  useEffect(() => {
    Logger.infoService(`DashboardContainer: Dashboard mode is '${dashboardMode}'`);
  }, [dashboardMode]);

  // Pull to refresh handler - only works when user is at the top of the page
  const handleRefresh = useCallback(async () => {
    // Check if user is at the top of the page (with small tolerance for mobile)
    const isAtTop = window.scrollY <= 10; // Allow 10px tolerance
    
    if (!isAtTop) {
      Logger.infoService("Dashboard pull-to-refresh ignored - user not at top of page (scrollY: " + window.scrollY + ")");
      return; // Don't trigger refresh if not at top
    }

    Logger.infoService("Dashboard pull-to-refresh triggered - user at top of page");
    
    executeAsyncOperation(
      'refresh dashboard cache',
      () => cacheRefreshService.refreshAllCaches()
    );
  }, [executeAsyncOperation]);

  // Dashboard mode routing
  if (dashboardMode === 'assetFocus') {
    Logger.infoService("DashboardContainer: Rendering AssetFocusContainer");
    return <AssetFocusContainer />;
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
      history30Days={history30Days}
      navigationHandlers={navigationHandlers}
      onRefresh={handleRefresh}
    />
  );
};

export default DashboardContainer;
