import React, { useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { calculate30DayHistory } from '../../store/slices/portfolioHistorySlice';
import DashboardView from '../../view/finance-hub/overview/DashboardView';
import analyticsService from '../../service/analyticsService';
import alertsService from '../../service/alertsService';
import { useDashboardConfig } from '../../hooks/useDashboardConfig';
import cacheRefreshService from '../../service/cacheRefreshService';
import Logger from '../../service/Logger/logger';

const DashboardContainer: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux state
  const { items: assets } = useAppSelector(state => state.transactions);
  const { items: assetDefinitions } = useAppSelector(state => state.assetDefinitions);
  const { items: liabilities } = useAppSelector(state => state.liabilities);
  const { items: expenses } = useAppSelector(state => state.expenses);
  const { items: income } = useAppSelector(state => state.income);
  const { history30Days = [], status } = useAppSelector(state => state.portfolioHistory || {});

  // Financial calculations using analyticsService
  const financialSummary = useMemo(() => 
    analyticsService.calculateFinancialSummary(assets, liabilities, expenses, income, assetDefinitions),
    [assets, liabilities, expenses, income, assetDefinitions]
  );

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

  // Pull to refresh handler - only works when user is at the top of the page
  const handleRefresh = useCallback(async () => {
    // Check if user is at the top of the page (with small tolerance for mobile)
    const isAtTop = window.scrollY <= 10; // Allow 10px tolerance
    
    if (!isAtTop) {
      Logger.infoService("Dashboard pull-to-refresh ignored - user not at top of page (scrollY: " + window.scrollY + ")");
      return; // Don't trigger refresh if not at top
    }

    Logger.infoService("Dashboard pull-to-refresh triggered - user at top of page");
    try {
      await cacheRefreshService.refreshAllCaches();
      Logger.infoService("Dashboard cache refresh completed successfully");
    } catch (error) {
      Logger.error("Dashboard cache refresh failed: " + JSON.stringify(error));
      throw error; // Re-throw to let the UI handle the error state
    }
  }, []);

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
