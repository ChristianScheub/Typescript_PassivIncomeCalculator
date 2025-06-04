import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { analytics } from '../service/analytics';
import Logger from '../service/Logger/logger';
import DashboardView from '../view/DashboardView';
import { createDividendCacheService } from '../service/dividendCacheService';
import { updateDashboardValues } from '../store/slices/dashboardSlice';
import { createStockAPIService } from '../service/stockAPIService';
import { isApiKeyConfigured } from '../service/stockAPIService/utils/fetch';
import { StockInfo } from '../types/stock';

const DashboardContainer: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [stockInfo, setStockInfo] = React.useState<StockInfo | null>(null);
  const [isLoadingStock, setIsLoadingStock] = React.useState(false);
  
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
      totalAssets,
      totalLiabilities,
      monthlyIncome,
      monthlyExpenses,
      monthlyCashFlow,
      passiveIncomeRatio
    });
    // Navigate to settings page or open settings modal
    navigate('/settings');
  };

  const handleFetchStock = async () => {
    setIsLoadingStock(true);
    try {
      // Check if API key is configured
      if (!isApiKeyConfigured()) {
        setStockInfo({
          error: 'API key not configured. Please set your Finnhub API key in Settings.',
          needsApiKey: true
        });
        return;
      }

      const stockAPI = createStockAPIService();
      const data = await stockAPI.getQuote('AAPL');
      setStockInfo(data);
      Logger.info('Successfully fetched AAPL stock information');
    } catch (error) {
      Logger.error(`Error fetching stock information: ${JSON.stringify(error)}`);
      setStockInfo({
        error: error instanceof Error ? error.message : 'Failed to fetch stock data',
        needsApiKey: false
      });
    } finally {
      setIsLoadingStock(false);
    }
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
      passiveIncomeRatio
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
      passiveIncomeRatio={passiveIncomeRatio}
      stockInfo={stockInfo}
      isLoadingStock={isLoadingStock}
      handleFetchStock={handleFetchStock}
      assetAllocation={assetAllocation}
      handleSettingsClick={handleSettingsClick}
    />
  );
};

export default DashboardContainer;
