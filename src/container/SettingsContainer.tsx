import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { setApiEnabled, setApiKey } from "../store/slices/apiConfigSlice";
import { clearAllAssets } from "../store/slices/assetsSlice";
import { clearAllLiabilities } from "../store/slices/liabilitiesSlice";
import { clearAllExpenses } from "../store/slices/expensesSlice";
import { clearAllIncome } from "../store/slices/incomeSlice";
import sqliteService, { StoreNames } from "../service/sqlLiteService";
import { analytics } from "../service/analytics";
import Logger from "../service/Logger/logger";
import SettingsView from "../view/SettingsView";
import { handleFileDownload } from "../service/helper/downloadFile";
import {
  setCurrency as setGlobalCurrency,
  getCurrency,
} from "../service/stockAPIService/utils/fetch";

const SettingsContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const apiConfig = useAppSelector((state) => state.apiConfig);

  const [exportStatus, setExportStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [importStatus, setImportStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [importError, setImportError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [currency, setCurrency] = useState<"EUR" | "USD">("EUR");
  const [clearDataStatus, setClearDataStatus] = useState<
    "idle" | "clearing" | "success"
  >("idle");
  const [isApiExpanded, setIsApiExpanded] = useState(false);
  const [isDataManagementExpanded, setIsDataManagementExpanded] =
    useState(false);
  const [isClearDataExpanded, setIsClearDataExpanded] = useState(false);

  // Load API key and currency on mount
  useEffect(() => {
    const storedApiKey = localStorage.getItem("finnhub_api_key");
    if (storedApiKey) {
      dispatch(setApiKey(storedApiKey));
    }

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
      analytics.trackEvent("settings_export_success");
    } catch (error) {
      Logger.error("Export failed" + " - " + JSON.stringify(error as Error));
      analytics.trackEvent("settings_export_error");
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
      analytics.trackEvent("settings_import_start");

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
          analytics.trackEvent("settings_import_success");

          // Refresh the page to reload all data
          Logger.info("Refreshing page to reload imported data");
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";
          Logger.error(`Import failed: ${errorMessage}`);
          analytics.trackEvent("settings_import_error", {
            error: "import_failed",
            message: errorMessage,
          });
          setImportStatus("error");
          setImportError(`Failed to import: ${errorMessage}`);
          setTimeout(() => setImportStatus("idle"), 5000);
        }
      };

      reader.onerror = (error) => {
        const errorMessage = "Failed to read the file";
        Logger.error(`FileReader error: ${JSON.stringify(error)}`);
        analytics.trackEvent("settings_import_error", { error: "file_read" });
        setImportStatus("error");
        setImportError(errorMessage);
        setTimeout(() => setImportStatus("idle"), 3000);
      };

      reader.readAsText(file);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to read the file";
      Logger.error(`Reading file failed: ${errorMessage}`);
      analytics.trackEvent("settings_import_error", { error: "file_read" });
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

  const handleApiKeyChange = async (newApiKey: string) => {
    setApiKeyStatus("saving");
    setApiKeyError(null);

    try {
      dispatch(setApiKey(newApiKey));
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

  const handleApiKeyRemove = () => {
    dispatch(setApiKey(null));
    dispatch(setApiEnabled(false));
  };

  const handleApiToggle = (enabled: boolean) => {
    dispatch(setApiEnabled(enabled));
  };

  const handleCurrencyChange = (newCurrency: "EUR" | "USD") => {
    setGlobalCurrency(newCurrency);
    setCurrency(newCurrency);
    Logger.info(`Currency changed to ${newCurrency}`);
    analytics.trackEvent("settings_currency_changed", {
      currency: newCurrency,
    });
  };

  // Handle clearing only financial data
  const handleClearPartialData = async () => {
    try {
      setClearDataStatus("clearing");
      Logger.infoService("Starting to clear financial data");

      // Clear Redux store first
      dispatch(clearAllAssets());
      dispatch(clearAllLiabilities());
      dispatch(clearAllExpenses());
      dispatch(clearAllIncome());

      // Get all items from each store to delete them from SQLite
      const stores: StoreNames[] = [
        "assets",
        "liabilities",
        "expenses",
        "income",
      ];
      for (const store of stores) {
        const items = await sqliteService.getAll(store);
        for (const item of items) {
          if (item.id) {
            await sqliteService.remove(store, item.id.toString());
          }
        }
      }

      // Clear specific localStorage entries related to financial data
      const currentStorage = localStorage.getItem('passiveIncomeCalculator');
      if (currentStorage) {
        const parsed = JSON.parse(currentStorage);
        parsed.assets = { items: [], status: 'idle', error: null };
        parsed.liabilities = { items: [], status: 'idle', error: null };
        parsed.expenses = { items: [], status: 'idle', error: null };
        parsed.income = { items: [], status: 'idle', error: null };
        localStorage.setItem('passiveIncomeCalculator', JSON.stringify(parsed));
      }

      setClearDataStatus("success");
      Logger.infoService("Financial data cleared successfully");
      analytics.trackEvent("settings_clear_partial_data");
      setTimeout(() => setClearDataStatus("idle"), 2000);
    } catch (error) {
      Logger.error("Failed to clear financial data" + JSON.stringify(error));
      setClearDataStatus("idle");
    }
  };

  // Handle clearing all data
  const handleClearAllData = async () => {
    try {
      setClearDataStatus("clearing");
      Logger.infoService("Starting to clear all data");

      // 1. Clear Redux store first
      dispatch(clearAllAssets());
      dispatch(clearAllLiabilities());
      dispatch(clearAllExpenses());
      dispatch(clearAllIncome());

      // 2. Clear all data from SQLite
      const stores: StoreNames[] = [
        "assets",
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

      // 4. Reset API key state
      dispatch(setApiKey(null));
      dispatch(setApiEnabled(false));

      setClearDataStatus("success");
      Logger.infoService("All data cleared successfully");
      analytics.trackEvent("settings_clear_all_data");
      
      // 5. Wait a bit and then reload the page to ensure clean state
      setTimeout(() => {
        Logger.infoService("Reloading page after data clear");
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      Logger.error("Failed to clear all data" + JSON.stringify(error));
      setClearDataStatus("idle");
    }
  };

  return (
    <SettingsView
      exportStatus={exportStatus}
      importStatus={importStatus}
      importError={importError}
      logs={logs}
      showLogs={showLogs}
      autoRefresh={autoRefresh}
      analytics={analytics}
      apiKey={apiConfig.apiKey || ""}
      apiKeyStatus={apiKeyStatus}
      apiKeyError={apiKeyError}
      currency={currency}
      clearDataStatus={clearDataStatus}
      isApiEnabled={apiConfig.isEnabled}
      isApiExpanded={isApiExpanded}
      isDataManagementExpanded={isDataManagementExpanded}
      isClearDataExpanded={isClearDataExpanded}
      onApiToggle={handleApiToggle}
      onApiExpandedChange={() => setIsApiExpanded(!isApiExpanded)}
      onDataManagementExpandedChange={() =>
        setIsDataManagementExpanded(!isDataManagementExpanded)
      }
      onClearDataExpandedChange={() =>
        setIsClearDataExpanded(!isClearDataExpanded)
      }
      onExportData={handleExportData}
      onImportData={handleImportData}
      onToggleLogs={() => setShowLogs(!showLogs)}
      onRefreshLogs={handleRefreshLogs}
      onExportLogs={handleExportLogs}
      onClearLogs={handleClearLogs}
      onAutoRefreshChange={setAutoRefresh}
      onApiKeyChange={handleApiKeyChange}
      onApiKeyRemove={handleApiKeyRemove}
      onCurrencyChange={handleCurrencyChange}
      onClearPartialData={handleClearPartialData}
      onClearAllData={handleClearAllData}
      formatLogEntry={formatLogEntry}
      getLogLevelColor={getLogLevelColor}
    />
  );
};

export default SettingsContainer;
