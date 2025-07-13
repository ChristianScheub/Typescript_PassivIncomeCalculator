import React, { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnyAction, ThunkDispatch } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { AssetFocusTimeRange } from '@/types/shared/analytics';
import { updateAssetDefinition } from '@/store/slices/domain';
import { setAssetFocusTimeRange, selectAssetFocusConfig } from '@/store/slices/configSlice';
import { usePortfolioHistory, useAssetFocusData, useFinancialSummary } from '../../hooks/useCalculatedDataCache';
import { usePortfolioIntradayView, usePortfolioHistoryView } from '../../hooks/usePortfolioHistoryView';
import AssetDashboardView from '@/view/finance-hub/overview/AssetDashboardView';
import AssetDetailModal from '@/view/finance-hub/overview/AssetDetailModal';
import { Asset, AssetDefinition } from '@/types/domains/assets/entities';
import { useAsyncOperation } from '../../utils/containerUtils';
import cacheRefreshService from '@/service/application/orchestration/cacheRefreshService';
import Logger from '@/service/shared/logging/Logger/logger';
import { useTranslation } from 'react-i18next';
import { calculateFinancialSummary, calculateAssetFocusData } from '@/store/slices/domain/transactionsSlice';
import { marketDataWorkerService } from '@/service/shared/workers/marketDataWorkerService';

