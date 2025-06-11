import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchAssetDefinitions, addAssetDefinition, updateAssetDefinition, deleteAssetDefinition } from '../store/slices/assetDefinitionsSlice';
import { 
  fetchAssetCategories, 
  fetchAssetCategoryOptions, 
  fetchAssetCategoryAssignments,
  addAssetCategoryAssignment,
  deleteAssetCategoryAssignmentsByAssetId
} from '../store/slices/assetCategoriesSlice';
import { AssetDefinitionsView } from '../view/assets/AssetDefinitionsView';
import { AssetDefinition, AssetType, AssetCategoryAssignment } from '../types';
import Logger from '../service/Logger/logger';
import { analytics } from '../service/analytics';
import { TrendingUp, Building, Banknote, Coins, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { StockPriceUpdater } from '../service/helper/stockPriceUpdater';

interface AssetDefinitionsContainerProps {
  onBack?: () => void;
}

const AssetDefinitionsContainer: React.FC<AssetDefinitionsContainerProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { items: assetDefinitions, status } = useAppSelector(state => state.assetDefinitions);
  const { isEnabled: isApiEnabled } = useAppSelector(state => state.apiConfig);
  const [isAddingDefinition, setIsAddingDefinition] = useState(false);
  const [editingDefinition, setEditingDefinition] = useState<AssetDefinition | null>(null);
  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false);

  useEffect(() => {
    Logger.info('Fetching asset definitions and categories');
    dispatch(fetchAssetDefinitions());
    dispatch(fetchAssetCategories());
    dispatch(fetchAssetCategoryOptions());
    dispatch(fetchAssetCategoryAssignments());
  }, [dispatch]);

  const handleAddDefinition = async (data: any, categoryAssignments: Omit<AssetCategoryAssignment, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    try {
      Logger.info('Adding new asset definition' + " - " + JSON.stringify(data));
      analytics.trackEvent('asset_definition_add');
      const newDefinition = await dispatch(addAssetDefinition(data));
      
      // Add category assignments if any
      if (categoryAssignments.length > 0 && (newDefinition.payload as any)?.id) {
        const assignmentsWithAssetId = categoryAssignments.map(assignment => ({
          ...assignment,
          assetDefinitionId: (newDefinition.payload as any).id
        }));
        
        for (const assignment of assignmentsWithAssetId) {
          await dispatch(addAssetCategoryAssignment(assignment));
        }
      }
      
      setIsAddingDefinition(false);
    } catch (error) {
      Logger.error('Failed to add asset definition' + " - " + JSON.stringify(error as Error));
    }
  };

  const handleUpdateDefinition = async (data: any, categoryAssignments: Omit<AssetCategoryAssignment, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    if (!editingDefinition) return;
    try {
      Logger.info('Updating asset definition' + " - " + JSON.stringify({ id: editingDefinition.id, data }));
      analytics.trackEvent('asset_definition_update', { id: editingDefinition.id });
      await dispatch(updateAssetDefinition({ ...data, id: editingDefinition.id }));
      
      // Update category assignments
      // First delete existing assignments
      await dispatch(deleteAssetCategoryAssignmentsByAssetId(editingDefinition.id));
      
      // Then add new assignments
      if (categoryAssignments.length > 0) {
        const assignmentsWithAssetId = categoryAssignments.map(assignment => ({
          ...assignment,
          assetDefinitionId: editingDefinition.id
        }));
        
        for (const assignment of assignmentsWithAssetId) {
          await dispatch(addAssetCategoryAssignment(assignment));
        }
      }
      
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
        
        // Delete category assignments first
        await dispatch(deleteAssetCategoryAssignmentsByAssetId(id));
        
        // Then delete the definition
        await dispatch(deleteAssetDefinition(id));
      } catch (error) {
        Logger.error('Failed to delete asset definition' + " - " + JSON.stringify(error as Error));
      }
    }
  };

  const handleUpdateStockPrices = async () => {
    setIsUpdatingPrices(true);
    try {
      Logger.info('Starting stock price update for asset definitions');
      
      // Filter AssetDefinitions that have stock type and ticker symbols
      const stockDefinitions = assetDefinitions.filter((def: AssetDefinition) => 
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

        Logger.info('Successfully updated stock prices for asset definitions');
      } else {
        Logger.info('No stock definitions were updated');
      }
    } catch (error) {
      Logger.error('Failed to update stock prices for asset definitions' + ' - ' + JSON.stringify(error as Error));
    } finally {
      setIsUpdatingPrices(false);
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

  // Sort asset definitions alphabetically by fullName
  const sortedAssetDefinitions = [...assetDefinitions].sort((a, b) => 
    a.fullName.localeCompare(b.fullName, 'de', { sensitivity: 'base' })
  );

  return (
    <AssetDefinitionsView
      assetDefinitions={sortedAssetDefinitions}
      status={status}
      isAddingDefinition={isAddingDefinition}
      editingDefinition={editingDefinition}
      isUpdatingPrices={isUpdatingPrices}
      isApiEnabled={isApiEnabled}
      getAssetTypeIcon={getAssetTypeIcon}
      onAddDefinition={(data) => handleAddDefinition(data, [])}
      onUpdateDefinition={(data) => handleUpdateDefinition(data, [])}
      onDeleteDefinition={handleDeleteDefinition}
      onSetIsAddingDefinition={setIsAddingDefinition}
      onSetEditingDefinition={setEditingDefinition}
      onUpdateStockPrices={handleUpdateStockPrices}
      onBack={onBack}
      onAddDefinitionWithCategories={handleAddDefinition}
      onUpdateDefinitionWithCategories={handleUpdateDefinition}
    />
  );
};

export default AssetDefinitionsContainer;