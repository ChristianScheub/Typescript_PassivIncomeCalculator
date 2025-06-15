import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { analytics } from '../service/analytics';
import Logger from '../service/Logger/logger';
import DashboardView from '../view/dashboard/DashboardView';
// Removed dividend cache service import
import { updateDashboardValues } from '../store/slices/dashboardSlice';

const DashboardContainer: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // Get the base data
  const assets = useAppSelector(state => state.assets.items);
  const expenses = useAppSelector(state => state.expenses.items);
  const income = useAppSelector(state => state.income.items);
  const liabilities = useAppSelector(state => state.liabilities.items);

  // Get the calculated values from the dashboard store
  const {
    monthlyIncome,
    monthlyExpenses,
    monthlyLiabilityPayments,
    monthlyAssetIncome,
    passiveIncome,
    totalAssets,
    totalLiabilities,
    netWorth,
    monthlyCashFlow,
  } = useAppSelector(state => state.dashboard);

  // Dividend cache service initialization removed (now integrated in calculatorService)

  // Update dashboard values whenever the underlying data changes
  React.useEffect(() => {
    dispatch(updateDashboardValues());
  }, [dispatch, assets, income, expenses, liabilities]);

  const handleSettingsClick = () => {
    Logger.info('Settings button clicked');
    analytics.trackEvent('settings_click', { 
      page: 'dashboard',
      netWorth,
      totalAssets,
      totalLiabilities,
      monthlyIncome,
      monthlyExpenses,
      monthlyCashFlow,
    });
    // Navigate to settings page or open settings modal
    navigate('/settings');
  };


  // Track page view
  React.useEffect(() => {
    Logger.info('Dashboard mounted');
    analytics.trackEvent('page_view', { 
      page: 'dashboard',
      netWorth,
      totalAssets,
      totalLiabilities,
      monthlyIncome,
      monthlyExpenses,
      monthlyCashFlow,
    });
  }, []);

  return (
    <DashboardView
      netWorth={netWorth}
      totalAssets={totalAssets}
      totalLiabilities={totalLiabilities}
      monthlyIncome={monthlyIncome}
      monthlyExpenses={monthlyExpenses}
      monthlyLiabilityPayments={monthlyLiabilityPayments}
      monthlyAssetIncome={monthlyAssetIncome}
      passiveIncome={passiveIncome}
      monthlyCashFlow={monthlyCashFlow}
      handleSettingsClick={handleSettingsClick}
    />
  );
};

export default DashboardContainer;
