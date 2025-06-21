import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '../../../ui/common/Card';
import { CollapsibleSection } from '../../../ui/common/CollapsibleSection';
import { Button } from '../../../ui/common/Button';
import { ButtonGroup } from '../../../ui/common/ButtonGroup';
import { Download, Upload, Eye, EyeOff, Key, ChevronRight, Trash, Monitor } from 'lucide-react';
import DebugSettings from '../../../ui/specialized/DebugSettings';
import { featureFlag_Debug_Settings_View } from '../../../config/featureFlags';
import { StockAPIProvider } from '../../../store/slices/apiConfigSlice';
import { DashboardMode } from '../../../store/slices/dashboardSettingsSlice';
import { ConfirmationDialog } from '../../../ui/dialog/ConfirmationDialog';
import { ClearButton, ClearStatus, getButtonText, getClearButtonIcon } from '../../../ui/common/ClearButton';
import clsx from 'clsx';
import { Toggle } from '../../../ui/common/Toggle';

interface ProviderInfo {
  name: string;
  description: string;
  keyPlaceholder: string;
  website: string;
  requiresApiKey: boolean;
}

interface ProviderInfoMap {
  [key: string]: ProviderInfo;
}

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
  isApiEnabled: boolean;
  dashboardMode: DashboardMode;
  confirmDialog: {
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  };
  onCloseConfirmDialog: () => void;
  onApiToggle: (enabled: boolean) => void;
  onExportData: () => void;
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
  formatLogEntry: (logEntry: string) => { timestamp: string; message: string };
  getLogLevelColor: (level: string) => string;
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
  formatLogEntry,
  getLogLevelColor,
  confirmDialog,
  onCloseConfirmDialog
}) => {
  const { t } = useTranslation();
  const [showApiKey, setShowApiKey] = useState(false);
  const [tempApiKeys, setTempApiKeys] = useState<{ [K in StockAPIProvider]?: string }>({
    [StockAPIProvider.FINNHUB]: apiKeys?.[StockAPIProvider.FINNHUB] || '',
    [StockAPIProvider.YAHOO]: apiKeys?.[StockAPIProvider.YAHOO] || '',
    [StockAPIProvider.ALPHA_VANTAGE]: apiKeys?.[StockAPIProvider.ALPHA_VANTAGE] || '',
  });

  // Update tempApiKeys when apiKeys prop changes
  useEffect(() => {
    setTempApiKeys({
      [StockAPIProvider.FINNHUB]: apiKeys?.[StockAPIProvider.FINNHUB] || '',
      [StockAPIProvider.YAHOO]: apiKeys?.[StockAPIProvider.YAHOO] || '',
      [StockAPIProvider.ALPHA_VANTAGE]: apiKeys?.[StockAPIProvider.ALPHA_VANTAGE] || '',
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
              <h3 className="font-medium">
                {t('settings.apiKeyFor', { provider: providerInfo[selectedProvider].name })}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {t('settings.getApiKeyFrom')}{' '}
                <a 
                  href={providerInfo[selectedProvider].website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 underline"
                >
                  {providerInfo[selectedProvider].name}
                </a>
                {' '}{t('settings.toEnableStockData')}
              </p>
              
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={tempApiKeys[selectedProvider] || ''}
                    onChange={(e) => setTempApiKeys(prev => ({
                      ...prev,
                      [selectedProvider]: e.target.value
                    }))}
                    placeholder={providerInfo[selectedProvider].keyPlaceholder}
                    className="w-full px-3 py-2 pr-10 border rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                
                {apiKeyError && (
                  <p className="text-sm text-red-500">{apiKeyError}</p>
                )}
                
                <div className="flex space-x-2">
                  <Button
                    onClick={() => onApiKeyChange(selectedProvider, tempApiKeys[selectedProvider] || '')}
                    disabled={apiKeyStatus === 'saving' || !tempApiKeys[selectedProvider]?.trim()}
                    className="flex items-center space-x-2"
                  >
                    <span>{apiKeyButtonText}</span>
                  </Button>
                  
                  {apiKeys?.[selectedProvider] && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        onApiKeyRemove(selectedProvider);
                        setTempApiKeys(prev => ({ ...prev, [selectedProvider]: '' }));
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      {t('common.remove')}
                    </Button>
                  )}
                </div>
                
                {apiKeys?.[selectedProvider] && (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {t('settings.apiKeyConfigured')}
                  </p>
                )}
              </div>
            </div>
          )}
          
          <div>
            <h3 className="font-medium">{t('settings.stockMarketCurrency')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              {t('settings.stockMarketCurrencyDescription')}
            </p>
            
            {(() => {
              return (
                <ButtonGroup className="flex space-x-3">
                  <Button
                    onClick={() => onCurrencyChange('EUR')}
                    variant={currency === 'EUR' ? 'default' : 'secondary'}
                    size="sm"
                  >
                    {t('settings.eurAutoConverted')}
                  </Button>
                  <Button
                    onClick={() => onCurrencyChange('USD')}
                    variant={currency === 'USD' ? 'default' : 'secondary'}
                    size="sm"
                  >
                    {t('settings.usdOriginal')}
                  </Button>
                </ButtonGroup>
              );
            })()}
            
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              {t('settings.currentCurrency', {
                currency,
              })}
            </p>
          </div>
        </div>
      </CollapsibleSection>


      {/* Data Management */}
      <CollapsibleSection
        title={t('settings.dataManagement')}
        icon={<Download size={20} />}
        defaultExpanded={false}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">{t('settings.exportData')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('settings.exportDescription')}
              </p>
            </div>
            <Button
              onClick={onExportData}
              disabled={exportStatus === 'loading'}
              className="flex items-center space-x-2"
            >
              <Download size={16} />
              <span>{exportButtonText}</span>
            </Button>
          </div>

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
                accept=".json"
                onChange={onImportData}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={importStatus === 'loading'}
              />
              <Button
                variant="outline"
                disabled={importStatus === 'loading'}
                className="flex items-center space-x-2"
              >
                <Upload size={16} />
                <span>{importButtonText}</span>
              </Button>
            </div>
          </div>
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

              <ClearButton
                status={clearAssetTransactionsStatus}
                onClick={onClearAssetTransactions}
                titleKey="settings.clearAssetTransactions"
                descKey="settings.clearAssetTransactionsDesc"
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
