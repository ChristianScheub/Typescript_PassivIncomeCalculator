// Helper to process batch update results from worker services
type BatchResult<T> = {
  success: boolean;
  updatedDefinition?: T;
  symbol?: string;
  error?: string;
};
import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import { RootState } from "@/store";
import {
  addAssetDefinition,
  updateAssetDefinition,
  deleteAssetDefinition,
  fetchAssetCategories,
  fetchAssetCategoryOptions,
  fetchAssetCategoryAssignments,
  addAssetCategoryAssignment,
  deleteAssetCategoryAssignmentsByAssetId,
} from "@/store/slices/domain";
import { AssetDefinitionsView } from "@/view/portfolio-hub/assets/AssetDefinitionsView";
import {
  AssetDefinition,
  AssetCategoryAssignment,
  CreateAssetDefinitionData,
} from "@/types/domains/assets";
import Logger from "@/service/shared/logging/Logger/logger";
import { TrendingUp, Building, Banknote, Coins, Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TimeRangePeriod } from "@/types/shared/time";
import { deepCleanObject } from "@/utils/deepCleanObject";
import { executeAsyncOperation } from "@/utils/containerUtils";
import { showSuccessSnackbar } from "@/store/slices/ui";
import { marketDataWorkerService } from "@/service/shared/workers/marketDataWorkerService";
import { batchAssetUpdateService } from "@/service/domain/assets/market-data/batchAssetUpdateService";

// Type for the asset definition data when creating
// type CreateAssetDefinitionData = Omit<AssetDefinition, "id" | "createdAt" | "updatedAt" | "name"> & { name?: string };
import { PriceEntry } from "@/ui/portfolioHub/dialog/AddPriceEntryDialog";
import { addPriceToHistory } from "@/utils/priceHistoryUtils";
import { calculatePortfolioIntradayDataDirect } from "@/store/slices/cache";
import { DividendFrequency } from "@/types/shared";


interface AssetDefinitionsContainerProps {
  onBack?: () => void;
}

// Type alias for asset types
export type AssetTypeAlias = "stock" | "real_estate" | "bond" | "cash" | "crypto" | "other";

// Type alias for dividend frequency

