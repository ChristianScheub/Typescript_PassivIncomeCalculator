import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (status === 'idle') {
      Logger.info('Fetching assets');
      dispatch(fetchAssets());
    }
    
    // Initialize dividend cache service
    createDividendCacheService(dispatch);
  }, [dispatch, status]);

  const calculateAssetMonthlyIncome = (asset: Asset): number => {
    if (calculatorService.calculateAssetMonthlyIncomeWithCache) {
      const result = calculatorService.calculateAssetMonthlyIncomeWithCache(asset);
      if (result.cacheHit) {
        return result.monthlyAmount;
      } else if (result.cacheDataToUpdate) {
        // NICHT im Render-Flow dispatchen! Nur Wert zurückgeben.
        return result.cacheDataToUpdate.monthlyAmount;
      }
    }
    // Fallback zu non-cached
    return calculatorService.calculateAssetMonthlyIncome(asset);
  };

  const totalAssetValue = calculatorService.calculateTotalAssetValue(assets);
  
  // Use correct calculation for monthly asset income (pro Asset Cache+Fallback)
  const monthlyAssetIncome = assets.reduce(
    (sum, asset) => sum + calculateAssetMonthlyIncome(asset),
    0
  );
  
  const annualAssetIncome = monthlyAssetIncome * 12;

  const handleAddAsset = async (data: any) => {
    try {
      Logger.info('Adding new asset' + " - " + JSON.stringify(data));
      analytics.trackEvent('asset_add', { type: data.type });
      await dispatch(addAsset(data));
      setIsAddingAsset(false);
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

  const getAssetTypeLabel = (type: AssetType): string => {
    return t(`assets.types.${type}`);
  };

  // Cache-Miss-Handling: Nach jedem Render Cache für fehlende/ungültige Assets nachziehen
  useEffect(() => {
    if (!assets || assets.length === 0) return;
    assets.forEach(asset => {
      if (calculatorService.calculateAssetMonthlyIncomeWithCache) {
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
