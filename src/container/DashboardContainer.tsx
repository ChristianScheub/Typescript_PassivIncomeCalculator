import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { analytics } from '../service/analytics';
import Logger from '../service/Logger/logger';
import DashboardView from '../view/DashboardView';
import { createDividendCacheService } from '../service/dividendCacheService';
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
    totalMonthlyIncome,
    totalMonthlyExpenses,
    totalLiabilityPayments,
    monthlyAssetIncome,
    passiveIncome,
    totalAssetValue,
    totalLiabilityValue,
    netWorth,
    monthlyCashFlow,
    passiveIncomeRatio,
    assetAllocation,
  } = useAppSelector(state => state.dashboard);

  // Initialize dividend cache service
  React.useEffect(() => {
    createDividendCacheService(dispatch);
  }, [dispatch]);

  // Update dashboard values whenever the underlying data changes
  React.useEffect(() => {
    dispatch(updateDashboardValues());
  }, [dispatch, assets, income, expenses, liabilities]);

  const handleSettingsClick = () => {
    Logger.info('Settings button clicked');
    analytics.trackEvent('settings_click', { 
      page: 'dashboard',
      netWorth,
      totalAssets: totalAssetValue,
      totalLiabilities: totalLiabilityValue,
      monthlyIncome: totalMonthlyIncome,
      monthlyExpenses: totalMonthlyExpenses,
      monthlyCashFlow,
      passiveIncomeRatio
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
      totalAssets: totalAssetValue,
      totalLiabilities: totalLiabilityValue,
      monthlyIncome: totalMonthlyIncome,
      monthlyExpenses: totalMonthlyExpenses,
      monthlyCashFlow,
      passiveIncomeRatio
    });
  }, []);

  return (
    <DashboardView
      netWorth={netWorth}
      totalAssets={totalAssetValue}
      totalLiabilities={totalLiabilityValue}
      monthlyIncome={totalMonthlyIncome}
      monthlyExpenses={totalMonthlyExpenses}
      monthlyLiabilityPayments={totalLiabilityPayments}
      monthlyAssetIncome={monthlyAssetIncome}
      passiveIncome={passiveIncome}
      monthlyCashFlow={monthlyCashFlow}
      passiveIncomeRatio={passiveIncomeRatio}
      assets={assets}
      liabilities={liabilities}
      expenses={expenses}
      income={income}
      assetAllocation={assetAllocation}
      handleSettingsClick={handleSettingsClick}
    />
  );
};

export default DashboardContainer;
