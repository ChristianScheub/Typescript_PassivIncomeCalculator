import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { calculate30DayHistory } from '../../store/slices/portfolioHistorySlice';
import DashboardView from '../../view/dashboard/DashboardView';
import analyticsService from '../../service/analyticsService';
import alertsService from '../../service/alertsService';
import { useDashboardConfig } from '../../hooks/useDashboardConfig';

const DashboardContainer: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux state
  const { items: assets } = useAppSelector(state => state.assets);
  const { items: liabilities } = useAppSelector(state => state.liabilities);
  const { items: expenses } = useAppSelector(state => state.expenses);
  const { items: income } = useAppSelector(state => state.income);
  const { history30Days = [], status } = useAppSelector(state => state.portfolioHistory || {});

  // Financial calculations using analyticsService
  const financialSummary = useMemo(() => 
    analyticsService.calculateFinancialSummary(assets, liabilities, expenses, income),
    [assets, liabilities, expenses, income]
  );

  const ratios = useMemo(() => 
    analyticsService.calculateRatios(financialSummary),
    [financialSummary]
  );

  // Navigation handlers
  const navigationHandlers = useMemo(() => ({
    onNavigateToIncome: () => navigate('/income'),
    onNavigateToExpenses: () => navigate('/expenses'),
    onNavigateToAssets: () => navigate('/assets'),
    onNavigateToLiabilities: () => navigate('/liabilities'),
    onNavigateToForecast: () => navigate('/forecast'),
    onNavigateToSettings: () => navigate('/settings')
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

  return (
    <DashboardView
      financialSummary={financialSummary}
      quickActions={quickActions}
      miniAnalytics={miniAnalytics}
      milestones={milestones}
      alerts={alerts}
      history30Days={history30Days}
      navigationHandlers={navigationHandlers}
    />
  );
};

export default DashboardContainer;
