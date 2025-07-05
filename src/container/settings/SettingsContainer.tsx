import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { setApiEnabled, setDividendApiEnabled, setApiKey, setSelectedProvider, setSelectedDiviProvider, setDividendApiKey } from "@/store/slices/apiConfigSlice";
import { setDashboardMode, loadDashboardSettingsFromStorage } from "@/store/slices/dashboardSettingsSlice";
import { clearAllTransactions } from "@/store/slices/transactionsSlice";
import { clearAllExpenses } from "@/store/slices/expensesSlice";
import { clearAllIncome } from "@/store/slices/incomeSlice";
import { clearAllAssetCategories } from "@/store/slices/assetCategoriesSlice";
import sqliteService from "@/service/infrastructure/sqlLiteService";
import { StoreNames } from "@/service/infrastructure/sqlLiteService/interfaces/ISQLiteService";
import Logger from "@/service/shared/logging/Logger/logger";
import SettingsView from "@/view/settings/general/SettingsView";
import { handleFileDownload } from "@/service/shared/utilities/helper/downloadFile";
import {
  setCurrency as setGlobalCurrency,
  getCurrency,
} from "@/service/domain/assets/market-data/stockAPIService/utils/fetch";
import deleteDataService from '@/service/application/workflows/deleteDataService';
import { t } from "i18next";
import { ConfirmationDialogState } from "@/ui/dialog/types";
import { showInfoSnackbar, showSuccessSnackbar, showErrorSnackbar } from '@/store/slices/snackbarSlice';
import cacheRefreshService from '@/service/application/orchestration/cacheRefreshService';
import { clearAllLiabilities } from "@/store/slices/liabilitiesSlice";
import { StockAPIProvider } from "@/types/shared";
import { DashboardMode } from "@/types/shared/analytics";
// Type aliases for operation statuses
type ClearOperationStatus = "idle" | "clearing" | "success";
type AsyncOperationStatus = "idle" | "loading" | "success" | "error";
type ApiKeyStatus = "idle" | "saving" | "success" | "error";

const SettingsContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const apiConfig = useAppSelector((state) => state.apiConfig);
  const dashboardSettings = useAppSelector((state) => state.dashboardSettings);

  const [exportStatus, setExportStatus] = useState<AsyncOperationStatus>("idle");
  const [importStatus, setImportStatus] = useState<AsyncOperationStatus>("idle");
  const [importError, setImportError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState<ApiKeyStatus>("idle");
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [currency, setCurrency] = useState<"EUR" | "USD">("EUR");

  // Clear data operation states
  const [clearAssetDefinitionsStatus, setClearAssetDefinitionsStatus] = useState<ClearOperationStatus>("idle");
  const [clearPriceHistoryStatus, setClearPriceHistoryStatus] = useState<ClearOperationStatus>("idle");
  const [clearAssetTransactionsStatus, setClearAssetTransactionsStatus] = useState<ClearOperationStatus>("idle");
  const [clearDebtsStatus, setClearDebtsStatus] = useState<ClearOperationStatus>("idle");
  const [clearExpensesStatus, setClearExpensesStatus] = useState<ClearOperationStatus>("idle");
  const [clearIncomeStatus, setClearIncomeStatus] = useState<ClearOperationStatus>("idle");
  const [clearAllDataStatus, setClearAllDataStatus] = useState<ClearOperationStatus>("idle");
  const [clearReduxCacheStatus, setClearReduxCacheStatus] = useState<ClearOperationStatus>("idle");
  const [clearDividendHistoryStatus, setClearDividendHistoryStatus] = useState<ClearOperationStatus>("idle");

  // Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState<ConfirmationDialogState>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {}
  });

  // Helper to show confirmation dialog
  const showConfirmDialog = (title: string, description: string, onConfirm: () => void) => {
    setConfirmDialog({
      isOpen: true,
      title,
      description,
      onConfirm
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  };

  // Load API keys and currency on mount
  useEffect(() => {
    // API keys are already loaded from localStorage in the initial state
    // We just need to load the currency
    const storedCurrency = getCurrency();
    setCurrency(storedCurrency);
    
    // Load dashboard settings from localStorage
    dispatch(loadDashboardSettingsFromStorage());
  }, [dispatch]);

  const loadLogs = () => {
    const storedLogs = localStorage.getItem("app_logs");
    if (storedLogs) {
      setLogs(JSON.parse(storedLogs));
    }
  };

  // Load logs on component mount and periodically if auto-refresh is enabled
  useEffect(() => {
    loadLogs();

    if (autoRefresh) {
      const interval = setInterval(loadLogs, 2000); // Refresh every 2 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const handleRefreshLogs = loadLogs;

  // Neue Exportfunktion mit Store-Auswahl
  const handleExportData = async (storeNames: string[]) => {
    try {
      Logger.info("Data export started");
      setExportStatus("loading");
      // StoreNames korrekt typisieren
      const data = await sqliteService.exportData(storeNames as StoreNames[]);
      handleFileDownload(data);
      setExportStatus("success");
      setTimeout(() => setExportStatus("idle"), 2000);
      Logger.info("Data export completed successfully");
    } catch (error) {
      Logger.error("Export failed" + " - " + JSON.stringify(error as Error));
      setExportStatus("error");
      setTimeout(() => setExportStatus("idle"), 2000);
    }
  };

  const handleImportData = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportStatus("loading");
    setImportError(null);

    try {
      Logger.info("Starting data import");

      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const fileContent = e.target?.result as string;
          Logger.info(`File content length: ${fileContent.length}`);
          Logger.info(
            `File content preview: ${fileContent.substring(0, 200)}...`
          );

          // Validate JSON format first
          let parsedData;
          try {
            parsedData = JSON.parse(fileContent);
            Logger.info(
              `Parsed JSON successfully. Keys: ${Object.keys(parsedData)}`
            );
          } catch (parseError) {
            Logger.error(
              `JSON parse error: ${
                parseError instanceof Error
                  ? parseError.message
                  : String(parseError)
              }`
            );
            throw new Error(
              "Invalid JSON file format. Please check your backup file."
            );
          }

          await sqliteService.importData(fileContent);
          setImportStatus("success");
          setTimeout(() => setImportStatus("idle"), 2000);

          Logger.info("Data import completed successfully");

          // Refresh the page to reload all data
          Logger.info("Refreshing page to reload imported data");
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";
          Logger.error(`Import failed: ${errorMessage}`);
          setImportStatus("error");
          setImportError(`Failed to import: ${errorMessage}`);
          setTimeout(() => setImportStatus("idle"), 5000);
        }
      };

      reader.onerror = (error) => {
        const errorMessage = "Failed to read the file";
        Logger.error(`FileReader error: ${JSON.stringify(error)}`);
        setImportStatus("error");
        setImportError(errorMessage);
        setTimeout(() => setImportStatus("idle"), 3000);
      };

      reader.readAsText(file);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to read the file";
      Logger.error(`Reading file failed: ${errorMessage}`);
      setImportStatus("error");
      setImportError(errorMessage);
      setTimeout(() => setImportStatus("idle"), 3000);
    } finally {
      // Reset the input
      event.target.value = "";
    }
  };

  const handleClearLogs = () => {
    if (window.confirm("Are you sure you want to clear all debug logs?")) {
      Logger.deleteLogs();
      setLogs([]);
    }
  };

  const handleExportLogs = () => {
    Logger.exportLogs();
  };

  const formatLogEntry = (logEntry: string) => {
    const parts = logEntry.split("] ");
    if (parts.length >= 2) {
      const timestamp = parts[0].replace(/^\w+\s+/, ""); // Remove day name
      const message = parts.slice(1).join("] ");
      return { timestamp, message };
    }
    return { timestamp: "", message: logEntry };
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case "error":
        return "text-red-600 dark:text-red-400";
      case "warning":
        return "text-yellow-600 dark:text-yellow-400";
      case "info":
        return "text-blue-600 dark:text-blue-400";
      case "service":
        return "text-green-600 dark:text-green-400";
      case "redux":
        return "text-purple-600 dark:text-purple-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const handleApiKeyChange = async (provider: StockAPIProvider, newApiKey: string) => {
    setApiKeyStatus("saving");
    setApiKeyError(null);

    try {
      dispatch(setApiKey({ provider, apiKey: newApiKey }));
      dispatch(setApiEnabled(true));
      setApiKeyStatus("success");
      dispatch(showSuccessSnackbar(t("settings.snackbar.apiKeySaved") || "API-Schlüssel gespeichert."));

    } catch (error) {
      setApiKeyError("Failed to save API key");
      setApiKeyStatus("error");
      dispatch(showErrorSnackbar(t("settings.snackbar.apiKeySaveError") || "Fehler beim Speichern des API-Schlüssels."));

      Logger.error("Failed to save API key" + JSON.stringify(error));
    }
  };

  const handleApiKeyRemove = (provider: StockAPIProvider) => {
    dispatch(setApiKey({ provider, apiKey: null }));
    if (provider === apiConfig.selectedProvider) {
      const hasOtherConfiguredProvider = Object.entries(apiConfig.apiKeys)
        .some(([key, value]) => key !== provider && value);
      if (!hasOtherConfiguredProvider) {
        dispatch(setApiEnabled(false));
      }
    }
    dispatch(showSuccessSnackbar(t("settings.snackbar.apiKeyRemoved") || "API-Schlüssel entfernt."));
  };

  const handleProviderChange = (provider: StockAPIProvider) => {
    dispatch(setSelectedProvider(provider));
    dispatch(showSuccessSnackbar(t("settings.snackbar.providerChanged") || "API-Provider geändert."));
  };

  const handleCurrencyChange = (newCurrency: "EUR" | "USD") => {
    setGlobalCurrency(newCurrency);
    setCurrency(newCurrency);
    Logger.info(`Currency changed to ${newCurrency}`);
    if (newCurrency === "EUR") {
      dispatch(showInfoSnackbar(t("settings.snackbar.eurConversionInfo")));
    }
  };

  const handleDashboardModeChange = (mode: DashboardMode) => {
    dispatch(setDashboardMode(mode));
    Logger.info(`Dashboard mode changed to ${mode}`);
  };

  // Handle clearing all data
  const handleClearAllData = async () => {
    try {
      setClearAllDataStatus("clearing");
      Logger.infoService("Starting to clear all data");

      // 1. Clear Redux store first
      dispatch(clearAllTransactions());
      dispatch(clearAllLiabilities());
      dispatch(clearAllExpenses());
      dispatch(clearAllIncome());
      dispatch(clearAllAssetCategories());

      // 2. Clear all data from SQLite
      const stores: StoreNames[] = [
        "transactions",
        "assetDefinitions",
        "assetCategories",
        "assetCategoryOptions",
        "assetCategoryAssignments",
        "liabilities",
        "expenses",
        "income",
        "exchangeRates",
      ];
      for (const store of stores) {
        try {
          const items = await sqliteService.getAll(store);
          for (const item of items) {
            if (item.id) {
              await sqliteService.remove(store, item.id.toString());
            }
          }
          Logger.infoService(`Cleared ${items.length} items from ${store}`);
        } catch (error) {
          Logger.error(`Failed to clear ${store}: ${JSON.stringify(error)}`);
        }
      }

      // 3. Clear ALL localStorage (not just our app data)
      localStorage.clear();
      Logger.infoService("LocalStorage cleared completely");

      // 4. Reset API key state - clear all providers
      const providers: StockAPIProvider[] = [
        StockAPIProvider.FINNHUB, 
        StockAPIProvider.YAHOO, 
        StockAPIProvider.ALPHA_VANTAGE
      ];
      providers.forEach((provider) => {
        dispatch(setApiKey({ provider, apiKey: null }));
      });
      dispatch(setApiEnabled(false));

      setClearAllDataStatus("success");
      Logger.infoService("All data cleared successfully");
      dispatch(showSuccessSnackbar(t("settings.snackbar.allDataCleared") || "Alle Daten erfolgreich gelöscht."));
      
      // 5. Wait a bit and then reload the page to ensure clean state
      setTimeout(() => {
        Logger.infoService("Reloading page after data clear");
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      Logger.error("Failed to clear all data" + JSON.stringify(error));
      setClearAllDataStatus("idle");
      dispatch(showErrorSnackbar(t("settings.snackbar.allDataClearError") || "Fehler beim Löschen aller Daten."));
    }
  };

  // Handle clearing only asset definitions
  const handleClearAssetDefinitions = async () => {
    try {
      setClearAssetDefinitionsStatus("clearing");
      await deleteDataService.clearAssetDefinitions();
      setClearAssetDefinitionsStatus("success");
      dispatch(showSuccessSnackbar(t("settings.snackbar.assetDefinitionsCleared") || "Asset-Definitionen gelöscht."));
      setTimeout(() => setClearAssetDefinitionsStatus("idle"), 2000);
    } catch (error) {
      Logger.error("Failed to clear asset definitions" + JSON.stringify(error));
      setClearAssetDefinitionsStatus("idle");
      dispatch(showErrorSnackbar(t("settings.snackbar.assetDefinitionsClearError") || "Fehler beim Löschen der Asset-Definitionen."));
    }
  };

  // Handle clearing only asset price history
  const handleClearPriceHistory = async () => {
    try {
      setClearPriceHistoryStatus("clearing");
      await deleteDataService.clearPriceHistory();
      setClearPriceHistoryStatus("success");
      dispatch(showSuccessSnackbar(t("settings.snackbar.priceHistoryCleared") || "Kursverlauf gelöscht."));
      setTimeout(() => setClearPriceHistoryStatus("idle"), 2000);
    } catch (error) {
      Logger.error("Failed to clear price history" + JSON.stringify(error));
      setClearPriceHistoryStatus("idle");
      dispatch(showErrorSnackbar(t("settings.snackbar.priceHistoryClearError") || "Fehler beim Löschen des Kursverlaufs."));
    }
  };

  // Handle clearing only asset transactions
  const handleClearAssetTransactions = async () => {
    try {
      setClearAssetTransactionsStatus("clearing");
      await deleteDataService.clearAssetTransactions();
      setClearAssetTransactionsStatus("success");
      dispatch(showSuccessSnackbar(t("settings.snackbar.assetTransactionsCleared") || "Transaktionen gelöscht."));
      setTimeout(() => setClearAssetTransactionsStatus("idle"), 2000);
    } catch (error) {
      Logger.error("Failed to clear asset transactions" + JSON.stringify(error));
      setClearAssetTransactionsStatus("idle");
      dispatch(showErrorSnackbar(t("settings.snackbar.assetTransactionsClearError") || "Fehler beim Löschen der Transaktionen."));
    }
  };

  // Handle clearing only debts
  const handleClearDebts = async () => {
    try {
      setClearDebtsStatus("clearing");
      await deleteDataService.clearDebts();
      setClearDebtsStatus("success");
      dispatch(showSuccessSnackbar(t("settings.snackbar.debtsCleared") || "Schulden gelöscht."));
      setTimeout(() => setClearDebtsStatus("idle"), 2000);
    } catch (error) {
      Logger.error("Failed to clear debts" + JSON.stringify(error));
      setClearDebtsStatus("idle");
      dispatch(showErrorSnackbar(t("settings.snackbar.debtsClearError") || "Fehler beim Löschen der Schulden."));
    }
  };

  // Handle clearing only expenses
  const handleClearExpenses = async () => {
    try {
      setClearExpensesStatus("clearing");
      await deleteDataService.clearExpenses();
      setClearExpensesStatus("success");
      dispatch(showSuccessSnackbar(t("settings.snackbar.expensesCleared") || "Ausgaben gelöscht."));
      setTimeout(() => setClearExpensesStatus("idle"), 2000);
    } catch (error) {
      Logger.error("Failed to clear expenses" + JSON.stringify(error));
      setClearExpensesStatus("idle");
      dispatch(showErrorSnackbar(t("settings.snackbar.expensesClearError") || "Fehler beim Löschen der Ausgaben."));
    }
  };

  // Handle clearing only income
  const handleClearIncome = async () => {
    try {
      setClearIncomeStatus("clearing");
      await deleteDataService.clearIncome();
      setClearIncomeStatus("success");
      dispatch(showSuccessSnackbar(t("settings.snackbar.incomeCleared") || "Einnahmen gelöscht."));
      setTimeout(() => setClearIncomeStatus("idle"), 2000);
    } catch (error) {
      Logger.error("Failed to clear income" + JSON.stringify(error));
      setClearIncomeStatus("idle");
      dispatch(showErrorSnackbar(t("settings.snackbar.incomeClearError") || "Fehler beim Löschen der Einnahmen."));
    }
  };

  // Handle clearing Redux cache only
  const handleClearReduxCache = async () => {
    try {
      setClearReduxCacheStatus("clearing");
      Logger.info("Starting to clear Redux cache");

      // Nutze deleteDataService für Redux-Cache + LocalStorage
      await deleteDataService.clearReduxCacheOnly(dispatch);
      
      Logger.info("Redux cache cleared successfully");
      setClearReduxCacheStatus("success");
      dispatch(showSuccessSnackbar(t("settings.snackbar.reduxCacheCleared") || "Redux-Cache gelöscht."));
      setTimeout(() => setClearReduxCacheStatus("idle"), 2000);
    } catch (error) {
      Logger.error("Failed to clear Redux cache: " + JSON.stringify(error));
      setClearReduxCacheStatus("idle");
      dispatch(showErrorSnackbar(t("settings.snackbar.reduxCacheClearError") || "Fehler beim Löschen des Redux-Caches."));
    }
  };

  // Handle clear operations with confirmation dialogs
  const handleClearAssetDefinitionsWithConfirm = () => {
    showConfirmDialog(
      t("settings.clearAssetDefinitionsTitle"),
      t("settings.clearAssetDefinitionsConfirm"),
      handleClearAssetDefinitions
    );
  };

  const handleClearPriceHistoryWithConfirm = () => {
    showConfirmDialog(
      t("settings.clearPriceHistoryTitle"),
      t("settings.clearPriceHistoryConfirm"),
      handleClearPriceHistory
    );
  };

  const handleClearAssetTransactionsWithConfirm = () => {
    showConfirmDialog(
      t("settings.clearAssetTransactionsTitle"),
      t("settings.clearAssetTransactionsConfirm"),
      handleClearAssetTransactions
    );
  };

  const handleClearDebtsWithConfirm = () => {
    showConfirmDialog(
      t("settings.clearDebtsTitle"),
      t("settings.clearDebtsConfirm"),
      handleClearDebts
    );
  };

  const handleClearExpensesWithConfirm = () => {
    showConfirmDialog(
      t("settings.clearExpensesTitle"),
      t("settings.clearExpensesConfirm"),
      handleClearExpenses
    );
  };

  const handleClearIncomeWithConfirm = () => {
    showConfirmDialog(
      t("settings.clearIncomeTitle"),
      t("settings.clearIncomeConfirm"),
      handleClearIncome
    );
  };

  const handleClearReduxCacheWithConfirm = () => {
    showConfirmDialog(
      t("settings.clearReduxCacheTitle"),
      t("settings.clearReduxCacheConfirm"),
      handleClearReduxCache
    );
  };

  const handleClearAllDataWithConfirm = () => {
    showConfirmDialog(
      t("settings.clearAllDataTitle"),
      t("settings.clearAllDataConfirm"),
      handleClearAllData
    );
  };

  // --- Dividend API Provider/Key Handling ---
  const handleDiviApiKeyChange = async (provider: string, newApiKey: string) => {
    setApiKeyStatus("saving");
    setApiKeyError(null);
    try {
      dispatch(setDividendApiKey({ provider, apiKey: newApiKey }));
      setApiKeyStatus("success");
      dispatch(showSuccessSnackbar(t("settings.snackbar.diviApiKeySaved") || "Dividend-API-Schlüssel gespeichert."));

    } catch (error) {
      setApiKeyError("Failed to save Dividend API key");
      setApiKeyStatus("error");
      dispatch(showErrorSnackbar(t("settings.snackbar.diviApiKeySaveError") || "Fehler beim Speichern des Dividend-API-Schlüssels."));

      Logger.errorStack("Failed to save Dividend API key", error instanceof Error ? error : new Error(String(error)));
    }
  };

  const handleDiviApiKeyRemove = (provider: string) => {
    dispatch(setDividendApiKey({ provider, apiKey: "" }));
    dispatch(showSuccessSnackbar(t("settings.snackbar.diviApiKeyRemoved") || "Dividend-API-Schlüssel entfernt."));
  };

  const handleDiviProviderChange = (provider: string) => {
    dispatch(setSelectedDiviProvider(provider));
    dispatch(showSuccessSnackbar(t("settings.snackbar.diviProviderChanged") || "Dividend-Provider geändert."));
  };

  const handleApiToggle = (enabled: boolean) => {
    dispatch(setApiEnabled(enabled));
    if (enabled) {
      dispatch(showSuccessSnackbar(t("settings.snackbar.apiEnabled") || "API aktiviert."));
    } else {
      dispatch(showSuccessSnackbar(t("settings.snackbar.apiDisabled") || "API deaktiviert."));
    }
  };

  const handleDividendApiToggle = (enabled: boolean) => {
    dispatch(setDividendApiEnabled(enabled));
    if (enabled) {
      dispatch(showSuccessSnackbar(t("settings.snackbar.dividendApiEnabled") || "Dividenden-API aktiviert."));
    } else {
      dispatch(showSuccessSnackbar(t("settings.snackbar.dividendApiDisabled") || "Dividenden-API deaktiviert."));
    }
  };

  // Handle clearing only dividend history
  const handleClearDividendHistory = async () => {
    try {
      setClearDividendHistoryStatus("clearing");
      Logger.info("Starte das Löschen des Dividendenverlaufs aller AssetDefinitions");
      const assetDefs = await sqliteService.getAll("assetDefinitions");
      let updatedCount = 0;
      for (const def of assetDefs) {
        let changed = false;
        if (def.dividendHistory && def.dividendHistory.length > 0) {
          def.dividendHistory = [];
          changed = true;
        }
        if (def.dividendGrowthPast3Y !== undefined) {
          def.dividendGrowthPast3Y = undefined;
          changed = true;
        }
        if (def.dividendForecast3Y && def.dividendForecast3Y.length > 0) {
          def.dividendForecast3Y = undefined;
          changed = true;
        }
        if (changed && def.id) {
          await sqliteService.update("assetDefinitions", def);
          updatedCount++;
        }
      }
      setClearDividendHistoryStatus("success");
      Logger.info(`Dividendenverlauf bei ${updatedCount} Assets gelöscht.`);
      dispatch(showSuccessSnackbar(t("settings.snackbar.dividendHistoryCleared") || "Dividendenverlauf gelöscht."));
      setTimeout(() => setClearDividendHistoryStatus("idle"), 2000);
    } catch (error) {
      Logger.error("Fehler beim Löschen des Dividendenverlaufs: " + JSON.stringify(error));
      setClearDividendHistoryStatus("idle");
      dispatch(showErrorSnackbar(t("settings.snackbar.dividendHistoryClearError") || "Fehler beim Löschen des Dividendenverlaufs."));
    }
  };

  const handleClearDividendHistoryWithConfirm = () => {
    showConfirmDialog(
      t("settings.clearDividendHistoryTitle"),
      t("settings.clearDividendHistoryConfirm"),
      handleClearDividendHistory
    );
  };

  return (
    <SettingsView
      exportStatus={exportStatus}
      importStatus={importStatus}
      importError={importError}
      logs={logs}
      showLogs={showLogs}
      autoRefresh={autoRefresh}
      selectedProvider={apiConfig.selectedProvider}
      apiKeys={apiConfig.apiKeys}
      apiKeyStatus={apiKeyStatus}
      apiKeyError={apiKeyError}
      currency={currency}
      clearAssetDefinitionsStatus={clearAssetDefinitionsStatus}
      clearPriceHistoryStatus={clearPriceHistoryStatus}
      clearAssetTransactionsStatus={clearAssetTransactionsStatus}
      clearDebtsStatus={clearDebtsStatus}
      clearExpensesStatus={clearExpensesStatus}
      clearIncomeStatus={clearIncomeStatus}
      clearAllDataStatus={clearAllDataStatus}
      clearReduxCacheStatus={clearReduxCacheStatus}
      clearDividendHistoryStatus={clearDividendHistoryStatus}
      isApiEnabled={apiConfig.isEnabled}
      isDividendApiEnabled={apiConfig.isDividendApiEnabled}
      dashboardMode={dashboardSettings.mode}
      selectedDiviProvider={apiConfig.selectedDiviProvider}
      dividendApiKey={apiConfig.dividendApiKey}
      onApiToggle={handleApiToggle}
      onDividendApiToggle={handleDividendApiToggle}
      onExportData={handleExportData}
      onImportData={handleImportData}
      onToggleLogs={() => setShowLogs(!showLogs)}
      onRefreshLogs={handleRefreshLogs}
      onExportLogs={handleExportLogs}
      onClearLogs={handleClearLogs}
      onAutoRefreshChange={setAutoRefresh}
      onApiKeyChange={handleApiKeyChange}
      onApiKeyRemove={handleApiKeyRemove}
      onProviderChange={handleProviderChange}
      onCurrencyChange={handleCurrencyChange}
      onDashboardModeChange={handleDashboardModeChange}
      onClearAllData={handleClearAllDataWithConfirm}
      onClearAssetDefinitions={handleClearAssetDefinitionsWithConfirm}
      onClearPriceHistory={handleClearPriceHistoryWithConfirm}
      onClearAssetTransactions={handleClearAssetTransactionsWithConfirm}
      onClearDebts={handleClearDebtsWithConfirm}
      onClearExpenses={handleClearExpensesWithConfirm}
      onClearIncome={handleClearIncomeWithConfirm}
      onClearReduxCache={handleClearReduxCacheWithConfirm}
      onDiviApiKeyChange={handleDiviApiKeyChange}
      onDiviApiKeyRemove={handleDiviApiKeyRemove}
      onDiviProviderChange={handleDiviProviderChange}
      onClearDividendHistory={handleClearDividendHistoryWithConfirm}
      onPortfolioHistoryRefresh={() => cacheRefreshService.refreshAllCaches()}
      confirmDialog={confirmDialog}
      onCloseConfirmDialog={closeConfirmDialog}
      formatLogEntry={formatLogEntry}
      getLogLevelColor={getLogLevelColor}
    />
  );
};

export default SettingsContainer;
