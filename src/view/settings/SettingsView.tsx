import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/common/Card';
import { Button } from '../../ui/common/Button';
import { Download, Upload, Eye, EyeOff, Key, ChevronRight, ChevronDown, Trash } from 'lucide-react';
import DebugSettings from '../../ui/specialized/DebugSettings';
import { featureFlag_Debug_Settings_View } from '../../config/featureFlags';
import { StockAPIProvider } from '../../store/slices/apiConfigSlice';

interface SettingsViewProps {
  exportStatus: 'idle' | 'loading' | 'success' | 'error';
  importStatus: 'idle' | 'loading' | 'success' | 'error';
  importError: string | null;
  logs: string[];
  showLogs: boolean;
  autoRefresh: boolean;
  analytics: {
    getSessionDuration: () => number;
    getEventCount: (event?: string) => number;
  };
  selectedProvider: StockAPIProvider;
  apiKeys?: { [K in StockAPIProvider]?: string };
  apiKeyStatus: 'idle' | 'saving' | 'success' | 'error';
  apiKeyError: string | null;
  currency: 'EUR' | 'USD';
  clearDataStatus?: 'idle' | 'clearing' | 'success';
  isApiEnabled: boolean;
  isApiExpanded: boolean;
  isDataManagementExpanded: boolean;
  isClearDataExpanded: boolean;
  onApiToggle: (enabled: boolean) => void;
  onApiExpandedChange: () => void;
  onDataManagementExpandedChange: () => void;
  onClearDataExpandedChange: () => void;
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
  onClearPartialData: () => void;
  onClearAllData: () => void;
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
  analytics,
  selectedProvider,
  apiKeys,
  apiKeyStatus,
  apiKeyError,
  currency,
  clearDataStatus = 'idle',
  isApiEnabled,
  isApiExpanded,
  isDataManagementExpanded,
  isClearDataExpanded,
  onApiToggle,
  onApiExpandedChange,
  onDataManagementExpandedChange,
  onClearDataExpandedChange,
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
  onClearPartialData,
  onClearAllData,
  formatLogEntry,
  getLogLevelColor
}) => {
  const { t } = useTranslation();
  const [showApiKey, setShowApiKey] = useState(false);
  const [tempApiKeys, setTempApiKeys] = useState<{ [K in StockAPIProvider]?: string }>({
    finnhub: apiKeys?.finnhub || '',
    yahoo: apiKeys?.yahoo || '',
    alpha_vantage: apiKeys?.alpha_vantage || '',
    iex_cloud: apiKeys?.iex_cloud || ''
  });

  // Update tempApiKeys when apiKeys prop changes
  useEffect(() => {
    setTempApiKeys({
      finnhub: apiKeys?.finnhub || '',
      yahoo: apiKeys?.yahoo || '',
      alpha_vantage: apiKeys?.alpha_vantage || '',
      iex_cloud: apiKeys?.iex_cloud || ''
    });
  }, [apiKeys]);

  // Provider information
  const providerInfo = {
    finnhub: {
      name: 'Finnhub',
      description: t('settings.finnhubDescription'),
      keyPlaceholder: t('settings.enterFinnhubApiKey'),
      website: 'https://finnhub.io',
      requiresApiKey: true
    },
    yahoo: {
      name: 'Yahoo Finance',
      description: t('settings.yahooDescription'),
      keyPlaceholder: t('settings.enterYahooApiKey'),
      website: 'https://finance.yahoo.com',
      requiresApiKey: false
    },
    alpha_vantage: {
      name: 'Alpha Vantage',
      description: t('settings.alphaVantageDescription'),
      keyPlaceholder: t('settings.enterAlphaVantageApiKey'),
      website: 'https://www.alphavantage.co',
      requiresApiKey: true
    },
    iex_cloud: {
      name: 'IEX Cloud',
      description: t('settings.iexCloudDescription'),
      keyPlaceholder: t('settings.enterIexCloudApiKey'),
      website: 'https://iexcloud.io',
      requiresApiKey: true
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('navigation.settings')}</h1>
      
      {/* API Configuration */}
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader 
          className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors" 
          onClick={onApiExpandedChange}
        >
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Key size={20} />
              <span>{t('settings.stockApiConfig')}</span>
            </div>
            {isApiExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </CardTitle>
        </CardHeader>
        {isApiExpanded && (
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{t('settings.enableStockApi')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('settings.enableStockApiDescription')}
                </p>
              </div>
              <div className="relative inline-block w-14 h-8 flex-shrink-0">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={isApiEnabled}
                  onChange={(e) => onApiToggle(e.target.checked)}
                  id="api-toggle"
                />
                <label
                  className="absolute cursor-pointer bg-gray-200 peer-checked:bg-blue-500 rounded-full w-14 h-8 transition-colors duration-300"
                  htmlFor="api-toggle"
                >
                  <span className="sr-only">{t('settings.enableStockApi')}</span>
                  <span className="absolute bg-white w-6 h-6 left-1 top-1 rounded-full transition-transform duration-300 peer-checked:translate-x-6" />
                </label>
              </div>
            </div>

            {/* Provider Selection */}
            {isApiEnabled && (
              <div>
                <h3 className="font-medium">{t('settings.selectProvider')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  {t('settings.selectProviderDescription')}
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(Object.keys(providerInfo) as StockAPIProvider[]).map((provider) => {
                    const info = providerInfo[provider];
                    const isSelected = selectedProvider === provider;
                    // Yahoo Finance doesn't require an API key, so it's always configured
                    const isConfigured = provider === 'yahoo' ? true : !!(apiKeys?.[provider]);
                    
                    return (
                      <div
                        key={provider}
                        onClick={() => onProviderChange(provider)}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
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
                      <span>
                        {(() => {
                          if (apiKeyStatus === 'saving') return t('settings.saving');
                          if (apiKeyStatus === 'success') return t('settings.saved');
                          return t('settings.saveApiKey');
                        })()}
                      </span>
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
              
              <div className="flex space-x-3">
                <button
                  onClick={() => onCurrencyChange('EUR')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    currency === 'EUR'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {t('settings.eurAutoConverted')}
                </button>
                <button
                  onClick={() => onCurrencyChange('USD')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    currency === 'USD'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {t('settings.usdOriginal')}
                </button>
              </div>
              
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                {t('settings.currentCurrency', {
                  currency,
                })}
              </p>
            </div>
          </CardContent>
        )}
      </Card>


      {/* Data Management */}
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader 
          className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors" 
          onClick={onDataManagementExpandedChange}
        >
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Download size={20} />
              <span>{t('settings.dataManagement')}</span>
            </div>
            {isDataManagementExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </CardTitle>
        </CardHeader>
        {isDataManagementExpanded && (
          <CardContent className="space-y-4">
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
                <span>
                  {(() => {
                    if (exportStatus === 'loading') return t('settings.exporting');
                    if (exportStatus === 'success') return t('settings.exported');
                    return t('settings.export');
                  })()}
                </span>
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
                  <span>
                    {(() => {
                      if (importStatus === 'loading') return t('settings.importing');
                      if (importStatus === 'success') return t('settings.imported');
                      return t('settings.import');
                    })()}
                  </span>
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Clear Data Section */}
      <Card className="bg-white dark:bg-gray-800 border-red-200 dark:border-red-800">
        <CardHeader 
          className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors" 
          onClick={onClearDataExpandedChange}
        >
          <CardTitle className="flex items-center justify-between text-red-600 dark:text-red-400">
            <div className="flex items-center space-x-2">
              <Trash size={20} />
              <span>{t('settings.clearData')}</span>
            </div>
            {isClearDataExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </CardTitle>
        </CardHeader>
        {isClearDataExpanded && (
          <CardContent className="space-y-6">
            {/* Clear Financial Data */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{t('settings.clearPartialData')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('settings.clearPartialDataDescription')}
                </p>
              </div>
              {/* For partial data clear button */}
              <Button
                onClick={() => {
                  if (window.confirm(t('settings.confirmClearPartialData'))) {
                    onClearPartialData();
                  }
                }}
                disabled={clearDataStatus === 'clearing'}
                variant="destructive"
                className="flex items-center space-x-2"
              >
                {(() => {
                  if (clearDataStatus === 'clearing') return t('settings.clearingData');
                  if (clearDataStatus === 'success') return t('settings.dataCleared');
                  return t('settings.clearPartialData');
                })()}
              </Button>
            </div>

            {/* Clear All Data */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="font-medium">{t('settings.clearAllData')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('settings.clearAllDataDescription')}
                </p>
              </div>
              {/* For all data clear button */}
              <Button
                onClick={() => {
                  if (window.confirm(t('settings.confirmClearAllData'))) {
                    onClearAllData();
                  }
                }}
                disabled={clearDataStatus === 'clearing'}
                variant="destructive"
                className="flex items-center space-x-2"
              >
                {(() => {
                  if (clearDataStatus === 'clearing') return t('settings.clearingData');
                  if (clearDataStatus === 'success') return t('settings.dataCleared');
                  return t('settings.clearAllData');
                })()}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Debug Settings Component */}
      {featureFlag_Debug_Settings_View && (
        <DebugSettings
          logs={logs}
          showLogs={showLogs}
          autoRefresh={autoRefresh}
          analytics={analytics}
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
    </div>
  );
};

export default SettingsView;
