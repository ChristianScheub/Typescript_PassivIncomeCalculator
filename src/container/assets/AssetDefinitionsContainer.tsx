import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { AnyAction, ThunkDispatch } from '@reduxjs/toolkit';
import { RootState } from '../../store';
import { fetchAssetDefinitions, addAssetDefinition, updateAssetDefinition, deleteAssetDefinition, fetchAndUpdateDividends } from '@/store/slices/assetDefinitionsSlice';
import { 
  fetchAssetCategories, 
  fetchAssetCategoryOptions, 
  fetchAssetCategoryAssignments,
  addAssetCategoryAssignment,
  deleteAssetCategoryAssignmentsByAssetId
} from '@/store/slices/assetCategoriesSlice';
import { AssetDefinitionsView } from '@/view/portfolio-hub/assets/AssetDefinitionsView';
import { AssetDefinition, AssetCategoryAssignment,CreateAssetDefinitionData } from '@/types/domains/assets';
import Logger from '@/service/shared/logging/Logger/logger';
import { TrendingUp, Building, Banknote, Coins, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { StockPriceUpdater } from '@/service/shared/utilities/helper/stockPriceUpdater';
import { TimeRangePeriod } from '@/types/shared/time';
import { deepCleanObject } from '@/utils/deepCleanObject';

// Type for the asset definition data when creating
// type CreateAssetDefinitionData = Omit<AssetDefinition, "id" | "createdAt" | "updatedAt" | "name"> & { name?: string };
import { PriceEntry } from '@/ui/dialog/AddPriceEntryDialog';
import { addPriceToHistory } from '../../utils/priceHistoryUtils';

interface AssetDefinitionsContainerProps {
  onBack?: () => void;
}

// Type alias for asset types
export type AssetTypeAlias = 'stock' | 'real_estate' | 'bond' | 'cash' | 'crypto' | 'other';

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

  // Helper to add category assignments
  const addCategoryAssignments = async (assignments: Omit<AssetCategoryAssignment, 'id' | 'createdAt' | 'updatedAt'>[], assetId: string) => {
    if (assignments.length > 0 && assetId) {
      const assignmentsWithAssetId = assignments.map(assignment => ({
        ...assignment,
        assetDefinitionId: assetId
      }));
      for (const assignment of assignmentsWithAssetId) {
        await (dispatch as ThunkDispatch<RootState, unknown, AnyAction>)(addAssetCategoryAssignment(assignment));
      }
    }
  };

  const handleAddDefinition = async (data: CreateAssetDefinitionData, categoryAssignments: Omit<AssetCategoryAssignment, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    try {
      Logger.info('Adding new asset definition' + ' - ' + JSON.stringify(data));
      const definitionData: Omit<AssetDefinition, 'id' | 'createdAt' | 'updatedAt'> = {
        ...data,
        name: data.name || data.fullName || 'Unnamed Asset'
      };
      const action = await (dispatch as ThunkDispatch<RootState, unknown, AnyAction>)(addAssetDefinition(definitionData));
      const newDefinition = addAssetDefinition.fulfilled.match(action) ? action.payload : null;
      if (newDefinition?.id) {
        await addCategoryAssignments(categoryAssignments, newDefinition.id);
      }
      setIsAddingDefinition(false);
    } catch (error) {
      Logger.errorStack('Failed to add asset definition', error instanceof Error ? error : new Error(String(error)));
    }
  };

  const handleUpdateDefinition = async (data: Partial<AssetDefinition>, categoryAssignments: Omit<AssetCategoryAssignment, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    if (!editingDefinition) return;
    try {
      Logger.info('Updating asset definition' + ' - ' + JSON.stringify({ id: editingDefinition.id, data }));
      const updatedDefinition = { ...editingDefinition, ...data };
      const cleanedDefinition = deepCleanObject(updatedDefinition);
      const dividendStatus = cleanedDefinition.dividendInfo?.amount && cleanedDefinition.dividendInfo?.amount > 0 ? 'pays dividends' : 'does not pay dividends';
      Logger.info(`Updating asset definition - ${cleanedDefinition?.name} (${dividendStatus})`);
      Logger.info('Updating asset definition - FINAL DATA: ' + JSON.stringify(cleanedDefinition));
      await (dispatch as ThunkDispatch<RootState, unknown, AnyAction>)(updateAssetDefinition(cleanedDefinition));
      await (dispatch as ThunkDispatch<RootState, unknown, AnyAction>)(deleteAssetCategoryAssignmentsByAssetId(editingDefinition.id));
      await addCategoryAssignments(categoryAssignments, editingDefinition.id);
      setEditingDefinition(null);
    } catch (error) {
      Logger.errorStack('[handleUpdateDefinition] Failed to update asset definition', error instanceof Error ? error : new Error(String(error)));
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
        Logger.errorStack('Failed to delete asset definition', error instanceof Error ? error : new Error(String(error)));
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
        // Trigger portfolio intraday aggregation after price update
        const state = (dispatch as ThunkDispatch<RootState, unknown, AnyAction> & { getState?: () => RootState }).getState?.() ?? {};
        const portfolioPositions = state.transactions?.portfolioCache?.positions || [];
        const portfolioCacheId = state.transactions?.portfolioCache?.id || 'default';
        if (portfolioPositions.length > 0) {
          await (dispatch as ThunkDispatch<RootState, unknown, AnyAction>)(
            require('@/store/slices/portfolioIntradaySlice').calculatePortfolioIntradayDataDirect({
              portfolioPositions,
              portfolioCacheId,
              assetDefinitions: assetDefinitions
            })
          );
          Logger.info('Triggered portfolio intraday aggregation after price update');
        } else {
          Logger.warn('No portfolio positions found for intraday aggregation after price update');
        }
      } else {
        Logger.info('No stock definitions were updated');
      }
    } catch (error) {
      Logger.errorStack('Failed to update stock prices for asset definitions', error instanceof Error ? error : new Error(String(error)));
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
      Logger.errorStack('Failed to update historical data for asset definitions', error instanceof Error ? error : new Error(String(error)));
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
      Logger.errorStack('Failed to add price entry', error instanceof Error ? error : new Error(String(error)));
    }
  };

  // Handler für Dividenden per API abrufen
  const handleFetchDividendsFromApi = async (definition: AssetDefinition) => {
    try {
      Logger.info('Fetching dividends from API for asset: ' + definition.fullName);
      // Hier: Redux-Thunk dispatchen
      const result = await (dispatch as ThunkDispatch<RootState, unknown, AnyAction>)(
        // @ts-ignore
        fetchAndUpdateDividends(definition)
      ).unwrap();
      if (result) {
        Logger.info('Dividenden erfolgreich abgerufen und Asset aktualisiert: ' + JSON.stringify(result));
        let resultToDispatch = { ...result };
        if (resultToDispatch.dividendInfo) {
          const { amount, lastDividendDate, paymentMonths } = resultToDispatch.dividendInfo;
          // Typ-Umwandlung für Frequency, damit auch 'none' oder andere Werte abgefangen werden
          const allowedFrequencies = ['monthly', 'quarterly', 'annually', 'custom'] as const;
          const rawFrequency = resultToDispatch.dividendInfo.frequency;
          const frequency: 'monthly' | 'quarterly' | 'annually' | 'custom' =
            allowedFrequencies.includes(rawFrequency as any)
              ? (rawFrequency as any)
              : 'custom';
          resultToDispatch.dividendInfo = {
            amount,
            frequency,
            lastDividendDate,
            paymentMonths,
          };
        }
        await (dispatch as ThunkDispatch<RootState, unknown, AnyAction>)(updateAssetDefinition(resultToDispatch as AssetDefinition));
      }
    } catch (error) {
      Logger.errorStack('[handleFetchDividendsFromApi] Fehler beim Abrufen der Dividenden per API', error instanceof Error ? error : new Error(String(error)));
    }
  };

  // Asset type icon helper (must be in scope for JSX)
  const getAssetTypeIcon = (type: AssetTypeAlias) => {
    switch (type) {
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
      onSetIsAddingDefinition={setIsAddingDefinition}
      editingDefinition={editingDefinition}
      onSetEditingDefinition={setEditingDefinition}
      isUpdatingPrices={isUpdatingPrices}
      isUpdatingHistoricalData={isUpdatingHistoricalData}
      onBack={onBack}
      onAddDefinition={(data) => handleAddDefinition(data, [])}
      onUpdateDefinition={(data) => handleUpdateDefinition(data, [])}
      onDeleteDefinition={handleDeleteDefinition}
      onUpdateStockPrices={handleUpdateStockPrices}
      onUpdateHistoricalData={handleUpdateHistoricalData}
      onAddPriceEntry={handleAddPriceEntry}
      onFetchDividendsFromApi={handleFetchDividendsFromApi}
      isApiEnabled={isApiEnabled}
      getAssetTypeIcon={(type) => getAssetTypeIcon(type as AssetTypeAlias)}
    />
  );
};

export default AssetDefinitionsContainer;