const AssetFocusDashboardContainer: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { executeAsyncOperation } = useAsyncOperation();
  const { t } = useTranslation();

  // State for modal
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [selectedAssetDefinition, setSelectedAssetDefinition] = useState<AssetDefinition | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Redux state
  const { items: assetDefinitions } = useAppSelector(state => state.assetDefinitions);
  const { items: transactions } = useAppSelector(state => state.transactions);
  const assetFocus = useAppSelector(selectAssetFocusConfig);
  const isApiEnabled = useAppSelector(state => state.config.apis.stock.enabled);
  
  // Additional data for financial summary calculation
  const liabilities = useAppSelector((state) => state.liabilities.items);
  const expenses = useAppSelector((state) => state.expenses.items);
  const income = useAppSelector((state) => state.income.items);
  
  // Use cached calculated data with automatic calculation
  const portfolioHistoryData = usePortfolioHistory(assetFocus.timeRange);
  const intradayData = usePortfolioIntradayView();
  const portfolioHistoryViewData = usePortfolioHistoryView(assetFocus.timeRange); // NEW: For longer time ranges
  const assetFocusData = useAssetFocusData();
  const financialSummary = useFinancialSummary();

  // Automatically calculate financial summary if missing or all zero
  useEffect(() => {
    const hasData = liabilities.length > 0 || expenses.length > 0 || income.length > 0;
    const hasValidFinancialSummary = financialSummary.data && 
      (financialSummary.data.totalAssets > 0 || 
       financialSummary.data.monthlyIncome > 0 || 
       financialSummary.data.monthlyExpenses > 0 ||
       financialSummary.data.totalLiabilities > 0);

    if (hasData && !hasValidFinancialSummary) {
      Logger.info('AssetDashboardContainer: Financial summary missing or all zero, triggering calculation');
      Logger.info(`AssetDashboardContainer: Data available - income: ${income.length}, expenses: ${expenses.length}, liabilities: ${liabilities.length}`);
      dispatch(calculateFinancialSummary({ liabilities, expenses, income }) as any);
    }
  }, [dispatch, financialSummary.data, liabilities, expenses, income]);

  // Automatically calculate asset focus data if missing or empty
  useEffect(() => {
    const hasAssets = transactions.length > 0 || assetDefinitions.length > 0;
    const hasValidAssetFocusData = assetFocusData.data && 
      assetFocusData.data.assetsWithValues && 
      assetFocusData.data.assetsWithValues.length > 0;

    if (hasAssets && !hasValidAssetFocusData) {
      Logger.info('AssetDashboardContainer: Asset focus data missing or empty, triggering calculation');
      Logger.info(`AssetDashboardContainer: Data available - transactions: ${transactions.length}, assetDefinitions: ${assetDefinitions.length}`);
      dispatch(calculateAssetFocusData() as any);
    }
  }, [dispatch, assetFocusData.data, transactions.length, assetDefinitions.length]);

  // State for pull-to-refresh
  const [isRefreshing, setIsRefreshing] = useState(false);


  // Combine regular portfolio history with intraday data for enhanced view
  const enhancedPortfolioHistory = React.useMemo(() => {
    const baseData = portfolioHistoryData?.data || [];
    const newSystemData = portfolioHistoryViewData || [];
    Logger.info(`AssetFocusDashboardContainer enhancedPortfolioHistory: timeRange=${assetFocus.timeRange}, baseData=${baseData.length}, newSystemData=${newSystemData.length}, intradayData=${intradayData.length}`);

    // Für 1D: wie gehabt
    if (assetFocus.timeRange === '1D' && intradayData.length > 0) {
      // Filter intraday data based on timeRange
      let filteredIntradayData = intradayData;
      if (intradayData.length > 0) {
        // Sort by timestamp to get the most recent data first
        const sortedData = [...intradayData].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        // Get the most recent timestamp
        const mostRecentTimestamp = new Date(sortedData[0].timestamp);
        
        // Calculate 24 hours back from the most recent data point
        const twentyFourHoursBack = new Date(mostRecentTimestamp);
        twentyFourHoursBack.setHours(twentyFourHoursBack.getHours() - 24);
        
        // Filter data to show the last 24 hours of available data
        filteredIntradayData = intradayData.filter(point => 
          new Date(point.timestamp) >= twentyFourHoursBack
        );
        
        Logger.info(`1D: Showing last 24h of available data from ${mostRecentTimestamp.toISOString()}: ${filteredIntradayData.length} points from ${intradayData.length} total`);
      }
      
      // Convert filtered intraday data to portfolio history format
      const intradayHistoryPoints = filteredIntradayData.map(point => ({
        date: point.timestamp,
        totalValue: point.value,
        totalInvested: 0,
        totalReturn: 0,
        totalReturnPercentage: 0,
        positions: []
      }));
      
      Logger.info(`Sample intraday history points: ${JSON.stringify(intradayHistoryPoints.slice(0, 3))}`);
      
      // Combine base data with filtered intraday and sort by timestamp
      const combined = [...baseData, ...intradayHistoryPoints]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      Logger.info(`Combined portfolio history: ${combined.length} total points (${baseData.length} daily + ${intradayHistoryPoints.length} intraday)`);
      return combined;
    }

    // Für 1W: Zeige ALLE kombinierten Datenpunkte (intraday + daily, mit type-Flag)
    if (assetFocus.timeRange === '1W' && newSystemData.length > 0) {
      Logger.info(`Using combined 1W history from usePortfolioHistoryView: ${newSystemData.length} points`);
      // Sortiere alle Punkte nach Datum/Zeit
      const sorted = [...newSystemData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      // Map to PortfolioHistoryPoint structure
      return sorted.map(point => ({
        date: point.date,
        totalValue: point.totalValue,
        totalInvested: 0,
        totalReturn: point.change ?? 0,
        totalReturnPercentage: point.changePercentage ?? 0,
        positions: []
      }));
    }

    // Für längere Zeiträume wie gehabt
    if ((assetFocus.timeRange === '1M' || assetFocus.timeRange === '3M' || assetFocus.timeRange === '1Y' || assetFocus.timeRange === 'ALL') && newSystemData.length > 0) {
      Logger.info(`Using new portfolio history system for ${assetFocus.timeRange}: ${newSystemData.length} points`);
      return newSystemData.map(point => ({
        date: point.date,
        totalValue: point.totalValue,
        totalInvested: 0,
        totalReturn: point.change ?? 0,
        totalReturnPercentage: point.changePercentage ?? 0,
        positions: []
      }));
    }

    Logger.info(`Using regular daily data for timeRange=${assetFocus.timeRange}: ${baseData.length} points`);
    return baseData;
  }, [portfolioHistoryData?.data, portfolioHistoryViewData, intradayData, assetFocus.timeRange]);

  // Get data from hooks
  const assetFocusDataResult = assetFocusData.data || { assetsWithValues: [], portfolioSummary: null };
  const { assetsWithValues, portfolioSummary } = assetFocusDataResult;

  // Navigation handlers
  const handleNavigateToForecast = useCallback(() => {
    navigate('/analytics');
  }, [navigate]);

  const handleNavigateToSettings = useCallback(() => {
    navigate('/settings');
  }, [navigate]);

  // Asset detail modal handlers
  const handleAssetClick = useCallback((assetDefinition: AssetDefinition) => {
    setSelectedAsset(null);
    setSelectedAssetDefinition(assetDefinition);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // Helper function to get asset type label
  const getAssetTypeLabel = useCallback((type: string): string => {
    const assetTypeMap: Record<string, string> = {
      stock: t('assets.types.stock') || 'Aktie',
      bond: t('assets.types.bond') || 'Anleihe',
      crypto: t('assets.types.crypto') || 'Kryptowährung',
      cash: t('assets.types.cash') || 'Bargeld',
      commodity: t('assets.types.commodity') || 'Rohstoff',
      realestate: t('assets.types.realestate') || 'Immobilie',
      other: t('assets.types.other') || 'Sonstiges'
    };

    return assetTypeMap[type] || type;
  }, [t]);

  // Time range handlers
  const handleTimeRangeChange = useCallback((timeRange: AssetFocusTimeRange) => {
    dispatch(setAssetFocusTimeRange(timeRange));
    Logger.info(`Asset Focus time range changed to ${timeRange}`);
    
    // Note: No manual recalculation needed - the new portfolio history system 
    // will automatically provide the right data for the timeRange via usePortfolioIntradayView
  }, [dispatch]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      Logger.infoService("Asset Focus pull-to-refresh triggered");
      await executeAsyncOperation(
        'refresh asset focus data',
        () => cacheRefreshService.refreshAllCaches()
      );
    } finally {
      setIsRefreshing(false);
    }
  }, [executeAsyncOperation]);

  // Intraday history update handler
  const handleUpdateIntradayHistory = useCallback(async () => {
    Logger.infoService("Asset Focus intraday history update triggered using worker");
    executeAsyncOperation(
      'update intraday history',
      async () => {
        const stockDefinitions = assetDefinitions.filter((def: any) => def.type === 'stock' && def.ticker);
        Logger.info(`Found ${stockDefinitions.length} stock definitions to update`);
        
        if (stockDefinitions.length === 0) {
          Logger.warn("No stock definitions found with ticker symbols");
          return;
        }
        
        // Use worker service for batch intraday updates
        const response = await marketDataWorkerService.stockHistory.updateBatchIntraday(stockDefinitions, 1);
        
        if (response.type === 'error') {
          throw new Error(response.error);
        }
        
        if (response.type === 'batchResult' && response.results) {
          const successfulResults = response.results.filter(result => result.success && result.updatedDefinition);
          
          for (const result of successfulResults) {
            const updatedDefinition = result.updatedDefinition!;
            Logger.info(`Successfully updated intraday history for ${updatedDefinition.ticker}: ${result.entriesCount} entries processed`);
            
            try {
              await (dispatch as ThunkDispatch<RootState, unknown, AnyAction>)(
                updateAssetDefinition(updatedDefinition)
              );
            } catch (error) {
              Logger.error(`Failed to dispatch update for ${updatedDefinition.ticker}: ${error}`);
            }
          }
          
          // Log any failures
          const failedResults = response.results.filter(result => !result.success);
          if (failedResults.length > 0) {
            Logger.warn(`${failedResults.length} intraday updates failed:`);
            failedResults.forEach(result => {
              Logger.warn(`- ${result.symbol}: ${result.error}`);
            });
          }
          
          Logger.info(`Successfully processed intraday data for ${successfulResults.length} assets`);
        }
      }
    );
  }, [executeAsyncOperation, assetDefinitions, dispatch]);

  return (
    <>
      <AssetDashboardView
        portfolioHistory={enhancedPortfolioHistory}
        assetsWithValues={assetsWithValues}
        portfolioSummary={portfolioSummary as any}
        selectedTimeRange={assetFocus.timeRange}
        onTimeRangeChange={handleTimeRangeChange}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        onNavigateToForecast={handleNavigateToForecast}
        onNavigateToSettings={handleNavigateToSettings}
        onNavigateToAssetDetail={handleAssetClick}
        netWorth={financialSummary.data?.netWorth || 0}
        totalAssets={financialSummary.data?.totalAssets || 0}
        totalLiabilities={financialSummary.data?.totalLiabilities || 0}
        isApiEnabled={isApiEnabled}
        onUpdateIntradayHistory={handleUpdateIntradayHistory}
        isIntradayView={((assetFocus.timeRange === '1D' || assetFocus.timeRange === '1W') && intradayData.length > 0)}
      />
      {/* Asset Detail Modal */}
      <AssetDetailModal
        asset={selectedAsset}
        assetDefinition={selectedAssetDefinition}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        getAssetTypeLabel={getAssetTypeLabel}
      />
    </>
  );
};

export default AssetFocusDashboardContainer;