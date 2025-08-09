import React, { useState, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { 
  setStockApiEnabled, 
  setDividendApiEnabled, 
  setStockApiKey, 
  setStockApiProvider, 
  setDividendApiProvider, 
  setDividendApiKey,
  setAssetFocusMode,
  setDeveloperModeEnabled
} from "@/store/slices/configSlice";
import sqliteService from "@/service/infrastructure/sqlLiteService";
import Logger from "@/service/shared/logging/Logger/logger";
import SettingsView from "@/view/settings/general/SettingsView";
import { handleFileDownload } from "@/service/shared/utilities/helper/downloadFile";
import {
  setCurrency as setGlobalCurrency,
  getCurrency,
} from "@/service/domain/assets/market-data/stockAPIService/utils/fetch";
import deleteDataService from '@/service/application/workflows/deleteDataService';
import { t } from "i18next";
import { ConfirmationDialogState } from '@/ui/portfolioHub/dialog/types';
import { showInfoSnackbar, showSuccessSnackbar, showErrorSnackbar } from '@/store/slices/ui';
import cacheRefreshService from '@/service/application/orchestration/cacheRefreshService';
import { StockAPIProvider, DividendApiProvider } from "@/types/shared/base/enums";
import { StoreNames } from "@/types/domains/database";
import { verifyHash } from "@/utils/crypto";
import { developerPasswordHash } from "@/config/featureFlags";
// Type aliases for operation statuses
type ClearOperationStatus = "idle" | "clearing" | "success";
type AsyncOperationStatus = "idle" | "loading" | "success" | "error";
type ApiKeyStatus = "idle" | "saving" | "success" | "error";

const SettingsContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const stockApiConfig = useAppSelector((state) => state.config.apis.stock);
  const dividendApiConfig = useAppSelector((state) => state.config.apis.dividend);
  const currentDashboardMode = useAppSelector((state) => state.config.dashboard.assetFocus.mode);
  const developerConfig = useAppSelector((state) => state.config.developer);
  const [exportStatus, setExportStatus] = useState<AsyncOperationStatus>("idle");
  const [importStatus, setImportStatus] = useState<AsyncOperationStatus>("idle");
  const [importError, setImportError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState<ApiKeyStatus>("idle");
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [currency, setCurrency] = useState<"EUR" | "USD">("EUR");
    // Developer Mode State
  const [developerPassword, setDeveloperPassword] = useState("");
  const [developerActivationStatus, setDeveloperActivationStatus] = useState<AsyncOperationStatus>("idle");

   const dashboardMode = useMemo(() => currentDashboardMode, [currentDashboardMode]);


  // Clear data operation states - consolidated into a single state map
  const [clearStatuses, setClearStatuses] = useState<Record<string, ClearOperationStatus>>({
    assetDefinitions: "idle",
    priceHistory: "idle",
    assetTransactions: "idle",
    debts: "idle",
    expenses: "idle",
    income: "idle",
    allData: "idle",
    reduxCache: "idle",
    dividendHistory: "idle"
  });

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

  // Configuration for clear operations
  const clearOperationsConfig = useMemo(() => [
    {
      key: 'assetDefinitions',
      operation: 'clearAssetDefinitions' as keyof typeof deleteDataService,
      titleKey: 'settings.clearAssetDefinitionsTitle',
      confirmKey: 'settings.clearAssetDefinitionsConfirm',
      successKey: 'settings.snackbar.assetDefinitionsCleared',
      errorKey: 'settings.snackbar.assetDefinitionsClearError',
    },
    {
      key: 'priceHistory',
      operation: 'clearPriceHistory' as keyof typeof deleteDataService,
      titleKey: 'settings.clearPriceHistoryTitle',
      confirmKey: 'settings.clearPriceHistoryConfirm',
      successKey: 'settings.snackbar.priceHistoryCleared',
      errorKey: 'settings.snackbar.priceHistoryClearError',
    },
    {
      key: 'assetTransactions',
      operation: 'clearAssetTransactions' as keyof typeof deleteDataService,
      titleKey: 'settings.clearAssetTransactionsTitle',
      confirmKey: 'settings.clearAssetTransactionsConfirm',
      successKey: 'settings.snackbar.assetTransactionsCleared',
      errorKey: 'settings.snackbar.assetTransactionsClearError',
    },
    {
      key: 'debts',
      operation: 'clearDebts' as keyof typeof deleteDataService,
      titleKey: 'settings.clearDebtsTitle',
      confirmKey: 'settings.clearDebtsConfirm',
      successKey: 'settings.snackbar.debtsCleared',
      errorKey: 'settings.snackbar.debtsClearError',
    },
    {
      key: 'expenses',
      operation: 'clearExpenses' as keyof typeof deleteDataService,
      titleKey: 'settings.clearExpensesTitle',
      confirmKey: 'settings.clearExpensesConfirm',
      successKey: 'settings.snackbar.expensesCleared',
      errorKey: 'settings.snackbar.expensesClearError',
    },
    {
      key: 'income',
      operation: 'clearIncome' as keyof typeof deleteDataService,
      titleKey: 'settings.clearIncomeTitle',
      confirmKey: 'settings.clearIncomeConfirm',
      successKey: 'settings.snackbar.incomeCleared',
      errorKey: 'settings.snackbar.incomeClearError',
    },
    {
      key: 'dividendHistory',
      operation: 'clearDividendHistory' as keyof typeof deleteDataService,
      titleKey: 'settings.clearDividendHistoryTitle',
      confirmKey: 'settings.clearDividendHistoryConfirm',
      successKey: 'settings.snackbar.dividendHistoryCleared',
      errorKey: 'settings.snackbar.dividendHistoryClearError',
    },
    {
      key: 'allData',
      operation: 'clearAllData' as keyof typeof deleteDataService,
      titleKey: 'settings.clearAllDataTitle',
      confirmKey: 'settings.clearAllDataConfirm',
      successKey: 'settings.snackbar.allDataCleared',
      errorKey: 'settings.snackbar.allDataClearError',
    }
  ], []);

  // Special handler for Redux cache (needs dispatch parameter)
  const handleClearReduxCache = async () => {
    const updateStatus = (status: ClearOperationStatus) => {
      setClearStatuses(prev => ({ ...prev, reduxCache: status }));
    };

    try {
      updateStatus("clearing");
      Logger.info("Starting to clear Redux cache");
      await deleteDataService.clearReduxCacheOnly(dispatch);
      
      Logger.info("Redux cache cleared successfully");
      updateStatus("success");
      dispatch(showSuccessSnackbar(t("settings.snackbar.reduxCacheCleared")));
      setTimeout(() => updateStatus("idle"), 2000);
    } catch (error) {
      Logger.error("Failed to clear Redux cache: " + JSON.stringify(error));
      updateStatus("idle");
      dispatch(showErrorSnackbar(t("settings.snackbar.reduxCacheClearError")));
    }
  };

  // Generic clear handler factory
  const createClearHandler = (config: typeof clearOperationsConfig[0]) => async () => {
    const updateStatus = (status: ClearOperationStatus) => {
      setClearStatuses(prev => ({ ...prev, [config.key]: status }));
    };

    try {
      updateStatus("clearing");
      Logger.info(`Starting to clear ${config.key}`);

      // Call the service method - special handling for clearReduxCacheOnly
      const serviceMethod = deleteDataService[config.operation];
      if (typeof serviceMethod === 'function') {
        if (config.operation === 'clearReduxCacheOnly') {
          await serviceMethod(dispatch);
        } else {
          await (serviceMethod as () => Promise<void>)();
        }
      } else {
        throw new Error(`Service method ${config.operation} not found`);
      }

      updateStatus("success");
      dispatch(showSuccessSnackbar(t(config.successKey)));
    } catch (error) {
      Logger.error(`Failed to clear ${config.key}: ${JSON.stringify(error)}`);
      updateStatus("idle");
      dispatch(showErrorSnackbar(t(config.errorKey)));
    }
  };

  // Generate handlers from config
  const clearHandlers = useMemo(() => {
    const handlers: Record<string, () => Promise<void>> = {};
    clearOperationsConfig.forEach(config => {
      handlers[config.key] = createClearHandler(config);
    });
    // Add special handler for redux cache
    handlers.reduxCache = handleClearReduxCache;
    return handlers;
  }, [clearOperationsConfig, dispatch]);

  // Generate confirmation handlers from config
  const clearHandlersWithConfirm = useMemo(() => {
    const handlers: Record<string, () => void> = {};
    clearOperationsConfig.forEach(config => {
      handlers[config.key] = () => showConfirmDialog(
        t(config.titleKey),
        t(config.confirmKey),
        clearHandlers[config.key]
      );
    });
    // Add special handler for redux cache
    handlers.reduxCache = () => showConfirmDialog(
      t("settings.clearReduxCacheTitle"),
      t("settings.clearReduxCacheConfirm"),
      handleClearReduxCache
    );
    return handlers;
  }, [clearOperationsConfig, clearHandlers, showConfirmDialog]);

  const closeConfirmDialog = () => {
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  };

  // Load currency on mount
  useEffect(() => {
    const storedCurrency = getCurrency();
    setCurrency(storedCurrency);
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

  const handleApiKeyChange = async (provider: StockAPIProvider, newApiKey: string) => {
    setApiKeyStatus("saving");
    setApiKeyError(null);
    try {
      dispatch(setStockApiKey({ provider, key: newApiKey }));
      dispatch(setStockApiEnabled(true));
      setApiKeyStatus("success");
      dispatch(showSuccessSnackbar(t("settings.snackbar.apiKeySaved")));
    } catch (error) {
      setApiKeyError("Failed to save API key");
      setApiKeyStatus("error");
      dispatch(showErrorSnackbar(t("settings.snackbar.apiKeySaveError")));
      Logger.error("Failed to save API key" + JSON.stringify(error));
    }
  };

  const handleApiKeyRemove = (provider: StockAPIProvider) => {
    dispatch(setStockApiKey({ provider, key: "" }));
    if (provider === stockApiConfig.selectedProvider) {
      const hasOtherConfiguredProvider = Object.entries(stockApiConfig.apiKeys)
        .some(([key, value]) => key !== provider && value);
      if (!hasOtherConfiguredProvider) {
        dispatch(setStockApiEnabled(false));
      }
    }
    dispatch(showSuccessSnackbar(t("settings.snackbar.apiKeyRemoved")));
  };

  const handleProviderChange = (provider: StockAPIProvider) => {
    dispatch(setStockApiProvider(provider));
    dispatch(showSuccessSnackbar(t("settings.snackbar.providerChanged")));
  };

  const handleCurrencyChange = (newCurrency: "EUR" | "USD") => {
    setGlobalCurrency(newCurrency);
    setCurrency(newCurrency);
    Logger.info(`Currency changed to ${newCurrency}`);
    if (newCurrency === "EUR") {
      dispatch(showInfoSnackbar(t("settings.snackbar.eurConversionInfo")));
    }
  };


  const handleDashboardModeChange = (mode: string) => {
    Logger.info(`Dashboard mode changed to ${mode}`);
    if (mode === 'assetFocus' || mode === 'smartSummary') {
      dispatch(setAssetFocusMode(mode as 'assetFocus' | 'smartSummary'));
      Logger.info(`Redux action dispatched: setAssetFocusMode(${mode})`);
    } else {
      Logger.warn(`Invalid dashboard mode: ${mode}`);
    }
  };

  // Developer Mode Handlers
  const handleDeveloperPasswordChange = (password: string) => {
    setDeveloperPassword(password);
  };

  const handleDeveloperModeActivation = async () => {
    if (!developerPassword.trim()) {
      dispatch(showErrorSnackbar(t("settings.invalidPassword")));
      return;
    }

    try {
      setDeveloperActivationStatus("loading");
      
      const isValidPassword = await verifyHash(developerPassword, developerPasswordHash);
      
      if (isValidPassword) {
        dispatch(setDeveloperModeEnabled(true));
        localStorage.setItem('developerModeEnabled', 'true');
        
        setDeveloperActivationStatus("success");
        dispatch(showSuccessSnackbar(t("settings.activated")));
        setDeveloperPassword("");
        
        Logger.info("Developer mode activated");
      } else {
        setDeveloperActivationStatus("error");
        dispatch(showErrorSnackbar(t("settings.invalidPassword")));
        Logger.warn("Invalid developer password attempt");
      }
    } catch (error) {
      setDeveloperActivationStatus("error");
      dispatch(showErrorSnackbar("Error activating developer mode"));
      Logger.error("Developer mode activation error: " + JSON.stringify(error));
    }
    
    // Reset status after 2 seconds
    setTimeout(() => setDeveloperActivationStatus("idle"), 2000);
  };

  const handleDeveloperModeDeactivation = () => {
    try {
      dispatch(setDeveloperModeEnabled(false));
      localStorage.removeItem('developerModeEnabled');
      
      dispatch(showSuccessSnackbar(t("settings.deactivate") + "d"));
      Logger.info("Developer mode deactivated");
    } catch (error) {
      dispatch(showErrorSnackbar("Error deactivating developer mode"));
      Logger.error("Developer mode deactivation error: " + JSON.stringify(error));
    }
  };

  // Load developer mode state from localStorage on mount
  useEffect(() => {
    const savedDeveloperMode = localStorage.getItem('developerModeEnabled');
    if (savedDeveloperMode === 'true') {
      dispatch(setDeveloperModeEnabled(true));
    }
  }, [dispatch]);

  // --- Dividend API Provider/Key Handling ---
  // Accept string, cast to DividendApiProvider for Redux action
  const handleDiviApiKeyChange = (provider: string, newApiKey: string) => {
    dispatch(setDividendApiKey({ provider: provider as DividendApiProvider, key: newApiKey }));
    setApiKeyStatus("success");
    dispatch(showSuccessSnackbar(t("settings.snackbar.diviApiKeySaved")));
  };

  const handleDiviApiKeyRemove = (provider: string) => {
    dispatch(setDividendApiKey({ provider: provider as DividendApiProvider, key: "" }));
    dispatch(showSuccessSnackbar(t("settings.snackbar.diviApiKeyRemoved")));
  };

  const handleDiviProviderChange = (provider: string) => {
    dispatch(setDividendApiProvider(provider as DividendApiProvider));
    dispatch(showSuccessSnackbar(t("settings.snackbar.diviProviderChanged")));
  };

  // Handle stock API toggle
  const handleStockApiToggle = (enabled: boolean) => {
    Logger.info(`[Settings] Stock API toggle changed to: ${enabled}`);
    dispatch(setStockApiEnabled(enabled));
  };

  const handleDividendApiToggle = (enabled: boolean) => {
    dispatch(setDividendApiEnabled(enabled));
  };

  return (
    <SettingsView
      exportStatus={exportStatus}
      importStatus={importStatus}
      importError={importError}
      logs={logs}
      showLogs={showLogs}
      autoRefresh={autoRefresh}
      selectedProvider={stockApiConfig.selectedProvider}
      apiKeys={stockApiConfig.apiKeys}
      apiKeyStatus={apiKeyStatus}
      apiKeyError={apiKeyError}
      currency={currency}
      clearStatuses={clearStatuses}
      clearHandlers={clearHandlersWithConfirm}
      isApiEnabled={stockApiConfig.enabled}
      isDividendApiEnabled={dividendApiConfig.enabled}
      dashboardMode={dashboardMode}
      selectedDiviProvider={dividendApiConfig.selectedProvider}
      dividendApiKey={dividendApiConfig.apiKeys}
      onApiToggle={handleStockApiToggle}
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
      onDiviApiKeyChange={handleDiviApiKeyChange}
      onDiviApiKeyRemove={handleDiviApiKeyRemove}
      onDiviProviderChange={handleDiviProviderChange}
      onPortfolioHistoryRefresh={() => cacheRefreshService.refreshAllCaches()}
      confirmDialog={confirmDialog}
      onCloseConfirmDialog={closeConfirmDialog}
      formatLogEntry={formatLogEntry}
      // Developer Mode Props
      isDeveloperModeEnabled={developerConfig.enabled}
      developerPassword={developerPassword}
      developerActivationStatus={developerActivationStatus}
      onDeveloperPasswordChange={handleDeveloperPasswordChange}
      onDeveloperModeActivation={handleDeveloperModeActivation}
      onDeveloperModeDeactivation={handleDeveloperModeDeactivation}
    />
  );
};

export default SettingsContainer;