import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { setAssetFocusTimeRange, AssetFocusTimeRange } from '../../store/slices/dashboardSettingsSlice';
import { calculatePortfolioHistory } from '../../store/slices/calculatedDataSlice';
import { updateAssetDefinition } from '../../store/slices/assetDefinitionsSlice';
import { usePortfolioHistory, useAssetFocusData, useFinancialSummary } from '../../hooks/useCalculatedDataCache';
import { useIntradayPortfolioData } from '../../hooks/useIntradayData';
import AssetFocusView from '../../view/finance-hub/overview/AssetFocusView';
import stockAPIService from '../../service/domain/assets/market-data/stockAPIService';
import { useAsyncOperation } from '../../utils/containerUtils';
import cacheRefreshService from '../../service/application/orchestration/cacheRefreshService';
import { addIntradayPriceHistory } from '../../utils/priceHistoryUtils';
import Logger from '../../service/shared/logging/Logger/logger';

const AssetFocusContainer: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { executeAsyncOperation } = useAsyncOperation();

  // Redux state
  const { items: assetDefinitions } = useAppSelector(state => state.assetDefinitions);
  const { assetFocus } = useAppSelector(state => state.dashboardSettings);
  const { isEnabled: isApiEnabled } = useAppSelector(state => state.apiConfig);
  
  // Use cached calculated data with automatic calculation
  const portfolioHistoryData = usePortfolioHistory(assetFocus.timeRange);
  const intradayData = useIntradayPortfolioData();
  const assetFocusData = useAssetFocusData();
  const financialSummary = useFinancialSummary();

  // Combine regular portfolio history with intraday data for enhanced view
  const enhancedPortfolioHistory = React.useMemo(() => {
    const baseData = portfolioHistoryData?.data || [];
    
    Logger.info(`AssetFocusContainer enhancedPortfolioHistory: timeRange=${assetFocus.timeRange}, baseData=${baseData.length}, intradayData=${intradayData.length}`);
    
    // If we have intraday data and we're looking at "1D" or "1W" timeframe, show intraday details
    if ((assetFocus.timeRange === '1D' || assetFocus.timeRange === '1W') && intradayData.length > 0) {
      Logger.info(`Enhancing portfolio history with ${intradayData.length} intraday data points for ${assetFocus.timeRange} view`);
      
      // Convert intraday data to portfolio history format
      const intradayHistoryPoints = intradayData.map(point => ({
        date: point.timestamp, // Use full timestamp for intraday
        value: point.value,
        transactions: [] // No transactions for intraday points
      }));
      
      Logger.info(`Sample intraday history points: ${JSON.stringify(intradayHistoryPoints.slice(0, 3))}`);
      
      // Combine and sort by timestamp (chronological order - oldest first for charts)
      const combined = [...baseData, ...intradayHistoryPoints]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      Logger.info(`Combined portfolio history: ${combined.length} total points (${baseData.length} daily + ${intradayHistoryPoints.length} intraday)`);
      return combined;
    }
    
    // For other timeframes, use regular daily data
    Logger.info(`Using regular daily data for timeRange=${assetFocus.timeRange}: ${baseData.length} points`);
    return baseData;
  }, [portfolioHistoryData?.data, intradayData, assetFocus.timeRange]);

  // Get data from hooks
  const { assetsWithValues, portfolioSummary } = assetFocusData;

  // Navigation handlers
  const handleNavigateToForecast = useCallback(() => {
    navigate('/analytics');
  }, [navigate]);

  const handleNavigateToSettings = useCallback(() => {
    navigate('/settings');
  }, [navigate]);

  // Time range handlers
  const handleTimeRangeChange = useCallback((timeRange: AssetFocusTimeRange) => {
    dispatch(setAssetFocusTimeRange(timeRange));
    Logger.info(`Asset Focus time range changed to ${timeRange}`);
    
    // Trigger recalculation for new time range
    dispatch(calculatePortfolioHistory({ timeRange }));
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
        
        // Debug: Ensure Stock API service is configured before proceeding
        try {
          let service = stockAPIService.getStockAPIService();
          Logger.info(`Initial Stock API service state: ${!!service}`);
          
          if (!service) {
            Logger.info(`Creating Stock API service...`);
            stockAPIService.createStockAPIService();
            service = stockAPIService.getStockAPIService();
            Logger.info(`Stock API service after creation: ${!!service}`);
          }
          
          if (service) {
            const providers = stockAPIService.getAvailableProviders();
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
    <AssetFocusView
      portfolioHistory={enhancedPortfolioHistory}
      assetsWithValues={assetsWithValues}
      portfolioSummary={portfolioSummary}
      selectedTimeRange={assetFocus.timeRange}
      onTimeRangeChange={handleTimeRangeChange}
      onRefresh={handleRefresh}
      onNavigateToForecast={handleNavigateToForecast}
      onNavigateToSettings={handleNavigateToSettings}
      netWorth={financialSummary.netWorth}
      totalAssets={financialSummary.totalAssets}
      totalLiabilities={financialSummary.totalLiabilities}
      isApiEnabled={isApiEnabled}
      onUpdateIntradayHistory={handleUpdateIntradayHistory}
      isIntradayView={((assetFocus.timeRange === '1D' || assetFocus.timeRange === '1W') && intradayData.length > 0)}
    />
  );
};

export default AssetFocusContainer;
