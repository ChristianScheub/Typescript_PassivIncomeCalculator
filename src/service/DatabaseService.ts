import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchAssets, addAsset, updateAsset, deleteAsset, updateAssetDividendCache, updateStockPrices } from '../store/slices/assetsSlice';
import { fetchAssetDefinitions } from '../store/slices/assetDefinitionsSlice';
import { AssetsView } from '../view/AssetsView';
import { Asset, AssetType } from '../types';
import { useTranslation } from 'react-i18next';
import Logger from '../service/Logger/logger';
import { analytics } from '../service/analytics';
import calculatorService from '../service/calculatorService';
import { createDividendCacheService } from '../service/dividendCacheService';
import { createCachedDividends } from '../utils/dividendCacheUtils';
import { sortAssets } from '../utils/sortingUtils';
import { StockPriceUpdater } from '../service/helper/stockPriceUpdater';
import AssetDefinitionsContainer from './AssetDefinitionsContainer';

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

  const calculateAssetMonthlyIncome = useCallback((asset: Asset): number => {
    // Verwende immer die gecachte Version direkt vom CacheService
    if (calculatorService.calculateAssetMonthlyIncomeWithCache) {
      const cacheResult = calculatorService.calculateAssetMonthlyIncomeWithCache(asset);
      
      // Update Redux cache if we got new calculation data
      if (!cacheResult.cacheHit && cacheResult.cacheDataToUpdate) {
        const { monthlyAmount, annualAmount, monthlyBreakdown } = cacheResult.cacheDataToUpdate;
        if (monthlyAmount > 0 || annualAmount > 0) {
          const cachedDividends = createCachedDividends(
            monthlyAmount,
            annualAmount, 
            monthlyBreakdown,
            asset
          );
          dispatch(updateAssetDividendCache({ assetId: asset.id, cachedDividends }));
        }
      }
      
      return cacheResult.monthlyAmount;
    }
    
    // Fallback zur nicht-gecachten Version
    return calculatorService.calculateAssetMonthlyIncome(asset);
  }, [dispatch]);

  // Sort assets by value (highest to lowest)
  const sortedAssets = useMemo(() => {
    return sortAssets(assets);
  }, [assets]);

  const { totalAssetValue, monthlyAssetIncome, annualAssetIncome } = useMemo(() => {
    const total = calculatorService.calculateTotalAssetValue(assets);
    const monthly = assets.reduce(
      (sum, asset) => sum + calculateAssetMonthlyIncome(asset),
      0
    );
    return {
      totalAssetValue: total,
      monthlyAssetIncome: monthly,
      annualAssetIncome: monthly * 12
    };
  }, [assets, calculateAssetMonthlyIncome]);

  const totalInitialValue = useMemo(() => {
    return assets.reduce((sum, asset) => {
      if (asset.type === 'stock') {
        // Use 0 as fallback if either purchasePrice or purchaseQuantity is undefined
        const price = asset.purchasePrice || 0;
        const quantity = asset.purchaseQuantity || 1; // Default to 1 for stocks
        return sum + (price * quantity);
      } else {
        // For non-stock assets, use purchasePrice directly (quantity is usually 1)
        return sum + (asset.purchasePrice || 0);
      }
    }, 0);
  }, [assets]);

  const totalValueDifference = useMemo(() => {
    return totalAssetValue - totalInitialValue;
  }, [totalAssetValue, totalInitialValue]);

  const totalPercentageDifference = useMemo(() => {
    return totalInitialValue > 0 ? (totalValueDifference / totalInitialValue) * 100 : 0;
  }, [totalValueDifference, totalInitialValue]);

  const handleAddAsset = async (data: any) => {
    try {
      Logger.info('Adding new asset transaction' + " - " + JSON.stringify(data));
      analytics.trackEvent('asset_add', { type: data.type, hasDefinitionId: !!data.assetDefinitionId });
      await dispatch(addAsset(data));
      setIsAddingAsset(false);
      
      // Cache handling for new asset
      const newAsset = assets[assets.length - 1];
      if (newAsset) {
        const monthlyAmount = calculatorService.calculateAssetMonthlyIncome(newAsset);
        const annualAmount = monthlyAmount * 12;
        const monthlyBreakdown: Record<number, number> = {};
        
        for (let month = 1; month <= 12; month++) {
          monthlyBreakdown[month] = calculatorService.calculateAssetIncomeForMonth(newAsset, month);
        }
        
        const cachedDividends = createCachedDividends(
          monthlyAmount,
          annualAmount,
          monthlyBreakdown,
          newAsset
        );
        dispatch(updateAssetDividendCache({ assetId: newAsset.id, cachedDividends }));
      }
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

  // Helper: Update asset cache in Redux
  async function updateAssetCacheAfterEdit(editingAsset: Asset, assets: Asset[], dispatch: any) {
    const updatedAsset = assets.find(a => a.id === editingAsset.id);
    if (updatedAsset) {
      const monthlyAmount = calculatorService.calculateAssetMonthlyIncome(updatedAsset);
      const annualAmount = monthlyAmount * 12;
      const monthlyBreakdown: Record<number, number> = {};
      for (let month = 1; month <= 12; month++) {
        monthlyBreakdown[month] = calculatorService.calculateAssetIncomeForMonth(updatedAsset, month);
      }
      const cachedDividends = createCachedDividends(
        monthlyAmount,
        annualAmount,
        monthlyBreakdown,
        updatedAsset
      );
      dispatch(updateAssetDividendCache({ assetId: updatedAsset.id, cachedDividends }));
    }
  }

  const handleUpdateAsset = async (data: any) => {
    if (!editingAsset) return;
    try {
      Logger.info('Updating asset transaction' + " - " + JSON.stringify({ id: editingAsset.id, data }));
      analytics.trackEvent('asset_update', { id: editingAsset.id, type: data.type });
      updateStockValueFields(data);
      await dispatch(updateAsset({ ...data, id: editingAsset.id }));
      setEditingAsset(null);
      await updateAssetCacheAfterEdit(editingAsset, assets, dispatch);
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

  const handleBackToAssets = () => {
    setIsShowingDefinitions(false);
  };

  // If showing definitions, render the definitions container instead
  if (isShowingDefinitions) {
    return (
      <AssetDefinitionsContainer 
        onBack={handleBackToAssets}
      />
    );
  }

  return (
    <AssetsView
      assets={sortedAssets}
      status={status}
      totalAssetValue={totalAssetValue}
      totalValueDifference={totalValueDifference}
      totalPercentageDifference={totalPercentageDifference}
      monthlyAssetIncome={monthlyAssetIncome}
      annualAssetIncome={annualAssetIncome}
      isAddingAsset={isAddingAsset}
      editingAsset={editingAsset}
      isUpdatingPrices={isUpdatingPrices}
      isApiEnabled={isApiEnabled}
      calculateAssetMonthlyIncome={calculateAssetMonthlyIncome}
      getAssetTypeLabel={getAssetTypeLabel}
      onAddAsset={handleAddAsset}
      onUpdateAsset={handleUpdateAsset}
      onDeleteAsset={handleDeleteAsset}
      onSetIsAddingAsset={setIsAddingAsset}
      onSetEditingAsset={setEditingAsset}
      onUpdateStockPrices={handleUpdateStockPrices}
      onNavigateToDefinitions={handleNavigateToDefinitions}
    />
  );
};

export default AssetsContainer;