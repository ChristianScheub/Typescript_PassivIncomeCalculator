import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchAssets, addAsset, updateAsset, deleteAsset, updateAssetDividendCache } from '../store/slices/assetsSlice';
import { Asset, AssetType } from '../types';
import { useTranslation } from 'react-i18next';
import Logger from '../service/Logger/logger';
import { analytics } from '../service/analytics';
import calculatorService from '../service/calculatorService';
import { AssetsView } from '../view/AssetsView';
import { createDividendCacheService } from '../service/dividendCacheService';
import { createCachedDividends } from '../utils/dividendCacheUtils';

const AssetsContainer: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { items: assets, status } = useAppSelector(state => state.assets);
  const [isAddingAsset, setIsAddingAsset] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  
  // Cache für die berechneten Werte pro Asset
  const assetIncomeCache = useMemo(() => new Map<string, number>(), []);

  useEffect(() => {
    if (status === 'idle') {
      Logger.info('Fetching assets');
      dispatch(fetchAssets());
    }
    
    // Initialize dividend cache service
    createDividendCacheService(dispatch);
  }, [dispatch, status]);

  const calculateAssetMonthlyIncome = useCallback((asset: Asset): number => {
    // Prüfe zuerst den lokalen Cache
    if (assetIncomeCache.has(asset.id)) {
      return assetIncomeCache.get(asset.id)!;
    }

    let result: number;
    if (calculatorService.calculateAssetMonthlyIncomeWithCache) {
      const cacheResult = calculatorService.calculateAssetMonthlyIncomeWithCache(asset);
      if (cacheResult.cacheHit) {
        result = cacheResult.monthlyAmount;
      } else if (cacheResult.cacheDataToUpdate) {
        result = cacheResult.cacheDataToUpdate.monthlyAmount;
      } else {
        result = calculatorService.calculateAssetMonthlyIncome(asset);
      }
    } else {
      result = calculatorService.calculateAssetMonthlyIncome(asset);
    }

    // Speichere das Ergebnis im lokalen Cache
    assetIncomeCache.set(asset.id, result);
    return result;
  }, [assetIncomeCache]);

  // Cache leeren wenn sich Assets ändern
  useEffect(() => {
    assetIncomeCache.clear();
  }, [assets, assetIncomeCache]);

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

  const handleAddAsset = async (data: any) => {
    try {
      Logger.info('Adding new asset' + " - " + JSON.stringify(data));
      analytics.trackEvent('asset_add', { type: data.type });
      await dispatch(addAsset(data));
      setIsAddingAsset(false);
      
      // Clear the cache after adding
      assetIncomeCache.clear();
      
      // Nach dem Hinzufügen: Asset aus dem Store holen (das letzte Element)
      const newAsset = assets[assets.length - 1];
      if (newAsset) {
        const monthlyAmount = calculatorService.calculateAssetMonthlyIncome(newAsset);
        const annualAmount = monthlyAmount * 12;
        const monthlyBreakdown: Record<number, number> = {};
        for (let month = 1; month <= 12; month++) {
          monthlyBreakdown[month] = monthlyAmount;
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
      Logger.error('Failed to add asset' + " - " + JSON.stringify(error as Error));
    }
  };

  const handleUpdateAsset = async (data: any) => {
    if (editingAsset) {
      try {
        Logger.info('Updating asset' + " - " + JSON.stringify({ id: editingAsset.id, data }));
        analytics.trackEvent('asset_update', { id: editingAsset.id, type: data.type });
        await dispatch(updateAsset({ ...data, id: editingAsset.id }));
        setEditingAsset(null);
        
        // Clear the cache after updating
        assetIncomeCache.clear();
        
        // Nach dem Aktualisieren: Asset aus dem Store holen (per ID)
        const updatedAsset = assets.find(a => a.id === editingAsset.id);
        if (updatedAsset) {
          const monthlyAmount = calculatorService.calculateAssetMonthlyIncome(updatedAsset);
          const annualAmount = monthlyAmount * 12;
          const monthlyBreakdown: Record<number, number> = {};
          for (let month = 1; month <= 12; month++) {
            monthlyBreakdown[month] = monthlyAmount;
          }
          const cachedDividends = createCachedDividends(
            monthlyAmount,
            annualAmount,
            monthlyBreakdown,
            updatedAsset
          );
          dispatch(updateAssetDividendCache({ assetId: updatedAsset.id, cachedDividends }));
        }
      } catch (error) {
        Logger.error('Failed to update asset' + " - " + JSON.stringify(error as Error));
      }
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

  const getAssetTypeLabel = useCallback((type: AssetType): string => {
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

  return (
    <AssetsView
      assets={assets}
      status={status}
      totalAssetValue={totalAssetValue}
      monthlyAssetIncome={monthlyAssetIncome}
      annualAssetIncome={annualAssetIncome}
      isAddingAsset={isAddingAsset}
      editingAsset={editingAsset}
      calculateAssetMonthlyIncome={calculateAssetMonthlyIncome}
      getAssetTypeLabel={getAssetTypeLabel}
      onAddAsset={handleAddAsset}
      onUpdateAsset={handleUpdateAsset}
      onDeleteAsset={handleDeleteAsset}
      onSetIsAddingAsset={setIsAddingAsset}
      onSetEditingAsset={setEditingAsset}
    />
  );
};

export default AssetsContainer;
