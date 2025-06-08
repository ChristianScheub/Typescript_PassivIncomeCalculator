import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchAssetDefinitions, addAssetDefinition, updateAssetDefinition, deleteAssetDefinition } from '../store/slices/assetDefinitionsSlice';
import { AssetDefinitionsView } from '../view/AssetDefinitionsView';
import { AssetDefinition, AssetType } from '../types';
import Logger from '../service/Logger/logger';
import { analytics } from '../service/analytics';
import { TrendingUp, Building, Banknote, Coins, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AssetDefinitionsContainerProps {
  onBack?: () => void;
}

const AssetDefinitionsContainer: React.FC<AssetDefinitionsContainerProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { items: assetDefinitions, status } = useAppSelector(state => state.assetDefinitions);
  const [isAddingDefinition, setIsAddingDefinition] = useState(false);
  const [editingDefinition, setEditingDefinition] = useState<AssetDefinition | null>(null);

  useEffect(() => {
    Logger.info('Fetching asset definitions');
    dispatch(fetchAssetDefinitions());
  }, [dispatch]);

  const handleAddDefinition = async (data: any) => {
    try {
      Logger.info('Adding new asset definition' + " - " + JSON.stringify(data));
      analytics.trackEvent('asset_definition_add');
      await dispatch(addAssetDefinition(data));
      setIsAddingDefinition(false);
    } catch (error) {
      Logger.error('Failed to add asset definition' + " - " + JSON.stringify(error as Error));
    }
  };

  const handleUpdateDefinition = async (data: any) => {
    if (!editingDefinition) return;
    try {
      Logger.info('Updating asset definition' + " - " + JSON.stringify({ id: editingDefinition.id, data }));
      analytics.trackEvent('asset_definition_update', { id: editingDefinition.id });
      await dispatch(updateAssetDefinition({ ...data, id: editingDefinition.id }));
      setEditingDefinition(null);
    } catch (error) {
      Logger.error('Failed to update asset definition' + " - " + JSON.stringify(error as Error));
    }
  };

  const handleDeleteDefinition = async (id: string) => {
    if (window.confirm(t('common.deleteConfirm'))) {
      try {
        Logger.info('Deleting asset definition' + " - " + JSON.stringify({ id }));
        analytics.trackEvent('asset_definition_delete', { id });
        await dispatch(deleteAssetDefinition(id));
      } catch (error) {
        Logger.error('Failed to delete asset definition' + " - " + JSON.stringify(error as Error));
      }
    }
  };

  const getAssetTypeIcon = (type: string) => {
    switch (type as AssetType) {
      case 'stock':
        return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case 'real_estate':
        return <Building className="h-5 w-5 text-green-600" />;
      case 'bond':
      case 'cash':
        return <Banknote className="h-5 w-5 text-purple-600" />;
      case 'crypto':
        return <Coins className="h-5 w-5 text-orange-600" />;
      default:
        return <Wallet className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <AssetDefinitionsView
      assetDefinitions={assetDefinitions}
      status={status}
      isAddingDefinition={isAddingDefinition}
      editingDefinition={editingDefinition}
      getAssetTypeIcon={getAssetTypeIcon}
      onAddDefinition={handleAddDefinition}
      onUpdateDefinition={handleUpdateDefinition}
      onDeleteDefinition={handleDeleteDefinition}
      onSetIsAddingDefinition={setIsAddingDefinition}
      onSetEditingDefinition={setEditingDefinition}
      onBack={onBack}
    />
  );
};

export default AssetDefinitionsContainer;