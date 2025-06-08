import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchAssets, addAsset, updateAsset, deleteAsset, updateAssetDividendCache, updateStockPrices } from '../store/slices/assetsSlice';
import { fetchAssetDefinitions } from '../store/slices/assetDefinitionsSlice';
import { AssetsView } from '../view/AssetsView';
import { Asset } from '../types';
import { useTranslation } from 'react-i18next';
import Logger from '../service/Logger/logger';
import { analytics } from '../service/analytics';
import calculatorService from '../service/calculatorService';
import portfolioService from '../service/portfolioService';
import { createDividendCacheService } from '../service/dividendCacheService';
import { createCachedDividends } from '../utils/dividendCacheUtils';
import { sortAssets } from '../utils/sortingUtils';
import { StockPriceUpdater } from '../service/helper/stockPriceUpdater';
import AssetDefinitionsContainer from './AssetDefinitionsContainer';
import AssetCalendarContainer from './AssetCalendarContainer';

const AssetsContainer: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { items: assets, status } = useAppSelector(state => state.assets);
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

  // Sort assets by value (highest to lowest)
  const sortedAssets = useMemo(() => {
    return sortAssets(assets);
  }, [assets]);

  // Calculate portfolio data using the new portfolio service
  const portfolioData = useMemo(() => {
    return portfolioService.calculatePortfolio(assets, assetDefinitions);
  }, [assets, assetDefinitions]);

  const { totalAssetValue, monthlyAssetIncome, annualAssetIncome } = useMemo(() => {
    return {
      totalAssetValue: portfolioData.totals.totalValue,
      monthlyAssetIncome: portfolioData.totals.monthlyIncome,
      annualAssetIncome: portfolioData.totals.annualIncome
    };
  }, [portfolioData]);

  const handleAddAsset = async (data: any) => {
    try {
      Logger.info('Adding new asset transaction' + " - " + JSON.stringify(data));
      analytics.trackEvent('asset_add', { type: data.type, hasDefinitionId: !!data.assetDefinitionId });
      
      // Ensure currentQuantity is set from purchaseQuantity if not provided
      if (!data.currentQuantity && data.purchaseQuantity) {
        data.currentQuantity = data.purchaseQuantity;
      }
      
      await dispatch(addAsset(data));
      setIsAddingAsset(false);
      
    } catch (error) {
      Logger.error('Failed to add asset transaction' + " - " + JSON.stringify(error as Error));
    }
  };

  // Helper: Calculate stock value and differences
  function updateStockValueFields(data: any) {
    if (data.type === 'stock' && data.purchaseQuantity && data.currentPrice && data.purchasePrice) {
      const currentValue = data.purchaseQuantity * data.currentPrice;
      const purchaseValue = data.purchaseQuantity * data.purchasePrice;
      const difference = currentValue - purchaseValue;
      const percentageDiff = purchaseValue > 0 ? ((currentValue - purchaseValue) / purchaseValue) * 100 : 0;
      data.valueDifference = difference !== 0 ? difference : undefined;
      data.percentageDifference = difference !== 0 ? percentageDiff : undefined;
      data.value = currentValue;
    }
  }

  const handleUpdateAsset = async (data: any) => {
    if (!editingAsset) return;
    try {
      Logger.info('Updating asset transaction' + " - " + JSON.stringify({ id: editingAsset.id, data }));
      analytics.trackEvent('asset_update', { id: editingAsset.id, type: data.type });
      
      // Ensure currentQuantity is set from purchaseQuantity if not provided
      if (!data.currentQuantity && data.purchaseQuantity) {
        data.currentQuantity = data.purchaseQuantity;
      }
      
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
      const updatedStocks = await StockPriceUpdater.updateStockPrices(assets);
      if (updatedStocks.length > 0) {
        Logger.info(`Dispatching price updates for ${updatedStocks.length} stocks`);
        await dispatch(updateStockPrices(updatedStocks));
        
        // Re-calculate cache for updated stocks since their values have changed
        updatedStocks.forEach(asset => {
          const result = calculatorService.calculateAssetMonthlyIncomeWithCache?.(asset);
          if (result?.cacheDataToUpdate) {
            const cachedDividends = createCachedDividends(
              result.cacheDataToUpdate.monthlyAmount,
              result.cacheDataToUpdate.annualAmount,
              result.cacheDataToUpdate.monthlyBreakdown,
              asset
            );
            dispatch(updateAssetDividendCache({ assetId: asset.id, cachedDividends }));
          }
        });

        Logger.info('Successfully updated stock prices and recalculated caches');
      } else {
        Logger.info('No stocks were updated');
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