const AssetDefinitionsContainer: React.FC<AssetDefinitionsContainerProps> = ({
  onBack,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { items: assetDefinitions, status } = useAppSelector(
    (state) => state.assetDefinitions
  );
  const { enabled: isApiEnabled } = useAppSelector(
    (state) => state.config.apis.stock
  );
  const isDividendApiEnabled = useAppSelector(
    (state) => state.config.apis.dividend.enabled
  ); // Added this selector
  const [isAddingDefinition, setIsAddingDefinition] = useState(false);
  const [editingDefinition, setEditingDefinition] =
    useState<AssetDefinition | null>(null);
  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false);
  const [isUpdatingHistoricalData, setIsUpdatingHistoricalData] =
    useState(false);

  useEffect(() => {
    const fetchData = async () => {
      Logger.info("Fetching asset definitions and categories");
      try {
        await Promise.all([
          (dispatch as ThunkDispatch<RootState, unknown, AnyAction>)(
            fetchAssetCategories()
          ).unwrap(),
          (dispatch as ThunkDispatch<RootState, unknown, AnyAction>)(
            fetchAssetCategoryOptions()
          ).unwrap(),
          (dispatch as ThunkDispatch<RootState, unknown, AnyAction>)(
            fetchAssetCategoryAssignments()
          ).unwrap(),
        ]);
      } catch (error) {
        Logger.error("Error fetching data: " + JSON.stringify(error));
      }
    };

    fetchData();
  }, [dispatch]);

  // Helper to add category assignments
  const addCategoryAssignments = async (
    assignments: Omit<
      AssetCategoryAssignment,
      "id" | "createdAt" | "updatedAt"
    >[],
    assetId: string
  ) => {
    if (assignments.length > 0 && assetId) {
      const assignmentsWithAssetId = assignments.map((assignment) => ({
        ...assignment,
        assetDefinitionId: assetId,
      }));
      for (const assignment of assignmentsWithAssetId) {
        await (dispatch as ThunkDispatch<RootState, unknown, AnyAction>)(
          addAssetCategoryAssignment(assignment)
        );
      }
    }
  };

  const updateBatchDividendsMainThread = async (
    definitions: AssetDefinition[],
    options = { interval: '1d', range: '2y' }
  ): Promise<
    | { type: 'batchResult'; results: BatchResult<AssetDefinition>[] }
    | { type: 'error'; error: string }
  > => {
    const result = await batchAssetUpdateService.updateBatchDividends(definitions, options);
    // Defensive: filter out undefined/null from results
    if (result && result.type === 'batchResult' && Array.isArray(result.results)) {
      return { type: 'batchResult', results: result.results.filter(Boolean) };
    }
    if (result && (result as { type: string }).type === 'error') {
      return result;
    }
    return { type: 'error', error: 'Unknown error in batchAssetUpdateService' };
  };

  const addDefinition = async (
    data: CreateAssetDefinitionData,
    categoryAssignments: Omit<
      AssetCategoryAssignment,
      "id" | "createdAt" | "updatedAt"
    >[]
  ) => {
    await executeAsyncOperation(
      "add asset definition",
      async () => {
        const definitionData: Omit<
          AssetDefinition,
          "id" | "createdAt" | "updatedAt"
        > = {
          ...data,
          name: data.name || data.fullName || "Unnamed Asset",
        };
        const action = await (
          dispatch as ThunkDispatch<RootState, unknown, AnyAction>
        )(addAssetDefinition(definitionData));
        const newDefinition = addAssetDefinition.fulfilled.match(action)
          ? action.payload
          : null;
        if (newDefinition?.id) {
          await addCategoryAssignments(categoryAssignments, newDefinition.id);
        }
        setIsAddingDefinition(false);
      },
      undefined,
      JSON.stringify(data)
    );
  };

  const updateDefinition = async (
    data: Partial<AssetDefinition>,
    categoryAssignments: Omit<
      AssetCategoryAssignment,
      "id" | "createdAt" | "updatedAt"
    >[]
  ) => {
    if (!editingDefinition) return;
    await executeAsyncOperation(
      "update asset definition",
      async () => {
        Logger.info(
          "Updating asset definition" +
            " - " +
            JSON.stringify({ id: editingDefinition.id, data })
        );
        const updatedDefinition = { ...editingDefinition, ...data };
        const cleanedDefinition = deepCleanObject(updatedDefinition);
        Logger.info(
          "Updating asset definition - FINAL DATA: " +
            JSON.stringify(cleanedDefinition)
        );
        await (dispatch as ThunkDispatch<RootState, unknown, AnyAction>)(
          updateAssetDefinition(cleanedDefinition)
        );
        await (dispatch as ThunkDispatch<RootState, unknown, AnyAction>)(
          deleteAssetCategoryAssignmentsByAssetId(editingDefinition.id)
        );
        await addCategoryAssignments(categoryAssignments, editingDefinition.id);
        setEditingDefinition(null);
      },
      undefined,
      JSON.stringify({ before: editingDefinition, update: data })
    );
  };

  const handleDeleteDefinition = async (id: string) => {
    if (window.confirm(t("common.deleteConfirm"))) {
      const definition = assetDefinitions.find(
        (def: AssetDefinition) => def.id === id
      );
      await executeAsyncOperation(
        "delete asset definition",
        async () => {
          // Delete category assignments first
          const deleteAssignmentsAction = await (
            dispatch as ThunkDispatch<RootState, unknown, AnyAction>
          )(deleteAssetCategoryAssignmentsByAssetId(id));
          if (
            !deleteAssetCategoryAssignmentsByAssetId.fulfilled.match(
              deleteAssignmentsAction
            )
          ) {
            throw new Error("Failed to delete category assignments");
          }
          // Then delete the definition
          const deleteDefinitionAction = await (
            dispatch as ThunkDispatch<RootState, unknown, AnyAction>
          )(deleteAssetDefinition(id));
          if (!deleteAssetDefinition.fulfilled.match(deleteDefinitionAction)) {
            throw new Error("Failed to delete asset definition");
          }
        },
        undefined,
        JSON.stringify(definition || { id })
      );
    }
  };

  const handleAddPriceEntry = async (
    definitionId: string,
    entry: PriceEntry
  ) => {
    const definition = assetDefinitions.find(
      (def: AssetDefinition) => def.id === definitionId
    );
    await executeAsyncOperation(
      "add price entry",
      async () => {
        Logger.info(
          "Adding price entry to asset definition" +
            " - " +
            JSON.stringify({ definitionId, entry })
        );
        if (!definition) {
          Logger.error(`Asset definition not found: ${definitionId}`);
          return;
        }
        const updatedPriceHistory = addPriceToHistory(
          entry.price,
          definition.priceHistory || [],
          entry.date,
          "manual"
        );
        const updatedDefinition = {
          ...definition,
          priceHistory: updatedPriceHistory,
          currentPrice: entry.price,
          lastPriceUpdate: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await (dispatch as ThunkDispatch<RootState, unknown, AnyAction>)(
          updateAssetDefinition(updatedDefinition)
        );
        Logger.info(`Successfully added price entry to ${definition.fullName}`);
      },
      undefined,
      JSON.stringify({ definition, entry })
    );
  };

  const transactionsCache = useAppSelector((state: RootState) => state.transactions?.cache);
  const stockApiConfig = useAppSelector((state: RootState) => state.config.apis.stock);


  // Provider-agnostische Batch-Methode für aktuelle Aktienpreise
  const updateBatchCurrentPrices = async (definitions: AssetDefinition[]) => {
    return batchAssetUpdateService.updateBatchCurrentPrices(definitions);
  };

  /**
 * Processes batch results from worker services, dispatches updates, logs outcomes, and returns the number of successful updates.
 */
async function processBatchResults<T extends { fullName?: string; ticker?: string }>(
  results: BatchResult<T>[],
  _dispatch: ThunkDispatch<RootState, unknown, AnyAction>,
  updateAction: (def: T) => Promise<void | { type: string }>,
  loggerPrefix: string
): Promise<number> {
  const successfulResults = results.filter(r => r.success && r.updatedDefinition);
  for (const result of successfulResults) {
    const updatedDefinition = result.updatedDefinition!;
    if (updatedDefinition.fullName) {
      await updateAction(updatedDefinition);
      Logger.info(`${loggerPrefix} updated: ${updatedDefinition.fullName}`);
    } else {
      Logger.error(`${loggerPrefix} missing required fields for ${updatedDefinition.ticker}`);
    }
  }
  const failedResults = results.filter(r => !r.success);
  if (failedResults.length > 0) {
    Logger.warn(`${loggerPrefix} ${failedResults.length} updates failed:`);
    failedResults.forEach(r => Logger.warn(`- ${r.symbol}: ${r.error}`));
  }
  return successfulResults.length;
}

  const handleUpdateStockPrices = async () => {
    await executeAsyncOperation(
      "update stock prices",
      async () => {
        setIsUpdatingPrices(true);
        Logger.info(`Starting stock price update for asset definitions using ${stockApiConfig.selectedProvider === 'yahoo' ? 'main thread (Yahoo)' : 'worker'}`);
        const stockDefinitions = assetDefinitions.filter(
          (def: AssetDefinition) => def.type === "stock" && def.ticker
        );
        if (stockDefinitions.length === 0) {
          Logger.info("No stock definitions found to update");
          return;
        }
        let response;
        if (stockApiConfig.selectedProvider === 'yahoo') {
          response = await updateBatchCurrentPrices(stockDefinitions);
        } else {
          // Get apiKeys and selectedProvider from config (moved outside async callback)
          const { apiKeys, selectedProvider } = stockApiConfig;
          response = await marketDataWorkerService.stockPrice.updateBatch(stockDefinitions, apiKeys, selectedProvider);
        }
        if (response && response.type === 'error') {
          // Type guard for error property
          const errMsg = typeof (response as { error?: string }).error === 'string' ? (response as { error?: string }).error : 'Unknown error';
          throw new Error(errMsg);
        }
        if (response && response.type === 'batchResult' && response.results) {
          const filteredResults = response.results.filter(Boolean) as BatchResult<AssetDefinition>[];
          const numUpdated = await processBatchResults(
            filteredResults,
            dispatch as ThunkDispatch<RootState, unknown, AnyAction>,
            async (def) => (dispatch as ThunkDispatch<RootState, unknown, AnyAction>)(updateAssetDefinition(def)),
            'Stock price'
          );
          if (numUpdated > 0) {
            Logger.info(`Successfully updated stock prices for ${numUpdated} asset definitions`);
            const portfolioPositions = transactionsCache?.positions || [];
            const portfolioCacheId = transactionsCache?.id || "default";
            if (portfolioPositions.length > 0) {
              await (dispatch as ThunkDispatch<RootState, unknown, AnyAction>)(
                calculatePortfolioIntradayDataDirect({ portfolioCacheId })
              );
              Logger.info("Triggered portfolio intraday aggregation after price update");
            } else {
              Logger.warn("No portfolio positions found for intraday aggregation after price update");
            }
          } else {
            Logger.info("No stock definitions were updated");
          }
        }
        setIsUpdatingPrices(false);
      },
      () =>
        dispatch(
          showSuccessSnackbar(
            t(
              "assets.updateStockPricesSuccess",
              "Aktuelle Preise erfolgreich abgerufen"
            )
          )
        ),
      JSON.stringify(
        assetDefinitions.filter(
          (def: AssetDefinition) => def.type === "stock" && def.ticker
        )
      )
    );
  };



  // Helper for main-thread Yahoo batch history update (jetzt über batchAssetUpdateService)
  const updateBatchHistoryYahoo = async (definitions: AssetDefinition[], period?: TimeRangePeriod) => {
    // Delegiere an zentrale Service-Methode
    return batchAssetUpdateService.updateBatchHistoryData(definitions, period);
  };

  const handleUpdateHistoricalData = async (period?: TimeRangePeriod) => {
    await executeAsyncOperation(
      "update historical data",
      async () => {
        setIsUpdatingHistoricalData(true);
        Logger.info(
          `Starting historical data update for asset definitions with period: ${
            period || "default (30 days)"
          } using ${stockApiConfig.selectedProvider === 'yahoo' ? 'main thread (Yahoo)' : 'worker'} `
        );
        const stockDefinitions = assetDefinitions.filter(
          (def: AssetDefinition) => def.type === "stock" && def.ticker
        );
        if (stockDefinitions.length === 0) {
          Logger.info("No stock definitions found to update historical data");
          return;
        }
        let response;
        if (stockApiConfig.selectedProvider === 'yahoo') {
          response = await updateBatchHistoryYahoo(stockDefinitions, period);
        } else {
          response = await marketDataWorkerService.stockHistory.updateBatch(stockDefinitions, period, stockApiConfig.apiKeys, stockApiConfig.selectedProvider);
        }
        if (response && response.type === 'error') {
          // Type guard for error property
          const errMsg = typeof (response as { error?: string }).error === 'string' ? (response as { error?: string }).error : 'Unknown error';
          throw new Error(errMsg);
        }
        if (response && response.type === 'batchResult' && response.results) {
          const filteredResults = response.results.filter(Boolean) as BatchResult<AssetDefinition>[];
          const numUpdated = await processBatchResults(
            filteredResults,
            dispatch as ThunkDispatch<RootState, unknown, AnyAction>,
            async (def) => (dispatch as ThunkDispatch<RootState, unknown, AnyAction>)(updateAssetDefinition(def)),
            'Historical data'
          );
          if (numUpdated > 0) {
            Logger.info(`Successfully updated historical data for ${numUpdated} asset definitions`);
          } else {
            Logger.info("No historical data updates were needed for stock definitions");
          }
        }
        setIsUpdatingHistoricalData(false);
      },
      () =>
        dispatch(
          showSuccessSnackbar(
            t(
              "assets.updateHistoricalDataSuccess",
              "Historische Daten erfolgreich abgerufen"
            )
          )
        ),
      JSON.stringify(
        assetDefinitions.filter(
          (def: AssetDefinition) => def.type === "stock" && def.ticker
        )
      )
    );
  };




  // Helper for main-thread batch dividend update via batchAssetUpdateService (single source of truth)
  // Only one definition allowed!
  // Already defined above, so remove this duplicate.

  const handleFetchAllDividends = async () => {
    await executeAsyncOperation(
      "fetch all dividends",
      async () => {
        Logger.info("Starting dividend fetch for all eligible assets using main thread (batchAssetUpdateService)");
        const eligibleAssets = assetDefinitions.filter(
          (def: AssetDefinition) => def.type === "stock" && def.useDividendApi
        );
        if (eligibleAssets.length === 0) {
          Logger.info("No eligible assets found for dividend fetch");
          return;
        }
        Logger.info(`Found ${eligibleAssets.length} eligible assets for dividend update`);
        const response = await updateBatchDividendsMainThread(eligibleAssets, { interval: '1d', range: '2y' });
        if (response.type === 'error') {
          const errMsg = typeof response.error === 'string' ? response.error : 'Unknown error';
          throw new Error(errMsg);
        }
        if (response.type === 'batchResult' && Array.isArray(response.results)) {
          const batchResults: BatchResult<AssetDefinition>[] = response.results.filter(Boolean);
          const numUpdated = await processBatchResults<AssetDefinition>(
            batchResults,
            dispatch as ThunkDispatch<RootState, unknown, AnyAction>,
            async (def: AssetDefinition) => {
              if (def.dividendInfo) {
                const allowedFrequencies: DividendFrequency[] = ["monthly", "quarterly", "annually", "custom"];
                const rawFrequency = def.dividendInfo.frequency;
                const frequency: DividendFrequency =
                  allowedFrequencies.includes(rawFrequency as DividendFrequency)
                    ? (rawFrequency as DividendFrequency)
                    : "custom";
                def.dividendInfo = { ...def.dividendInfo, frequency };
              }
              return (dispatch as ThunkDispatch<RootState, unknown, AnyAction>)(updateAssetDefinition(def));
            },
            'Dividend'
          );
          Logger.info(`Successfully processed dividends for ${numUpdated} assets`);
        }
      },
      () =>
        dispatch(
          showSuccessSnackbar(
            t(
              "assets.fetchAllDividendsSuccess",
              "Dividenden-Daten für alle Assets erfolgreich abgerufen"
            )
          )
        ),
      JSON.stringify(assetDefinitions.filter((def: AssetDefinition) => def.type === "stock" && def.useDividendApi))
    );
  };

  // Asset type icon helper (must be in scope for JSX)
  const getAssetTypeIcon = (type: string) => {
    switch (type) {
      case "stock":
        return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case "real_estate":
        return <Building className="h-5 w-5 text-green-600" />;
      case "bond":
      case "cash":
        return <Banknote className="h-5 w-5 text-purple-600" />;
      case "crypto":
        return <Coins className="h-5 w-5 text-orange-600" />;
      default:
        return <Wallet className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <AssetDefinitionsView
      assetDefinitions={assetDefinitions}
      status={status}
      isApiEnabled={isApiEnabled}
      isDividendApiEnabled={isDividendApiEnabled}
      isAddingDefinition={isAddingDefinition}
      onSetIsAddingDefinition={setIsAddingDefinition}
      editingDefinition={editingDefinition}
      onSetEditingDefinition={setEditingDefinition}
      getAssetTypeIcon={getAssetTypeIcon}
      onAddDefinition={(data) => addDefinition(data, [])}
      onUpdateDefinition={(data) => updateDefinition(data, [])}
      onAddDefinitionWithCategories={addDefinition}
      onUpdateDefinitionWithCategories={updateDefinition}
      onDeleteDefinition={handleDeleteDefinition}
      onAddPriceEntry={handleAddPriceEntry}
      onFetchAllDividends={handleFetchAllDividends}
      onUpdateStockPrices={handleUpdateStockPrices}
      onUpdateHistoricalData={handleUpdateHistoricalData}
      isUpdatingPrices={isUpdatingPrices}
      isUpdatingHistoricalData={isUpdatingHistoricalData}
      onBack={onBack}
    />
  );
};

export default AssetDefinitionsContainer;
