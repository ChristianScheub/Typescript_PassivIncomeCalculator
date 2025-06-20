import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { setApiEnabled, setApiKey, setSelectedProvider, StockAPIProvider } from "../../store/slices/apiConfigSlice";
import { clearAllTransactions } from "../../store/slices/transactionsSlice";
import { clearAllLiabilities } from "../../store/slices/liabilitiesSlice";
import { clearAllExpenses } from "../../store/slices/expensesSlice";
import { clearAllIncome } from "../../store/slices/incomeSlice";
import { clearAllAssetCategories } from "../../store/slices/assetCategoriesSlice";
import sqliteService, { StoreNames } from "../../service/infrastructure/sqlLiteService";
import Logger from "../../service/shared/logging/Logger/logger";
import SettingsView from "../../view/settings/general/SettingsView";
import { handleFileDownload } from "../../service/shared/utilities/helper/downloadFile";
import {
  setCurrency as setGlobalCurrency,
  getCurrency,
} from "../../service/domain/assets/market-data/stockAPIService/utils/fetch";
import deleteDataService from "../../service/application/workflows/deleteDataService";
import { t } from "i18next";
import { ConfirmationDialogState } from "../../ui/dialog/types";

// Type aliases for operation statuses
type ClearOperationStatus = "idle" | "clearing" | "success";
type AsyncOperationStatus = "idle" | "loading" | "success" | "error";
type ApiKeyStatus = "idle" | "saving" | "success" | "error";

const SettingsContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const apiConfig = useAppSelector((state) => state.apiConfig);

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
  }, []);

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

  const handleExportData = async () => {
    try {
      Logger.info("Data export started");

      setExportStatus("loading");
      const data = await sqliteService.exportData();
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
      setTimeout(() => setApiKeyStatus("idle"), 2000);
    } catch (error) {
      setApiKeyError("Failed to save API key");
      setApiKeyStatus("error");
      setTimeout(() => setApiKeyStatus("idle"), 2000);
      Logger.error("Failed to save API key" + JSON.stringify(error));
    }
  };

  const handleApiKeyRemove = (provider: StockAPIProvider) => {
    dispatch(setApiKey({ provider, apiKey: null }));
    
    // If this was the selected provider and no key remains, disable API or switch provider
    if (provider === apiConfig.selectedProvider) {
      const hasOtherConfiguredProvider = Object.entries(apiConfig.apiKeys)
        .some(([key, value]) => key !== provider && value);
      
      if (!hasOtherConfiguredProvider) {
        dispatch(setApiEnabled(false));
      }
    }
  };

  const handleProviderChange = (provider: StockAPIProvider) => {
    dispatch(setSelectedProvider(provider));
  };

  const handleApiToggle = (enabled: boolean) => {
    dispatch(setApiEnabled(enabled));
  };

  const handleCurrencyChange = (newCurrency: "EUR" | "USD") => {
    setGlobalCurrency(newCurrency);
    setCurrency(newCurrency);
    Logger.info(`Currency changed to ${newCurrency}`);
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
      
      // 5. Wait a bit and then reload the page to ensure clean state
      setTimeout(() => {
        Logger.infoService("Reloading page after data clear");
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      Logger.error("Failed to clear all data" + JSON.stringify(error));
      setClearAllDataStatus("idle");
    }
  };

  // Handle clearing only asset definitions
  const handleClearAssetDefinitions = async () => {
    try {
      setClearAssetDefinitionsStatus("clearing");
      await deleteDataService.clearAssetDefinitions();
      setClearAssetDefinitionsStatus("success");
      setTimeout(() => setClearAssetDefinitionsStatus("idle"), 2000);
    } catch (error) {
      Logger.error("Failed to clear asset definitions" + JSON.stringify(error));
      setClearAssetDefinitionsStatus("idle");
    }
  };

  // Handle clearing only asset price history
  const handleClearPriceHistory = async () => {
    try {
      setClearPriceHistoryStatus("clearing");
      await deleteDataService.clearPriceHistory();
      setClearPriceHistoryStatus("success");
      setTimeout(() => setClearPriceHistoryStatus("idle"), 2000);
    } catch (error) {
      Logger.error("Failed to clear price history" + JSON.stringify(error));
      setClearPriceHistoryStatus("idle");
    }
  };

  // Handle clearing only asset transactions
  const handleClearAssetTransactions = async () => {
    try {
      setClearAssetTransactionsStatus("clearing");
      await deleteDataService.clearAssetTransactions();
      setClearAssetTransactionsStatus("success");
      setTimeout(() => setClearAssetTransactionsStatus("idle"), 2000);
    } catch (error) {
      Logger.error("Failed to clear asset transactions" + JSON.stringify(error));
      setClearAssetTransactionsStatus("idle");
    }
  };

  // Handle clearing only debts
  const handleClearDebts = async () => {
    try {
      setClearDebtsStatus("clearing");
      await deleteDataService.clearDebts();
      setClearDebtsStatus("success");
      setTimeout(() => setClearDebtsStatus("idle"), 2000);
    } catch (error) {
      Logger.error("Failed to clear debts" + JSON.stringify(error));
      setClearDebtsStatus("idle");
    }
  };

  // Handle clearing only expenses
  const handleClearExpenses = async () => {
    try {
      setClearExpensesStatus("clearing");
      await deleteDataService.clearExpenses();
      setClearExpensesStatus("success");
      setTimeout(() => setClearExpensesStatus("idle"), 2000);
    } catch (error) {
      Logger.error("Failed to clear expenses" + JSON.stringify(error));
      setClearExpensesStatus("idle");
    }
  };

  // Handle clearing only income
  const handleClearIncome = async () => {
    try {
      setClearIncomeStatus("clearing");
      await deleteDataService.clearIncome();
      setClearIncomeStatus("success");
      setTimeout(() => setClearIncomeStatus("idle"), 2000);
    } catch (error) {
      Logger.error("Failed to clear income" + JSON.stringify(error));
      setClearIncomeStatus("idle");
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

  const handleClearAllDataWithConfirm = () => {
    showConfirmDialog(
      t("settings.clearAllDataTitle"),
      t("settings.clearAllDataConfirm"),
      handleClearAllData
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
      isApiEnabled={apiConfig.isEnabled}
      onApiToggle={handleApiToggle}
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
      onClearAllData={handleClearAllDataWithConfirm}
      onClearAssetDefinitions={handleClearAssetDefinitionsWithConfirm}
      onClearPriceHistory={handleClearPriceHistoryWithConfirm}
      onClearAssetTransactions={handleClearAssetTransactionsWithConfirm}
      onClearDebts={handleClearDebtsWithConfirm}
      onClearExpenses={handleClearExpensesWithConfirm}
      onClearIncome={handleClearIncomeWithConfirm}
      confirmDialog={confirmDialog}
      onCloseConfirmDialog={closeConfirmDialog}
      formatLogEntry={formatLogEntry}
      getLogLevelColor={getLogLevelColor}
    />
  );
};

export default SettingsContainer;
