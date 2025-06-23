import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { setAssetFocusTimeRange, AssetFocusTimeRange } from '@/store/slices/dashboardSettingsSlice';
import { updateAssetDefinition } from '@/store/slices/assetDefinitionsSlice';
import { usePortfolioHistory, useAssetFocusData, useFinancialSummary } from '../../hooks/useCalculatedDataCache';
import { usePortfolioIntradayView, usePortfolioHistoryView } from '../../hooks/usePortfolioHistoryView';
import AssetDashboardView from '@/view/finance-hub/overview/AssetDashboardView';
import AssetDetailModal from '@/view/finance-hub/overview/AssetDetailModal';
import { Asset, AssetDefinition } from '@/types/domains/assets/entities';
import stockAPIService, {
  createStockAPIServiceMethod,
  getStockAPIServiceMethod,
  getAvailableProvidersMethod
} from '@/service/domain/assets/market-data/stockAPIService';
import { useAsyncOperation } from '../../utils/containerUtils';
import cacheRefreshService from '@/service/application/orchestration/cacheRefreshService';
import { addIntradayPriceHistory } from '../../utils/priceHistoryUtils';
import Logger from '@/service/shared/logging/Logger/logger';
import { useTranslation } from 'react-i18next';

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
  const { assetFocus } = useAppSelector(state => state.dashboardSettings);
  const { isEnabled: isApiEnabled } = useAppSelector(state => state.apiConfig);
  const apiConfig = useAppSelector(state => state.apiConfig);
  
  // Use cached calculated data with automatic calculation
  const portfolioHistoryData = usePortfolioHistory(assetFocus.timeRange);
  const intradayData = usePortfolioIntradayView();
  const portfolioHistoryViewData = usePortfolioHistoryView(assetFocus.timeRange); // NEW: For longer time ranges
  const assetFocusData = useAssetFocusData();
  const financialSummary = useFinancialSummary();

  // Combine regular portfolio history with intraday data for enhanced view
  const enhancedPortfolioHistory = React.useMemo(() => {
    const baseData = portfolioHistoryData?.data || [];
    const newSystemData = portfolioHistoryViewData || [];
    
    Logger.info(`AssetFocusDashboardContainer enhancedPortfolioHistory: timeRange=${assetFocus.timeRange}, baseData=${baseData.length}, newSystemData=${newSystemData.length}, intradayData=${intradayData.length}`);
    
    // For short timeframes (1D, 1W), use intraday data
    if ((assetFocus.timeRange === '1D' || assetFocus.timeRange === '1W') && intradayData.length > 0) {
      Logger.info(`Enhancing portfolio history with ${intradayData.length} intraday data points for ${assetFocus.timeRange} view`);
      
      // Filter intraday data based on timeRange
      let filteredIntradayData = intradayData;
      
      if (assetFocus.timeRange === '1D') {
        // For 1D: Show the most recent 24 hours of available data
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
      } else if (assetFocus.timeRange === '1W') {
        // For 1W: Show all intraday data (last 5 days)
        Logger.info(`Using all ${intradayData.length} intraday points for 1W view`);
      }
      
      // Convert filtered intraday data to portfolio history format
      const intradayHistoryPoints = filteredIntradayData.map(point => ({
        date: point.timestamp, // Use full timestamp for intraday
        value: point.value,
        transactions: [] // No transactions for intraday points
      }));
      
      Logger.info(`Sample intraday history points: ${JSON.stringify(intradayHistoryPoints.slice(0, 3))}`);
      
      // Combine base data with filtered intraday and sort by timestamp
      const combined = [...baseData, ...intradayHistoryPoints]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      Logger.info(`Combined portfolio history: ${combined.length} total points (${baseData.length} daily + ${intradayHistoryPoints.length} intraday)`);
      return combined;
    }
    
    // For longer timeframes (1M, 3M, 1Y, ALL), try the new system first
    if ((assetFocus.timeRange === '1M' || assetFocus.timeRange === '3M' || assetFocus.timeRange === '6M' || assetFocus.timeRange === '1Y' || assetFocus.timeRange === 'ALL') && newSystemData.length > 0) {
      Logger.info(`Using new portfolio history system for ${assetFocus.timeRange}: ${newSystemData.length} points`);
      
      // Convert new system data to portfolio history format
      const formattedData = newSystemData.map(point => ({
        date: point.date,
        value: point.value,
        transactions: [] // No transactions for now
      }));
      
      return formattedData;
    }
    
    // Fallback to old system data
    Logger.info(`Using regular daily data for timeRange=${assetFocus.timeRange}: ${baseData.length} points`);
    return baseData;
  }, [portfolioHistoryData?.data, portfolioHistoryViewData, intradayData, assetFocus.timeRange]);

  // Get data from hooks
  const { assetsWithValues, portfolioSummary } = assetFocusData;

  // Navigation handlers
  const handleNavigateToForecast = useCallback(() => {
    navigate('/analytics');
  }, [navigate]);

  const handleNavigateToSettings = useCallback(() => {
    navigate('/settings');
  }, [navigate]);

  // Asset detail modal handlers
  const handleAssetClick = useCallback((asset: Asset, assetDefinition: AssetDefinition) => {
    setSelectedAsset(asset);
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

  // Pull to refresh handler
  const handleRefresh = useCallback(async () => {
    Logger.infoService("Asset Focus pull-to-refresh triggered");
    
    executeAsyncOperation(
      'refresh asset focus data',
      () => cacheRefreshService.refreshAllCaches()
    );
  }, [executeAsyncOperation]);

  // Intraday history update handler
  const handleUpdateIntradayHistory = useCallback(async () => {
    Logger.infoService("Asset Focus intraday history update triggered");
    executeAsyncOperation(
      'update intraday history',
      async () => {
        const stockDefinitions = assetDefinitions.filter((def: any) => def.type === 'stock' && def.ticker);
        Logger.info(`Found ${stockDefinitions.length} stock definitions to update`);
        
        // Ensure Stock API service is configured with Redux state
        try {
          let service = getStockAPIServiceMethod();
          Logger.info(`Initial Stock API service state: ${!!service}`);
          
          if (!service) {
            Logger.info(`Creating Stock API service with Redux config...`);
            createStockAPIServiceMethod(apiConfig.selectedProvider, apiConfig.apiKeys);
            service = getStockAPIServiceMethod();
            Logger.info(`Stock API service after creation: ${!!service}`);
          }
          
          if (service) {
            const providers = getAvailableProvidersMethod(apiConfig.apiKeys);
            Logger.info(`Available providers: ${JSON.stringify(providers.map(p => ({id: p.id, configured: p.isConfigured})))}`);
          } else {
            Logger.error(`Failed to create Stock API service - cannot proceed with intraday history update`);
            return;
          }
        } catch (error) {
          Logger.error(`Error configuring Stock API service: ${JSON.stringify(error)}`);
          return;
        }
        
        if (stockDefinitions.length === 0) {
          Logger.warn("No stock definitions found with ticker symbols");
          return;
        }
        
        for (const definition of stockDefinitions) {
          try {
            Logger.info(`Updating intraday history for ${definition.ticker}`);
            Logger.info(`Current priceHistory length: ${(definition.priceHistory || []).length}`);
            
            Logger.info(`About to call stockAPIService.getIntradayHistory for ${definition.ticker} (5 days)`);
            const intradayData = await stockAPIService.getIntradayHistory(definition.ticker, 5);
            Logger.info(`Successfully called stockAPIService.getIntradayHistory for ${definition.ticker} (5 days)`);
            Logger.info(`Received ${intradayData.entries.length} intraday entries for ${definition.ticker}`);
            
            if (!intradayData.entries || intradayData.entries.length === 0) {
              Logger.warn(`No intraday data received for ${definition.ticker}`);
              continue;
            }
            
            // Merge with existing price history preserving minute-level timestamps
            const newPriceEntries = intradayData.entries.map((entry: any) => ({
              date: new Date(entry.timestamp).toISOString(), // Keep full timestamp for intraday data
              price: entry.close,
              source: 'api' as const
            }));
            
            Logger.info(`Mapped ${newPriceEntries.length} new intraday price entries for ${definition.ticker}`);
            Logger.info(`Sample new entry: ${JSON.stringify(newPriceEntries[0])}`);
            Logger.info(`First entry timestamp: ${newPriceEntries[0]?.date}, Last entry timestamp: ${newPriceEntries[newPriceEntries.length - 1]?.date}`);
            
            // Use addIntradayPriceHistory to preserve minute-level data
            const existingHistory = definition.priceHistory || [];
            Logger.info(`Existing history for ${definition.ticker}: ${existingHistory.length} entries`);
            
            // Use the imported utility function to properly handle intraday data
            const updatedHistory = addIntradayPriceHistory(newPriceEntries, existingHistory, 500);
            
            Logger.info(`Final priceHistory length for ${definition.ticker}: ${updatedHistory.length} (was ${existingHistory.length}, added ${newPriceEntries.length} intraday entries)`);
            Logger.info(`Intraday data preserved with minute-level timestamps for ${definition.ticker}`);
            const updatedDefinition = {
              ...definition,
              priceHistory: updatedHistory,
              lastPriceUpdate: new Date().toISOString()
            };
            
            Logger.info(`Dispatching updateAssetDefinition for ${definition.ticker}...`);
            await dispatch(updateAssetDefinition(updatedDefinition));
            Logger.info(`Successfully updated intraday history for ${definition.ticker}: ${intradayData.entries.length} entries processed, ${updatedHistory.length} total entries`);
          } catch (error) {
            Logger.error(`Failed to update intraday history for ${definition.ticker}: ${JSON.stringify(error)}`);
          }
        }
      }
    );
  }, [executeAsyncOperation, assetDefinitions, dispatch]);

  return (
    <>
      <AssetDashboardView
        portfolioHistory={enhancedPortfolioHistory}
        assetsWithValues={assetsWithValues}
        portfolioSummary={portfolioSummary}
        selectedTimeRange={assetFocus.timeRange}
        onTimeRangeChange={handleTimeRangeChange}
        onRefresh={handleRefresh}
        onNavigateToForecast={handleNavigateToForecast}
        onNavigateToSettings={handleNavigateToSettings}
        onNavigateToAssetDetail={handleAssetClick}
        netWorth={financialSummary.netWorth}
        totalAssets={financialSummary.totalAssets}
        totalLiabilities={financialSummary.totalLiabilities}
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
