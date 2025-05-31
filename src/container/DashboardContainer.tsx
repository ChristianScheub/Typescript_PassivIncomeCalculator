import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { analytics } from '../service/analytics';
import Logger from '../service/Logger/logger';
import calculatorService from '../service/calculatorService';
import DashboardView from '../view/DashboardView';
import { createDividendCacheService } from '../service/dividendCacheService';

const DashboardContainer: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const assets = useAppSelector(state => state.assets.items);
  const expenses = useAppSelector(state => state.expenses.items);
  const income = useAppSelector(state => state.income.items);
  const liabilities = useAppSelector(state => state.liabilities.items);

  // Initialize dividend cache service
  React.useEffect(() => {
    createDividendCacheService(dispatch);
  }, [dispatch]);

  // Calculate totals
  const totalMonthlyIncome = calculatorService.calculateTotalMonthlyIncome(income);
  const totalMonthlyExpenses = calculatorService.calculateTotalMonthlyExpenses(expenses);
  const totalLiabilityPayments = calculatorService.calculateTotalMonthlyLiabilityPayments(liabilities);

  // Use cached calculation for monthly asset income
  const monthlyAssetIncome = calculatorService.calculateTotalMonthlyAssetIncomeWithCache
    ? calculatorService.calculateTotalMonthlyAssetIncomeWithCache(assets)
    : calculatorService.calculateTotalMonthlyAssetIncome(assets);

  // For passive income, we still use the regular calculation as it needs to check for overlapping income entries
  const passiveIncome = calculatorService.calculatePassiveIncome(income, assets);

  // Calculate derived values
  const totalAssetValue = calculatorService.calculateTotalAssetValue(assets);
  const totalLiabilityValue = calculatorService.calculateTotalDebt(liabilities);
  const netWorth = calculatorService.calculateNetWorth(totalAssetValue, totalLiabilityValue);

  const monthlyCashFlow = calculatorService.calculateMonthlyCashFlow(
    totalMonthlyIncome + monthlyAssetIncome, 
    totalMonthlyExpenses,
    totalLiabilityPayments
  );
  const passiveIncomeRatio = calculatorService.calculatePassiveIncomeRatio(totalMonthlyIncome, passiveIncome);
  const assetAllocation = calculatorService.calculateAssetAllocation(assets);

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
