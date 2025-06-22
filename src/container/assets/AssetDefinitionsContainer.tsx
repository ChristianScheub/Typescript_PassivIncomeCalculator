import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { AnyAction, ThunkDispatch } from '@reduxjs/toolkit';
import { RootState } from '../../store';
import { fetchAssetDefinitions, addAssetDefinition, updateAssetDefinition, deleteAssetDefinition } from '@/store/slices/assetDefinitionsSlice';
import { 
  fetchAssetCategories, 
  fetchAssetCategoryOptions, 
  fetchAssetCategoryAssignments,
  addAssetCategoryAssignment,
  deleteAssetCategoryAssignmentsByAssetId
} from '@/store/slices/assetCategoriesSlice';
import { AssetDefinitionsView } from '@/view/portfolio-hub/assets/AssetDefinitionsView';
import { AssetDefinition, AssetCategoryAssignment,CreateAssetDefinitionData } from '@/types/domains/assets';
import { AssetType } from '@/types/shared';
import Logger from '@/service/shared/logging/Logger/logger';
import { TrendingUp, Building, Banknote, Coins, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { StockPriceUpdater } from '@/service/shared/utilities/helper/stockPriceUpdater';
import { TimeRangePeriod } from '@/types/shared/time';

// Type for the asset definition data when creating
// type CreateAssetDefinitionData = Omit<AssetDefinition, "id" | "createdAt" | "updatedAt" | "name"> & { name?: string };
import { PriceEntry } from '@/ui/dialog/AddPriceEntryDialog';
import { addPriceToHistory } from '../../utils/priceHistoryUtils';

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
  const [isUpdatingHistoricalData, setIsUpdatingHistoricalData] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      Logger.info('Fetching asset definitions and categories');
      try {
        await Promise.all([
          (dispatch as ThunkDispatch<RootState, unknown, AnyAction>)(fetchAssetDefinitions()).unwrap(),
          (dispatch as ThunkDispatch<RootState, unknown, AnyAction>)(fetchAssetCategories()).unwrap(),
          (dispatch as ThunkDispatch<RootState, unknown, AnyAction>)(fetchAssetCategoryOptions()).unwrap(),
          (dispatch as ThunkDispatch<RootState, unknown, AnyAction>)(fetchAssetCategoryAssignments()).unwrap()
        ]);
      } catch (error) {
        Logger.error('Error fetching data: ' + JSON.stringify(error));
      }
    };

    fetchData();
  }, [dispatch]);

  const handleAddDefinition = async (data: CreateAssetDefinitionData, categoryAssignments: Omit<AssetCategoryAssignment, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    try {
      Logger.info('Adding new asset definition' + " - " + JSON.stringify(data));
      
      // Convert CreateAssetDefinitionData to the format expected by addAssetDefinition
      const definitionData: Omit<AssetDefinition, 'id' | 'createdAt' | 'updatedAt'> = {
        ...data,
        name: data.name || data.fullName || 'Unnamed Asset' // Ensure name is always a string
      };
      
      const action = await (dispatch as ThunkDispatch<RootState, unknown, AnyAction>)(addAssetDefinition(definitionData));
      const newDefinition = addAssetDefinition.fulfilled.match(action) ? action.payload : null;
      
      // Add category assignments if any
      if (categoryAssignments.length > 0 && newDefinition?.id) {
        const assignmentsWithAssetId = categoryAssignments.map(assignment => ({
          ...assignment,
          assetDefinitionId: newDefinition.id
        }));
        
        for (const assignment of assignmentsWithAssetId) {
          await (dispatch as ThunkDispatch<RootState, unknown, AnyAction>)(addAssetCategoryAssignment(assignment));
        }
      }
      
      setIsAddingDefinition(false);
    } catch (error) {
      Logger.error('Failed to add asset definition' + " - " + JSON.stringify(error as Error));
    }
  };

  const handleUpdateDefinition = async (data: Partial<AssetDefinition>, categoryAssignments: Omit<AssetCategoryAssignment, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    if (!editingDefinition) return;
    try {
      Logger.info('Updating asset definition' + " - " + JSON.stringify({ id: editingDefinition.id, data }));
      // Merge the partial data with the existing definition to ensure all required fields are present
      const updatedDefinition = { ...editingDefinition, ...data };
      
      const dividendStatus = updatedDefinition.dividendInfo?.amount && updatedDefinition.dividendInfo.amount > 0 ? 'pays dividends' : 'does not pay dividends';
      Logger.info(`Updating asset definition - ${updatedDefinition.name} (${dividendStatus})`);
      
      await (dispatch as ThunkDispatch<RootState, unknown, AnyAction>)(updateAssetDefinition(updatedDefinition));
      
      // Update category assignments
      // First delete existing assignments
      await (dispatch as ThunkDispatch<RootState, unknown, AnyAction>)(deleteAssetCategoryAssignmentsByAssetId(editingDefinition.id));
      
      // Then add new assignments
      if (categoryAssignments.length > 0) {
        const assignmentsWithAssetId = categoryAssignments.map(assignment => ({
          ...assignment,
          assetDefinitionId: editingDefinition.id
        }));
        
        for (const assignment of assignmentsWithAssetId) {
          await (dispatch as ThunkDispatch<RootState, unknown, AnyAction>)(addAssetCategoryAssignment(assignment));
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
        
        // Delete category assignments first
        const deleteAssignmentsAction = await (dispatch as ThunkDispatch<RootState, unknown, AnyAction>)(deleteAssetCategoryAssignmentsByAssetId(id));
        if (!deleteAssetCategoryAssignmentsByAssetId.fulfilled.match(deleteAssignmentsAction)) {
          throw new Error('Failed to delete category assignments');
        }
        
        // Then delete the definition
        const deleteDefinitionAction = await (dispatch as ThunkDispatch<RootState, unknown, AnyAction>)(deleteAssetDefinition(id));
        if (!deleteAssetDefinition.fulfilled.match(deleteDefinitionAction)) {
          throw new Error('Failed to delete asset definition');
        }
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
        for (const updatedDefinition of updatedDefinitions) {
          Logger.info(`Updating stock price for ${updatedDefinition.ticker}: ${updatedDefinition.currentPrice}`);
          // Make sure we have all required fields before dispatching
          if (updatedDefinition.fullName) {
            await (dispatch as ThunkDispatch<RootState, unknown, AnyAction>)(updateAssetDefinition(updatedDefinition));
          } else {
            Logger.error(`Missing required fields for updating ${updatedDefinition.ticker}`);
          }
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

  const handleUpdateHistoricalData = async (period?: TimeRangePeriod) => {
    setIsUpdatingHistoricalData(true);
    try {
      Logger.info(`Starting historical data update for asset definitions with period: ${period || 'default (30 days)'}`);
      
      // Filter AssetDefinitions that have stock type and ticker symbols
      const stockDefinitions = assetDefinitions.filter((def: AssetDefinition) => 
        def.type === 'stock' && def.ticker
      );
      
      if (stockDefinitions.length === 0) {
        Logger.info('No stock definitions found to update historical data');
        return;
      }
      
      // Use the new method with period if provided, otherwise fall back to default method
      const updatedDefinitions = period 
        ? await StockPriceUpdater.updateStockHistoricalDataWithPeriod(stockDefinitions, period)
        : await StockPriceUpdater.updateStockHistoricalData(stockDefinitions);
      
      if (updatedDefinitions.length > 0) {
        Logger.info(`Dispatching historical data updates for ${updatedDefinitions.length} stock definitions`);
        
        // Update each AssetDefinition in the store
        for (const definition of updatedDefinitions) {
          // Make sure we have all required fields before dispatching
          if (definition.fullName) {
            await (dispatch as ThunkDispatch<RootState, unknown, AnyAction>)(updateAssetDefinition(definition));
          } else {
            Logger.error(`Missing required fields for updating historical data for ${definition.ticker}`);
          }
        }

        Logger.info('Successfully updated historical data for asset definitions');
      } else {
        Logger.info('No stock definitions were updated with historical data');
      }
    } catch (error) {
      Logger.error('Failed to update historical data for asset definitions' + ' - ' + JSON.stringify(error as Error));
    } finally {
      setIsUpdatingHistoricalData(false);
    }
  };

  const handleAddPriceEntry = async (definitionId: string, entry: PriceEntry) => {
    try {
      Logger.info('Adding price entry to asset definition' + " - " + JSON.stringify({ definitionId, entry }));
      
      // Find the definition
      const definition = assetDefinitions.find((def: AssetDefinition) => def.id === definitionId);
      if (!definition) {
        Logger.error(`Asset definition not found: ${definitionId}`);
        return;
      }
      
      // Add the price entry to the history
      const updatedPriceHistory = addPriceToHistory(
        entry.price,
        definition.priceHistory || [],
        entry.date,
        'manual'
      );
      
      // Update the definition with the new price history and current price
      const updatedDefinition = {
        ...definition,
        priceHistory: updatedPriceHistory,
        currentPrice: entry.price,
        lastPriceUpdate: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await (dispatch as ThunkDispatch<RootState, unknown, AnyAction>)(updateAssetDefinition(updatedDefinition));
      Logger.info(`Successfully added price entry to ${definition.fullName}`);
    } catch (error) {
      Logger.error('Failed to add price entry' + " - " + JSON.stringify(error as Error));
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
      isUpdatingHistoricalData={isUpdatingHistoricalData}
      isApiEnabled={isApiEnabled}
      getAssetTypeIcon={getAssetTypeIcon}
      onAddDefinition={(data) => handleAddDefinition(data, [])}
      onUpdateDefinition={(data) => handleUpdateDefinition(data, [])}
      onDeleteDefinition={handleDeleteDefinition}
      onSetIsAddingDefinition={setIsAddingDefinition}
      onSetEditingDefinition={setEditingDefinition}
      onUpdateStockPrices={handleUpdateStockPrices}
      onUpdateHistoricalData={handleUpdateHistoricalData}
      onBack={onBack}
      onAddDefinitionWithCategories={handleAddDefinition}
      onUpdateDefinitionWithCategories={handleUpdateDefinition}
      onAddPriceEntry={handleAddPriceEntry}
    />
  );
};

export default AssetDefinitionsContainer;