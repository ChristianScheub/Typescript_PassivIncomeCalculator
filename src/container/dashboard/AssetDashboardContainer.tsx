import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnyAction, ThunkDispatch } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { AssetFocusTimeRange } from '@/types/shared/analytics';
import { updateAssetDefinition } from '@/store/slices/domain';
import { setAssetFocusTimeRange } from '@/store/slices/configSlice';
import { calculateFinancialSummary, calculateAssetFocusData } from '@/store/slices/domain/transactionsSlice';
import AssetDashboardView, { PortfolioSummary } from '@/view/finance-hub/overview/AssetDashboardView';
import AssetDetailModal from '@/view/finance-hub/overview/AssetDetailModalView';
import { Asset, AssetDefinition } from '@/types/domains/assets/entities';
import { useAsyncOperation } from '../../utils/containerUtils';
import cacheRefreshService from '@/service/application/orchestration/cacheRefreshService';
import Logger from '@/service/shared/logging/Logger/logger';
import { useTranslation } from 'react-i18next';
import { marketDataWorkerService } from '@/service/shared/workers/marketDataWorkerService';
import { usePortfolioHistoryView } from '@/hooks/usePortfolioHistoryView';

const AssetFocusDashboardContainer: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch() as ThunkDispatch<RootState, unknown, AnyAction>;
  const { executeAsyncOperation } = useAsyncOperation();
  const { t } = useTranslation();

  // ALWAYS CALL ALL HOOKS IN EXACT SAME ORDER - NEVER CONDITIONAL
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [selectedAssetDefinition, setSelectedAssetDefinition] = useState<AssetDefinition | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    // COMPLETE Redux state in ONE call - this prevents hook order issues
  const reduxState = useAppSelector((state: RootState) => ({
    assetFocus: {
      selectedAssets: [], // Static for now
      focusStartDate: null, // Static for now
      focusEndDate: null, // Static for now
      timeRange: state.config.dashboard.assetFocus.timeRange
    },
    assets: state.transactions.items,
    assetDefinitions: state.assetDefinitions.items,
    liabilities: state.liabilities.items,
    expenses: state.expenses.items,
    income: state.income.items,
    isApiEnabled: state.config.apis?.stock?.enabled || false,
    stockApiConfig: state.config.apis?.stock || null,
    // Get cached data DIRECTLY from Redux instead of through hooks
    assetFocusCache: state.transactions.cache?.assetFocusData,
    financialSummary: state.transactions.cache?.financialSummary,
    portfolioHistory: state.transactions.cache?.history?.[state.config.dashboard.assetFocus.timeRange],
    // Get intraday data directly from Redux  
    portfolioIntradayData: state.transactions.cache?.intradayData || [],
  }));

  // Use the portfolio history hook to get properly calculated data
  const portfolioHistoryViewData = usePortfolioHistoryView(reduxState.assetFocus.timeRange);
  
  // Use data directly from Redux for intraday - wrapped in useMemo to prevent dependency changes
  const intradayData = useMemo(() => {
    return Array.isArray(reduxState.portfolioIntradayData) 
      ? reduxState.portfolioIntradayData 
      : reduxState.portfolioIntradayData?.data || [];
  }, [reduxState.portfolioIntradayData]);

  // Create data objects that match hook format
  const financialSummary = { data: reduxState.financialSummary };
  const assetFocusData = {
    data: reduxState.assetFocusCache ? {
      ...reduxState.assetFocusCache,
      assetsWithValues: Array.isArray(reduxState.assetFocusCache.assetsWithValues) 
        ? reduxState.assetFocusCache.assetsWithValues 
        : [],
      hasValue: true
    } : {
      assetsWithValues: [],
      portfolioSummary: null,
      lastCalculated: '',
      inputHash: '',
      hasValue: false
    }
  };
  const portfolioHistoryData = { data: reduxState.portfolioHistory?.data || [] };

  // Automatically calculate financial summary if missing or all zero
  useEffect(() => {
    const liabilitiesLength = reduxState.liabilities?.length || 0;
    const expensesLength = reduxState.expenses?.length || 0;
    const incomeLength = reduxState.income?.length || 0;
    
    const hasData = liabilitiesLength > 0 || expensesLength > 0 || incomeLength > 0;
    
    // Use DIRECT Redux data instead of hook data
    const hasValidFinancialSummary =
      (reduxState.financialSummary?.totalAssets ?? 0) > 0 ||
      (reduxState.financialSummary?.monthlyIncome ?? 0) > 0 ||
      (reduxState.financialSummary?.monthlyExpenses ?? 0) > 0 ||
      (reduxState.financialSummary?.totalLiabilities ?? 0) > 0;

    if (hasData && !hasValidFinancialSummary) {
      Logger.info('AssetDashboardContainer: Financial summary missing or all zero, triggering calculation');
      Logger.info(`AssetDashboardContainer: Data available - income: ${incomeLength}, expenses: ${expensesLength}, liabilities: ${liabilitiesLength}`);
      (dispatch as ThunkDispatch<RootState, unknown, AnyAction>)(calculateFinancialSummary({ 
        liabilities: reduxState.liabilities || [], 
        expenses: reduxState.expenses || [], 
        income: reduxState.income || [] 
      }));
    }
  }, [
    dispatch, 
    reduxState.financialSummary, // Use Redux data, not hook data
    reduxState.liabilities, 
    reduxState.expenses, 
    reduxState.income
  ]);

  // Automatically calculate asset focus data if missing or empty
  useEffect(() => {
    const assetsLength = reduxState.assets?.length || 0;
    const assetDefinitionsLength = reduxState.assetDefinitions?.length || 0;
    
    const hasAssets = assetsLength > 0 || assetDefinitionsLength > 0;
    
    // Use DIRECT Redux data instead of hook data
    const hasValidAssetFocusData =
      (reduxState.assetFocusCache?.assetsWithValues?.length ?? 0) > 0;

    if (hasAssets && !hasValidAssetFocusData) {
      Logger.info('AssetDashboardContainer: Asset focus data missing or empty, triggering calculation');
      Logger.info(`AssetDashboardContainer: Data available - transactions: ${assetsLength}, assetDefinitions: ${assetDefinitionsLength}`);
      (dispatch as ThunkDispatch<RootState, unknown, AnyAction>)(calculateAssetFocusData());
    }
  }, [
    dispatch, 
    reduxState.assetFocusCache, // Use Redux data, not hook data
    reduxState.assets, 
    reduxState.assetDefinitions
  ]);

  // State for pull-to-refresh
  const [isRefreshing, setIsRefreshing] = useState(false);


  // Combine regular portfolio history with intraday data for enhanced view
  const enhancedPortfolioHistory = useMemo(() => {
    const baseData = portfolioHistoryData?.data || [];
    const newSystemData = portfolioHistoryViewData || [];
    
    // Type guard to ensure baseData is array
    const safeBaseData = Array.isArray(baseData) ? baseData : [];
    
    Logger.info(`AssetFocusDashboardContainer enhancedPortfolioHistory: timeRange=${reduxState.assetFocus.timeRange}, baseData=${safeBaseData.length}, newSystemData=${newSystemData.length}, intradayData=${intradayData.length}`);

    // Für kurze Zeiträume (1T): Verwende neue System-Daten falls verfügbar, sonst Intraday
    if (reduxState.assetFocus.timeRange === '1T') {
      // Priorität 1: Intraday-Daten falls vorhanden (nur für 1T)
      if (reduxState.assetFocus.timeRange === '1T' && intradayData.length > 0) {
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
          
          Logger.info(`1T: Showing last 24h of available intraday data from ${mostRecentTimestamp.toISOString()}: ${filteredIntradayData.length} points from ${intradayData.length} total`);
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
        const combined = [...safeBaseData, ...intradayHistoryPoints]
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        Logger.info(`Combined portfolio history: ${combined.length} total points (${safeBaseData.length} daily + ${intradayHistoryPoints.length} intraday)`);
        return combined;
      }
      
      // Priorität 2: Neue System-Daten (Portfolio History) falls verfügbar
      if (newSystemData.length > 0) {
        Logger.info(`Using new system data for ${reduxState.assetFocus.timeRange}: ${newSystemData.length} points`);
        return newSystemData.map(point => ({
          date: point.date,
          totalValue: point.totalValue,
          totalInvested: 0,
          totalReturn: point.change ?? 0,
          totalReturnPercentage: point.changePercentage ?? 0,
          positions: []
        }));
      }
      
      // Priorität 3: Base-Daten als Fallback
      Logger.info(`Using base data for ${reduxState.assetFocus.timeRange}: ${safeBaseData.length} points`);
      return safeBaseData;
    }

    // Für 5D: Zeige ALLE kombinierten Datenpunkte (intraday + daily, mit type-Flag)
    if (reduxState.assetFocus.timeRange === '5D' && newSystemData.length > 0) {
      Logger.info(`Using combined 5D history from usePortfolioHistoryView: ${newSystemData.length} points`);
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
    if ((reduxState.assetFocus.timeRange === '1M' || reduxState.assetFocus.timeRange === '3M' || reduxState.assetFocus.timeRange === '6M' || reduxState.assetFocus.timeRange === '1Y' || reduxState.assetFocus.timeRange === 'Max') && newSystemData.length > 0) {
      Logger.info(`Using new portfolio history system for ${reduxState.assetFocus.timeRange}: ${newSystemData.length} points`);
      return newSystemData.map(point => ({
        date: point.date,
        totalValue: point.totalValue,
        totalInvested: 0,
        totalReturn: point.change ?? 0,
        totalReturnPercentage: point.changePercentage ?? 0,
        positions: []
      }));
    }

    Logger.info(`Using regular daily data for timeRange=${reduxState.assetFocus.timeRange}: ${safeBaseData.length} points`);
    return safeBaseData;
  }, [
    portfolioHistoryData.data,
    portfolioHistoryViewData,
    intradayData,
    reduxState.assetFocus.timeRange
  ]);

  // Get data from hooks
  const assetFocusDataResult = assetFocusData.data || { assetsWithValues: [], portfolioSummary: null };
  // Sort assetsWithValues by totalValue descending before passing to view
  const { portfolioSummary } = assetFocusDataResult;
  // AssetWithValue uses 'value' as the total value field
  const sortedAssetsWithValues = Array.isArray(assetFocusDataResult.assetsWithValues)
    ? [...assetFocusDataResult.assetsWithValues].sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
    : [];

  // Navigation handlers
  const handleNavigateToForecast = useCallback(() => {
    navigate('/analytics');
  }, [navigate]);

  const handleNavigateToSettings = useCallback(() => {
    navigate('/settings');
  }, [navigate]);

  // Asset detail modal handlers
  const handleAssetClick = useCallback((assetDefinition: AssetDefinition) => {
    // Find any asset transaction that matches this asset definition
    const matchingAsset = reduxState.assets.find((asset: Asset) => 
      asset.assetDefinitionId === assetDefinition.id
    );
    
    setSelectedAsset(matchingAsset || null);
    setSelectedAssetDefinition(assetDefinition);
    setIsModalOpen(true);
    
    Logger.info(`AssetDashboardContainer: Opening modal for asset ${assetDefinition.name}, found matching transaction: ${!!matchingAsset}`);
  }, [reduxState.assets]);

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
        const stockDefinitions = reduxState.assetDefinitions.filter((def: AssetDefinition) => def.type === 'stock' && def.ticker);
        Logger.info(`Found ${stockDefinitions.length} stock definitions to update`);
        
        if (stockDefinitions.length === 0) {
          Logger.warn("No stock definitions found with ticker symbols");
          return;
        }
        
        // Get API configuration from Redux state
        const stockApiConfig = reduxState.isApiEnabled ? {
          apiKeys: reduxState.stockApiConfig?.apiKeys || {},
          selectedProvider: reduxState.stockApiConfig?.selectedProvider
        } : {};
        
        Logger.info(`Using API config: ${JSON.stringify(stockApiConfig)}`);
        
        // Use worker service for batch intraday updates with API configuration
        const response = await marketDataWorkerService.stockHistory.updateBatchIntraday(
          stockDefinitions, 
          1, 
          stockApiConfig.apiKeys, 
          stockApiConfig.selectedProvider
        );
        
        if (response.type === 'error') {
          throw new Error(response.error);
        }
        
        if (response.type === 'batchResult' && response?.results) {
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
  }, [executeAsyncOperation, reduxState.assetDefinitions, reduxState.isApiEnabled, reduxState.stockApiConfig, dispatch]);

  return (
    <>
      <AssetDashboardView
        portfolioHistory={enhancedPortfolioHistory}
        assetsWithValues={sortedAssetsWithValues}
        portfolioSummary={portfolioSummary as PortfolioSummary}
        selectedTimeRange={reduxState.assetFocus.timeRange}
        onTimeRangeChange={handleTimeRangeChange}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        onNavigateToForecast={handleNavigateToForecast}
        onNavigateToSettings={handleNavigateToSettings}
        onNavigateToAssetDetail={handleAssetClick}
        netWorth={financialSummary.data?.netWorth || 0}
        totalAssets={financialSummary.data?.totalAssets || 0}
        totalLiabilities={financialSummary.data?.totalLiabilities || 0}
        isApiEnabled={reduxState.isApiEnabled}
        onUpdateIntradayHistory={handleUpdateIntradayHistory}
        isIntradayView={((reduxState.assetFocus.timeRange === '1T' || reduxState.assetFocus.timeRange === '5D') && intradayData.length > 0)}
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