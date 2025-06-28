import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/common/Card';
import { CollapsibleSection } from '@/ui/common/CollapsibleSection';
import { Button } from '@/ui/common/Button';
import { ButtonGroup } from '@/ui/common/ButtonGroup';
import { Download, Upload, Key, ChevronRight, Trash, Monitor } from 'lucide-react';
import DebugSettings from '@/ui/specialized/DebugSettings';
import { featureFlag_Debug_Settings_View } from '../../../config/featureFlags';
import { StockAPIProvider } from '@/store/slices/apiConfigSlice';
import { DashboardMode } from '@/store/slices/dashboardSettingsSlice';
import { ConfirmationDialog } from '@/ui/dialog/ConfirmationDialog';
import { ClearButton, ClearStatus, getButtonText, getClearButtonIcon } from '@/ui/common/ClearButton';
import clsx from 'clsx';
import { Toggle } from '@/ui/common/Toggle';
import { DividendApiSettingsSection } from './DividendApiSettingsSection';
import { StockApiSettingsSection } from './StockApiSettingsSection';

interface ProviderInfo {
  name: string;
  description: string;
  keyPlaceholder: string;
  website: string;
  requiresApiKey: boolean;
}

type ProviderInfoMap = Record<StockAPIProvider, ProviderInfo>;

