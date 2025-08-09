import React, { useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { 
  selectFinancialSummary,
  calculateFinancialSummary
} from '@/store/slices/domain/transactionsSlice';
import { usePortfolioHistoryView } from '../../hooks/usePortfolioHistoryView';
import DashboardView from '@/view/finance-hub/overview/DashboardView';
import ErrorBoundary from '@/ui/shared/ErrorBoundary';
import AssetFocusDashboardContainer from './AssetDashboardContainer';
import analyticsService from '@/service/domain/analytics/calculations/financialAnalyticsService';
import alertsService from '@/service/application/notifications/alertsService';
import { useDashboardConfig } from '../../hooks/useDashboardConfig';
import cacheRefreshService from '@/service/application/orchestration/cacheRefreshService';
import Logger from '@/service/shared/logging/Logger/logger';
import { useAsyncOperation } from '../../utils/containerUtils';
import { AnyAction, ThunkDispatch } from '@reduxjs/toolkit';
import { RootState } from '@/store/config/storeConfig';

const DashboardContainer: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch() as ThunkDispatch<RootState, unknown, AnyAction>;
  const { executeAsyncOperation } = useAsyncOperation();

  // Redux state - get dashboard mode from Redux config
  const dashboardMode = useAppSelector((state) => state.config.dashboard.assetFocus.mode);
  
  // Cached financial summary from Redux (consolidated cache)
  const financialSummaryCache = useAppSelector(selectFinancialSummary);
  
  // Additional data for financial summary calculation
  const assets = useAppSelector((state) => state.transactions.items);
  const assetDefinitions = useAppSelector((state) => state.assetDefinitions.items);
  const liabilities = useAppSelector((state) => state.liabilities.items);
  const expenses = useAppSelector((state) => state.expenses.items);
  const income = useAppSelector((state) => state.income.items);

  // Get portfolio history data for dashboard chart (default to Max timeRange for dashboard)
  const portfolioHistoryData = usePortfolioHistoryView('Max');

  // Extract core financial data (remove cache metadata)
  const financialSummary = useMemo(() => {
    // Always ensure complete FinancialSummary structure
    const defaultSummary = {
      netWorth: 0,
      totalAssets: 0,
      totalLiabilities: 0,
      monthlyIncome: 0,
      monthlyExpenses: 0,
      monthlyCashFlow: 0,
      monthlyLiabilityPayments: 0,
      monthlyAssetIncome: 0,
      passiveIncome: 0,
      totalMonthlyIncome: 0,
      totalPassiveIncome: 0,
      totalMonthlyExpenses: 0,
      savingsRate: 0,
      emergencyFundMonths: 0
    };
    
    if (financialSummaryCache) {
      // Extract only the financial data, excluding cache metadata
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { lastCalculated: _, inputHash: __, ...coreData } = financialSummaryCache;
      return { ...defaultSummary, ...coreData };
    }
    
    return defaultSummary;
  }, [financialSummaryCache]);

  // Automatically calculate financial summary if missing or all zero
  useEffect(() => {
    const hasData = assets.length > 0 || liabilities.length > 0 || expenses.length > 0 || income.length > 0 || assetDefinitions.length > 0;
    const hasValidFinancialSummary = financialSummaryCache && 
      (financialSummaryCache.totalAssets > 0 || 
       financialSummaryCache.monthlyIncome > 0 || 
       financialSummaryCache.monthlyExpenses > 0 ||
       financialSummaryCache.totalLiabilities > 0);

    Logger.info(`DashboardContainer Debug: hasData=${hasData}, hasValidFinancialSummary=${hasValidFinancialSummary}`);
    Logger.info(`DashboardContainer Debug: assets=${assets.length}, assetDefinitions=${assetDefinitions.length}, income=${income.length}, expenses=${expenses.length}, liabilities=${liabilities.length}`);
    Logger.info(`DashboardContainer Debug: financialSummaryCache=${JSON.stringify(financialSummaryCache)}`);

    if (hasData && !hasValidFinancialSummary) {
      Logger.info('DashboardContainer: Financial summary missing or all zero, triggering calculation');
      Logger.info(`DashboardContainer: Data available - assets: ${assets.length}, assetDefinitions: ${assetDefinitions.length}, income: ${income.length}, expenses: ${expenses.length}, liabilities: ${liabilities.length}`);
      dispatch(calculateFinancialSummary({ liabilities, expenses, income }));
    }
  }, [dispatch, financialSummaryCache, assets, assetDefinitions, income, expenses, liabilities]);

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
    // Extract only FinancialMetrics properties for alert generation
    const metrics = {
      netWorth: financialSummary.netWorth,
      totalAssets: financialSummary.totalAssets,
      totalLiabilities: financialSummary.totalLiabilities,
      monthlyIncome: financialSummary.monthlyIncome,
      monthlyExpenses: financialSummary.monthlyExpenses,
      monthlyLiabilityPayments: financialSummary.monthlyLiabilityPayments,
      monthlyAssetIncome: financialSummary.monthlyAssetIncome,
      passiveIncome: financialSummary.passiveIncome,
      monthlyCashFlow: financialSummary.monthlyCashFlow
    };
    const financialAlerts = alertsService.generateFinancialAlerts(metrics);
    return alertsService.transformToUIAlerts(financialAlerts, t, navigate);
  }, [financialSummary, navigate, t]);

  // Effects
  // Dashboard settings are now auto-loaded via configSlice
  
  // Automatically calculate financial summary if missing or all zero
  useEffect(() => {
    const hasData = assets.length > 0 || liabilities.length > 0 || expenses.length > 0 || income.length > 0 || assetDefinitions.length > 0;
    const hasValidFinancialSummary = financialSummaryCache && 
      (financialSummaryCache.totalAssets > 0 || 
       financialSummaryCache.monthlyIncome > 0 || 
       financialSummaryCache.monthlyExpenses > 0 ||
       financialSummaryCache.totalLiabilities > 0);

    Logger.info(`DashboardContainer Debug: hasData=${hasData}, hasValidFinancialSummary=${hasValidFinancialSummary}`);
    Logger.info(`DashboardContainer Debug: assets=${assets.length}, assetDefinitions=${assetDefinitions.length}, income=${income.length}, expenses=${expenses.length}, liabilities=${liabilities.length}`);
    Logger.info(`DashboardContainer Debug: financialSummaryCache=${JSON.stringify(financialSummaryCache)}`);

    if (hasData && !hasValidFinancialSummary) {
      Logger.info('DashboardContainer: Financial summary missing or all zero, triggering calculation');
      Logger.info(`DashboardContainer: Data available - assets: ${assets.length}, assetDefinitions: ${assetDefinitions.length}, income: ${income.length}, expenses: ${expenses.length}, liabilities: ${liabilities.length}`);
      dispatch(calculateFinancialSummary({ liabilities, expenses, income }));
    }
  }, [dispatch, financialSummaryCache, assets, assetDefinitions, income, expenses, liabilities]);
  
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

  // Render based on dashboard mode
  if (dashboardMode === 'assetFocus') {
    Logger.infoService("DashboardContainer: Rendering AssetFocusDashboardContainer");
    return <AssetFocusDashboardContainer />;
  }

  // Default: Smart Summary Dashboard
  Logger.infoService("DashboardContainer: Rendering DashboardView (Smart Summary)");
  return (
    <ErrorBoundary>
      <DashboardView
        financialSummary={financialSummary}
        quickActions={quickActions}
        miniAnalytics={miniAnalytics}
        milestones={milestones}
        alerts={alerts}
        navigationHandlers={navigationHandlers}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        portfolioHistory={portfolioHistoryData}
      />
    </ErrorBoundary>
  );
};

export default DashboardContainer;
