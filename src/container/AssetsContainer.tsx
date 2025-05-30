import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchAssets, addAsset, updateAsset, deleteAsset } from '../store/slices/assetsSlice';
import { Asset, AssetType } from '../types';
import { useTranslation } from 'react-i18next';
import Logger from '../service/Logger/logger';
import { analytics } from '../service/analytics';
import calculatorService from '../service/calculatorService';
import { AssetsView } from '../view/AssetsView';

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
  }, [dispatch, status]);

  const calculateAssetMonthlyIncome = (asset: Asset): number => {
    return calculatorService.calculateAssetMonthlyIncome(asset);
  };

  const totalAssetValue = calculatorService.calculateTotalAssetValue(assets);
  const monthlyAssetIncome = calculatorService.calculateTotalMonthlyAssetIncome(assets);
  const annualAssetIncome = monthlyAssetIncome * 12;

  const handleAddAsset = async (data: any) => {
    try {
      Logger.info('Adding new asset' + " - " + JSON.stringify(data));
      analytics.trackEvent('asset_add', { type: data.type });
      await dispatch(addAsset(data));
      setIsAddingAsset(false);
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