interface SettingsViewProps {
  exportStatus: 'idle' | 'loading' | 'success' | 'error';
  importStatus: 'idle' | 'loading' | 'success' | 'error';
  importError: string | null;
  logs: string[];
  showLogs: boolean;
  autoRefresh: boolean;
  selectedProvider: StockAPIProvider;
  apiKeys?: { [K in StockAPIProvider]?: string };
  apiKeyStatus: 'idle' | 'saving' | 'success' | 'error';
  apiKeyError: string | null;
  currency: 'EUR' | 'USD';
  clearAssetDefinitionsStatus: ClearStatus;
  clearPriceHistoryStatus: ClearStatus;
  clearAssetTransactionsStatus: ClearStatus;
  clearDebtsStatus: ClearStatus;
  clearExpensesStatus: ClearStatus;
  clearIncomeStatus: ClearStatus;
  clearAllDataStatus: ClearStatus;
  clearReduxCacheStatus: ClearStatus;
  clearDividendHistoryStatus: ClearStatus;
  isApiEnabled: boolean;
  isDividendApiEnabled: boolean;
  dashboardMode: DashboardMode;
  confirmDialog: {
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  };
  onCloseConfirmDialog: () => void;
  onApiToggle: (enabled: boolean) => void;
  onDividendApiToggle: (enabled: boolean) => void;
  onExportData: (storeNames: string[]) => void;
  onImportData: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleLogs: () => void;
  onRefreshLogs: () => void;
  onExportLogs: () => void;
  onClearLogs: () => void;
  onAutoRefreshChange: (enabled: boolean) => void;
  onApiKeyChange: (provider: StockAPIProvider, apiKey: string) => void;
  onApiKeyRemove: (provider: StockAPIProvider) => void;
  onProviderChange: (provider: StockAPIProvider) => void;
  onCurrencyChange: (currency: 'EUR' | 'USD') => void;
  onDashboardModeChange: (mode: DashboardMode) => void;
  onClearAllData: () => void;
  onClearAssetDefinitions: () => void;
  onClearPriceHistory: () => void;
  onClearAssetTransactions: () => void;
  onClearDebts: () => void;
  onClearExpenses: () => void;
  onClearIncome: () => void;
  onClearReduxCache: () => void;
  // Dividend API
  selectedDiviProvider: string;
  dividendApiKey: { [provider: string]: string };
  onDiviApiKeyChange: (provider: string, apiKey: string) => void;
  onDiviApiKeyRemove: (provider: string) => void;
  onDiviProviderChange: (provider: string) => void;
  formatLogEntry: (logEntry: string) => { timestamp: string; message: string };
  getLogLevelColor: (level: string) => string;
  // Fix: Add missing prop for dividend history clear
  onClearDividendHistory: () => void;
  // NEW: Debug button for portfolio history refresh
  onPortfolioHistoryRefresh?: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({
  exportStatus,
  importStatus,
  importError,
  logs,
  showLogs,
  autoRefresh,
  selectedProvider,
  apiKeys,
  apiKeyStatus,
  apiKeyError,
  currency,
  clearAllDataStatus,
  clearAssetDefinitionsStatus,
  clearPriceHistoryStatus,
  clearAssetTransactionsStatus,
  clearDebtsStatus,
  clearExpensesStatus,
  clearIncomeStatus,
  clearReduxCacheStatus,
  clearDividendHistoryStatus,
  isApiEnabled,
  dashboardMode,
  onApiToggle,
  onExportData,
  onImportData,
  onToggleLogs,
  onRefreshLogs,
  onExportLogs,
  onClearLogs,
  onAutoRefreshChange,
  onApiKeyChange,
  onApiKeyRemove,
  onProviderChange,
  onCurrencyChange,
  onDashboardModeChange,
  onClearAllData,
  onClearAssetDefinitions,
  onClearPriceHistory,
  onClearAssetTransactions,
  onClearDebts,
  onClearExpenses,
  onClearIncome,
  onClearReduxCache,
  selectedDiviProvider,
  dividendApiKey,
  onDiviApiKeyChange,
  onDiviApiKeyRemove,
  onDiviProviderChange,
  formatLogEntry,
  getLogLevelColor,
  confirmDialog,
  onCloseConfirmDialog,
  isDividendApiEnabled,
  onDividendApiToggle,
  // Fix: Add missing prop for dividend history clear
  onClearDividendHistory,
  onPortfolioHistoryRefresh,
}) => {
  const { t } = useTranslation();
  const [showApiKey, setShowApiKey] = useState(false);
  const [tempApiKeys, setTempApiKeys] = useState<Record<StockAPIProvider, string>>({
    [StockAPIProvider.FINNHUB]: apiKeys?.[StockAPIProvider.FINNHUB] ?? '',
    [StockAPIProvider.YAHOO]: apiKeys?.[StockAPIProvider.YAHOO] ?? '',
    [StockAPIProvider.ALPHA_VANTAGE]: apiKeys?.[StockAPIProvider.ALPHA_VANTAGE] ?? '',
  });

  // Update tempApiKeys when apiKeys prop changes
  useEffect(() => {
    setTempApiKeys({
      [StockAPIProvider.FINNHUB]: apiKeys?.[StockAPIProvider.FINNHUB] ?? '',
      [StockAPIProvider.YAHOO]: apiKeys?.[StockAPIProvider.YAHOO] ?? '',
      [StockAPIProvider.ALPHA_VANTAGE]: apiKeys?.[StockAPIProvider.ALPHA_VANTAGE] ?? '',
    });
  }, [apiKeys]);

  // Provider information
  const providerInfo: ProviderInfoMap = {
    [StockAPIProvider.FINNHUB]: {
      name: 'Finnhub',
      description: t('settings.finnhubDescription'),
      keyPlaceholder: t('settings.enterFinnhubApiKey'),
      website: 'https://finnhub.io',
      requiresApiKey: true
    },
    [StockAPIProvider.YAHOO]: {
      name: 'Yahoo Finance',
      description: t('settings.yahooDescription'),
      keyPlaceholder: t('settings.enterYahooApiKey'),
      website: 'https://finance.yahoo.com',
      requiresApiKey: false
    },
    [StockAPIProvider.ALPHA_VANTAGE]: {
      name: 'Alpha Vantage',
      description: t('settings.alphaVantageDescription'),
      keyPlaceholder: t('settings.enterAlphaVantageApiKey'),
      website: 'https://www.alphavantage.co',
      requiresApiKey: true
    }
  };

  // Extract button text helpers for reduced complexity
  const exportButtonText = getButtonText(exportStatus, t, 'settings.exporting', 'settings.exported', 'settings.export');
  const importButtonText = getButtonText(importStatus, t, 'settings.importing', 'settings.imported', 'settings.import');
  const apiKeyButtonText = getButtonText(apiKeyStatus, t, 'settings.saving', 'settings.saved', 'settings.saveApiKey');

  // Unterstützte Stores für gezielten Export/Import
  const STORE_OPTIONS = [
    { key: 'transactions', label: t('settings.transactions') },
    { key: 'assetDefinitions', label: t('settings.assetDefinitions') },
    { key: 'assetCategories', label: t('settings.assetCategories') },
    { key: 'assetCategoryOptions', label: t('settings.assetCategoryOptions') },
    { key: 'assetCategoryAssignments', label: t('settings.assetCategoryAssignments') },
    { key: 'liabilities', label: t('settings.liabilities') },
    { key: 'expenses', label: t('settings.expenses') },
    { key: 'income', label: t('settings.income') },
    { key: 'exchangeRates', label: t('settings.exchangeRates') },
  ];

  const [selectedStores, setSelectedStores] = useState<string[]>(STORE_OPTIONS.map(opt => opt.key));

  const handleStoreToggle = (key: string) => {
    setSelectedStores((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('navigation.settings')}</h1>
      
      {/* Dashboard Settings */}
      <CollapsibleSection
        title={t('settings.dashboardSettings')}
        icon={<Monitor size={20} />}
        defaultExpanded={false}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">{t('settings.dashboardMode')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('settings.dashboardModeDescription')}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <ButtonGroup className="flex space-x-3">
              <Button
                onClick={() => onDashboardModeChange('smartSummary')}
                variant={dashboardMode === 'smartSummary' ? 'default' : 'secondary'}
                size="sm"
              >
                {t('settings.smartSummary')}
              </Button>
              <Button
                onClick={() => onDashboardModeChange('assetFocus')}
                variant={dashboardMode === 'assetFocus' ? 'default' : 'secondary'}
                size="sm"
              >
                {t('settings.assetFocus')}
              </Button>
            </ButtonGroup>
            
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {t('settings.currentDashboardMode', {
                mode: dashboardMode === 'smartSummary' ? t('settings.smartSummary') : t('settings.assetFocus'),
              })}
            </p>
          </div>
        </div>
      </CollapsibleSection>
      
      {/* API Configuration */}
      <CollapsibleSection
        title={t('settings.stockApiConfig')}
        icon={<Key size={20} />}
        defaultExpanded={false}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">{t('settings.enableStockApi')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('settings.enableStockApiDescription')}
              </p>
            </div>
            <Toggle
              checked={isApiEnabled}
              onChange={onApiToggle}
              id="api-toggle"
              label={t('settings.enableStockApi')}
            />
          </div>

          {/* Provider Selection */}
          {isApiEnabled && (
            <div>
              <h3 className="font-medium">{t('settings.selectProvider')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {t('settings.selectProviderDescription')}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.values(StockAPIProvider).map((provider) => {
                  const info = providerInfo[provider];
                  const isSelected = selectedProvider === provider;
                  // Yahoo Finance doesn't require an API key, so it's always configured
                  const isConfigured = provider === StockAPIProvider.YAHOO ? true : !!(apiKeys?.[provider]);
                  
                  // Extract className logic for provider selection
                  const providerClassName = isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600';
                  
                  return (
                    <div
                      key={provider}
                      onClick={() => onProviderChange(provider)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${providerClassName}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{info.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {info.description}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {isConfigured && (
                            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded">
                              {t('settings.configured')}
                            </span>
                          )}
                          {isSelected && (
                            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded">
                              {t('settings.active')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* API Key Configuration for Selected Provider */}
          {isApiEnabled && providerInfo[selectedProvider].requiresApiKey && (
            <div>
              <StockApiSettingsSection
                selectedProvider={selectedProvider}
                apiKeys={{
                  [StockAPIProvider.FINNHUB]: apiKeys?.[StockAPIProvider.FINNHUB] ?? '',
                  [StockAPIProvider.YAHOO]: apiKeys?.[StockAPIProvider.YAHOO] ?? '',
                  [StockAPIProvider.ALPHA_VANTAGE]: apiKeys?.[StockAPIProvider.ALPHA_VANTAGE] ?? '',
                }}
                apiKeyStatus={apiKeyStatus}
                apiKeyError={apiKeyError}
                tempApiKeys={tempApiKeys}
                setTempApiKeys={setTempApiKeys}
                showApiKey={showApiKey}
                setShowApiKey={setShowApiKey}
                onApiKeyChange={onApiKeyChange}
                onApiKeyRemove={onApiKeyRemove}
                providerInfo={providerInfo}
                apiKeyButtonText={apiKeyButtonText}
              />
            </div>
          )}
          
          <div>
            <h3 className="font-medium">{t('settings.stockMarketCurrency')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              {t('settings.stockMarketCurrencyDescription')}
            </p>
            <div className="flex items-center space-x-4">
              <Toggle
                checked={currency === 'EUR'}
                onChange={(checked) => onCurrencyChange(checked ? 'EUR' : 'USD')}
                id="currency-toggle"
                label={t('settings.currencyToggleLabel')}
              />
              <span className="text-sm">
                {currency === 'EUR'
                  ? t('settings.eurAutoConverted')
                  : t('settings.usdOriginal')}
              </span>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              {t('settings.currentCurrency', { currency })}
            </p>
          </div>
        </div>
      </CollapsibleSection>

      {/* Dividend API Configuration */}
      <DividendApiSettingsSection
        enabled={isDividendApiEnabled}
        selectedProvider={selectedDiviProvider || 'yahoo'}
        apiKeys={dividendApiKey || {}}
        onEnabledChange={onDividendApiToggle}
        onProviderChange={onDiviProviderChange}
        onApiKeyChange={onDiviApiKeyChange}
        onApiKeyRemove={onDiviApiKeyRemove}
      />

      {/* Data Management */}
      <CollapsibleSection
        title={t('settings.dataManagement')}
        icon={<Download size={20} />}
        defaultExpanded={false}
      >
        <div className="space-y-4">
          {/* Import Button */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">{t('settings.importData')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('settings.importDescription')}
              </p>
              {importError && (
                <p className="text-sm text-red-500 mt-1">{importError}</p>
              )}
            </div>
            <div className="relative">
              <input
                type="file"
                accept="application/json"
                onChange={onImportData}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={importStatus === 'loading'}
              />
              <Button
                disabled={importStatus === 'loading'}
                className="flex items-center space-x-2"
              >
                <Upload size={16} />
                <span>{importButtonText}</span>
              </Button>
            </div>
          </div>
          {/* Export Button */}
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">{t('settings.exportData')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('settings.exportDescription')}
              </p>
            </div>
            <Button
              onClick={() => onExportData(selectedStores)}
              disabled={exportStatus === 'loading' || selectedStores.length === 0}
              className="flex items-center space-x-2"
            >
              <Download size={16} />
              <span>{exportButtonText}</span>
            </Button>
          </div>
                    {/* Store Auswahl Collapsible */}
          <CollapsibleSection
            title={t('settings.selectDataSets')}
            icon={null}
            defaultExpanded={false}
          >
            <div className="mb-2">
              {/* Chips für ausgewählte Stores */}
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedStores.map(key => {
                  const label = STORE_OPTIONS.find(opt => opt.key === key)?.label || key;
                  return (
                    <span key={key} className="flex items-center bg-blue-600 text-white rounded-full px-3 py-1 text-sm mr-1 mb-1">
                      {label}
                      <button
                        type="button"
                        className="ml-2 text-white hover:text-gray-200 focus:outline-none"
                        onClick={() => setSelectedStores(selectedStores.filter(k => k !== key))}
                        aria-label={`Remove ${label}`}
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
              {/* Multi-Select Input */}
              <div className="relative w-full max-w-md">
                <select
                  multiple
                  value={selectedStores}
                  onChange={e => {
                    const options = Array.from(e.target.selectedOptions).map(opt => opt.value);
                    setSelectedStores(options);
                  }}
                  className="block w-full border border-blue-400 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900"
                  size={Math.min(STORE_OPTIONS.length, 6)}
                >
                  {STORE_OPTIONS.map(opt => (
                    <option key={opt.key} value={opt.key} className="py-1">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-gray-400 mt-1">{t('settings.selectDataSetsHint')}</p>
            </div>
          </CollapsibleSection>
        </div>
      </CollapsibleSection>

      {/* Clear Data Section */}
      <CollapsibleSection
        title={t("settings.clearData")}
        icon={<Trash size={20} />}
        defaultExpanded={false}
      >
        <div className="space-y-4">
          {/* Asset Management Section */}
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              {t("settings.assetManagement")}
            </h3>
            <div className="space-y-3">
              <ClearButton
                status={clearAssetDefinitionsStatus}
                onClick={onClearAssetDefinitions}
                titleKey="settings.clearAssetDefinitions"
                descKey="settings.clearAssetDefinitionsDesc"
                t={t}
              />
              <ClearButton
                status={clearPriceHistoryStatus}
                onClick={onClearPriceHistory}
                titleKey="settings.clearPriceHistory"
                descKey="settings.clearPriceHistoryDesc"
                t={t}
              />
              {/* Transaktionen löschen */}
              <ClearButton
                status={clearAssetTransactionsStatus}
                onClick={onClearAssetTransactions}
                titleKey="settings.clearAssetTransactions"
                descKey="settings.clearAssetTransactionsDesc"
                t={t}
              />
              {/* Dividendenverlauf löschen */}
              <ClearButton
                status={clearDividendHistoryStatus}
                onClick={onClearDividendHistory}
                titleKey="settings.clearDividendHistory"
                descKey="settings.clearDividendHistoryDesc"
                t={t}
              />
            </div>
          </div>

          {/* Financial Management Section */}
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              {t("settings.financialManagement")}
            </h3>
            <div className="space-y-3">
              <ClearButton
                status={clearDebtsStatus}
                onClick={onClearDebts}
                titleKey="settings.clearDebts"
                descKey="settings.clearDebtsDesc"
                t={t}
              />

              <ClearButton
                status={clearExpensesStatus}
                onClick={onClearExpenses}
                titleKey="settings.clearExpenses"
                descKey="settings.clearExpensesDesc"
                t={t}
              />

              <ClearButton
                status={clearIncomeStatus}
                onClick={onClearIncome}
                titleKey="settings.clearIncome"
                descKey="settings.clearIncomeDesc"
                t={t}
              />
            </div>
          </div>

          {/* Cache Management Section */}
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              {t("settings.cacheManagement")}
            </h3>
            <div className="space-y-3">
              <ClearButton
                status={clearReduxCacheStatus}
                onClick={onClearReduxCache}
                titleKey="settings.clearReduxCache"
                descKey="settings.clearReduxCacheDesc"
                t={t}
              />
            </div>
          </div>

          {/* Complete Reset Section */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              {t("settings.completeReset")}
            </h3>
            <div className="space-y-3">
              <Button
                variant="destructive"
                className={clsx("w-full justify-between", {
                  'opacity-50': clearAllDataStatus === "clearing"
                })}
                onClick={onClearAllData}
                disabled={clearAllDataStatus === "clearing"}
              >
                <div className="text-left">
                  <span className="flex items-center mb-1">
                    {getClearButtonIcon(clearAllDataStatus)}
                    {t("settings.clearAllData")}
                  </span>
                  <p className="text-sm text-gray-400">
                    {t("settings.clearAllDataDesc")}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
              </Button>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Debug Settings Component */}
      {featureFlag_Debug_Settings_View && (
        <DebugSettings
          logs={logs}
          showLogs={showLogs}
          autoRefresh={autoRefresh}
          onToggleLogs={onToggleLogs}
          onRefreshLogs={onRefreshLogs}
          onExportLogs={onExportLogs}
          onClearLogs={onClearLogs}
          onAutoRefreshChange={onAutoRefreshChange}
          formatLogEntry={formatLogEntry}
          getLogLevelColor={getLogLevelColor}
          pullToRefreshFake={onPortfolioHistoryRefresh}
        />
      )}

      {/* About */}
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle>{t('settings.about')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>{t('settings.appName')}</strong>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('settings.version', { version: '1.0.0' })}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('settings.appDescription')}
            </p>
            
            {featureFlag_Debug_Settings_View && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-yellow-600 dark:text-yellow-400 font-mono">
                  🚧 {t('settings.debugModeActive')}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('settings.debugModeDescription')}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
        onClose={onCloseConfirmDialog}
      />
    </div>
  );
};

export default SettingsView;
