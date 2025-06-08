import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { 
  fetchAssets, 
  addAsset, 
  updateAsset, 
  deleteAsset, 
  updateAssetDividendCache, 
  calculatePortfolioData,
  selectAssets,
  selectAssetsStatus,
  selectPortfolioCache,
  selectPortfolioCacheValid,
  selectPortfolioTotals,
  selectSortedAssets
} from '../store/slices/assetsSlice';
import { fetchAssetDefinitions, updateAssetDefinition } from '../store/slices/assetDefinitionsSlice';
import { AssetsView } from '../view/AssetsView';
import { Asset } from '../types';
import { useTranslation } from 'react-i18next';
import Logger from '../service/Logger/logger';
import { analytics } from '../service/analytics';
import calculatorService from '../service/calculatorService';
import { createDividendCacheService } from '../service/dividendCacheService';
import { createCachedDividends } from '../utils/dividendCacheUtils';
import { StockPriceUpdater } from '../service/helper/stockPriceUpdater';
import AssetDefinitionsContainer from './AssetDefinitionsContainer';
import AssetCalendarContainer from './AssetCalendarContainer';

const AssetsContainer: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  
  // Use new selectors for better performance
  const assets = useAppSelector(selectAssets);
  const status = useAppSelector(selectAssetsStatus);
  const portfolioCache = useAppSelector(selectPortfolioCache);
  const portfolioCacheValid = useAppSelector(selectPortfolioCacheValid);
  const portfolioTotals = useAppSelector(selectPortfolioTotals);
  const sortedAssets = useAppSelector(selectSortedAssets);
  
  const { items: assetDefinitions } = useAppSelector(state => state.assetDefinitions || { items: [] });
  const { isEnabled: isApiEnabled } = useAppSelector(state => state.apiConfig);
  
  const [isAddingAsset, setIsAddingAsset] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false);
  const [isShowingDefinitions, setIsShowingDefinitions] = useState(false);
  const [isShowingCalendar, setIsShowingCalendar] = useState(false);

  useEffect(() => {
    if (status === 'idle') {
      Logger.info('Fetching assets');
      dispatch(fetchAssets());
    }
    
    // Also fetch asset definitions
    dispatch(fetchAssetDefinitions());
    
    // Initialize dividend cache service
    createDividendCacheService(dispatch);
  }, [dispatch, status]);

  // Calculate portfolio data when needed (with caching)
  useEffect(() => {
    if (assets.length > 0 && assetDefinitions.length > 0 && !portfolioCacheValid) {
      Logger.info('Calculating portfolio data');
      dispatch(calculatePortfolioData(assetDefinitions));
    }
  }, [assets.length, assetDefinitions.length, portfolioCacheValid, dispatch]);

  // Extract values from cached totals
  const { totalAssetValue, monthlyAssetIncome, annualAssetIncome } = useMemo(() => {
    return {
      totalAssetValue: portfolioTotals.totalValue,
      monthlyAssetIncome: portfolioTotals.monthlyIncome,
      annualAssetIncome: portfolioTotals.annualIncome
    };
  }, [portfolioTotals]);

  // Portfolio data for the view (using cached data or fallback)
  const portfolioData = useMemo(() => {
    return portfolioCache || {
      positions: [],
      totals: portfolioTotals,
      metadata: {
        lastCalculated: new Date().toISOString(),
        assetCount: assets.length,
        definitionCount: assetDefinitions.length,
        positionCount: 0
      }
    };
  }, [portfolioCache, portfolioTotals, assets.length, assetDefinitions.length]);

  const handleAddAsset = async (data: any) => {
    try {
      Logger.info('Adding new asset transaction' + " - " + JSON.stringify(data));
      analytics.trackEvent('asset_add', { type: data.type, hasDefinitionId: !!data.assetDefinitionId });
      
      // currentQuantity is now derived from purchaseQuantity - no need to set it explicitly
      
      await dispatch(addAsset(data));
      setIsAddingAsset(false);
      
    } catch (error) {
      Logger.error('Failed to add asset transaction' + " - " + JSON.stringify(error as Error));
    }
  };

  // Helper: Calculate stock value and differences
  function updateStockValueFields(data: any) {
    if (data.type === 'stock' && data.purchaseQuantity && data.purchasePrice) {
      // Note: currentPrice is now stored in AssetDefinition, not in transaction
      // This function only calculates purchase-related values for transactions
      const purchaseValue = data.purchaseQuantity * data.purchasePrice;
      data.value = purchaseValue; // Transaction value is based on purchase data
      
      // Value differences will be calculated at portfolio level using AssetDefinition.currentPrice
      Logger.info(`Transaction value calculated from purchase data: ${data.purchaseQuantity} × ${data.purchasePrice} = ${purchaseValue}`);
    }
  }

  const handleUpdateAsset = async (data: any) => {
    if (!editingAsset) return;
    try {
      Logger.info('Updating asset transaction' + " - " + JSON.stringify({ id: editingAsset.id, data }));
      analytics.trackEvent('asset_update', { id: editingAsset.id, type: data.type });
      
      // currentQuantity is now derived from purchaseQuantity - no need to set it explicitly
      
      updateStockValueFields(data);
      await dispatch(updateAsset({ ...data, id: editingAsset.id }));
      setEditingAsset(null);
    } catch (error) {
      Logger.error('Failed to update asset transaction' + " - " + JSON.stringify(error as Error));
    }
  };

  const handleDeleteAsset = async (id: string) => {
    if (window.confirm(t('common.deleteConfirm'))) {
      try {
        Logger.info('Deleting asset' + " - " + JSON.stringify({ id }));
        analytics.trackEvent('asset_delete', { id });
        await dispatch(deleteAsset(id));
      } catch (error) {
        Logger.error('Failed to delete asset' + " - " + JSON.stringify(error as Error));
      }
    }
  };

  const getAssetTypeLabel = useCallback((type: string): string => {
    return t(`assets.types.${type}`);
  }, [t]);

  // Cache-Miss-Handling: Nach jedem Render Cache für fehlende/ungültige Assets nachziehen
  useEffect(() => {
    if (!assets || assets.length === 0) return;
    
    // Sammle erst alle Assets die ein Cache-Update benötigen
    const assetsNeedingUpdate = assets.filter(asset => {
      if (!calculatorService.calculateAssetMonthlyIncomeWithCache) return false;
      const result = calculatorService.calculateAssetMonthlyIncomeWithCache(asset);
      return !result.cacheHit && result.cacheDataToUpdate;
    });

    // Führe Updates nur für die benötigten Assets durch
    assetsNeedingUpdate.forEach(asset => {
      if (!calculatorService.calculateAssetMonthlyIncomeWithCache) return;
      const result = calculatorService.calculateAssetMonthlyIncomeWithCache(asset);
      if (!result.cacheHit && result.cacheDataToUpdate) {
        const cachedDividends = createCachedDividends(
          result.cacheDataToUpdate.monthlyAmount,
          result.cacheDataToUpdate.annualAmount,
          result.cacheDataToUpdate.monthlyBreakdown,
          asset
        );
        dispatch(updateAssetDividendCache({ assetId: asset.id, cachedDividends }));
      }
    });
  }, [assets, dispatch]);

  const handleUpdateStockPrices = async () => {
    setIsUpdatingPrices(true);
    try {
      Logger.info('Starting stock price update');
      
      // Filter AssetDefinitions that have stock type and ticker symbols
      const stockDefinitions = assetDefinitions.filter(def => 
        def.type === 'stock' && def.ticker
      );
      
      if (stockDefinitions.length === 0) {
        Logger.info('No stock definitions found to update');
        return;
      }
      
      const updatedDefinitions = await StockPriceUpdater.updateStockPrices(stockDefinitions);
      
      if (updatedDefinitions.length > 0) {
        Logger.info(`Dispatching price updates for ${updatedDefinitions.length} stock definitions`);
        
        // Update each AssetDefinition in the store
        for (const definition of updatedDefinitions) {
          await dispatch(updateAssetDefinition(definition));
        }
        
        // Re-calculate portfolio cache since stock prices have changed
        await dispatch(calculatePortfolioData(assetDefinitions));

        Logger.info('Successfully updated stock prices and recalculated portfolio');
      } else {
        Logger.info('No stock definitions were updated');
      }
    } catch (error) {
      Logger.error('Failed to update stock prices' + ' - ' + JSON.stringify(error as Error));
    } finally {
      setIsUpdatingPrices(false);
    }
  };

  const handleNavigateToDefinitions = () => {
    setIsShowingDefinitions(true);
  };

  const handleNavigateToCalendar = () => {
    setIsShowingCalendar(true);
  };

  const handleBackToAssets = () => {
    setIsShowingDefinitions(false);
    setIsShowingCalendar(false);
  };

  // If showing definitions, render the definitions container instead
  if (isShowingDefinitions) {
    return (
      <AssetDefinitionsContainer 
        onBack={handleBackToAssets}
      />
    );
  }

  // If showing calendar, render the calendar container instead
  if (isShowingCalendar) {
    return (
      <AssetCalendarContainer 
        onBack={handleBackToAssets}
      />
    );
  }

  return (
    <AssetsView
      assets={sortedAssets}
      portfolioData={portfolioData}
      status={status}
      totalAssetValue={totalAssetValue}
      monthlyAssetIncome={monthlyAssetIncome}
      annualAssetIncome={annualAssetIncome}
      isAddingAsset={isAddingAsset}
      editingAsset={editingAsset}
      isUpdatingPrices={isUpdatingPrices}
      isApiEnabled={isApiEnabled}
      getAssetTypeLabel={getAssetTypeLabel}
      onAddAsset={handleAddAsset}
      onUpdateAsset={handleUpdateAsset}
      onDeleteAsset={handleDeleteAsset}
      onSetIsAddingAsset={setIsAddingAsset}
      onSetEditingAsset={setEditingAsset}
      onUpdateStockPrices={handleUpdateStockPrices}
      onNavigateToDefinitions={handleNavigateToDefinitions}
      onNavigateToCalendar={handleNavigateToCalendar}
    />
  );
};

export default AssetsContainer;
