import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Download, Upload, Eye, EyeOff, Key, ChevronRight, ChevronDown, Trash } from 'lucide-react';
import DebugSettings from '../ui/DebugSettings';
import { featureFlag_Debug_Settings_View } from '../config/featureFlags';

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
  apiKey: string;
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
  onApiKeyChange: (apiKey: string) => void;
  onApiKeyRemove: () => void;
  onCurrencyChange: (currency: 'EUR' | 'USD') => void;
  onClearPartialData: () => void;
  onClearAllData: () => void;
  formatLogEntry: (logEntry: string) => { timestamp: string; message: string };
  getLogLevel: (message: string) => string;
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
  apiKey,
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
  onCurrencyChange,
  onClearPartialData,
  onClearAllData,
  formatLogEntry,
  getLogLevel,
  getLogLevelColor
}) => {
  const { t } = useTranslation();
  const [showApiKey, setShowApiKey] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(apiKey);

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
                  <span className="absolute bg-white w-6 h-6 left-1 top-1 rounded-full transition-transform duration-300 peer-checked:translate-x-6" />
                </label>
              </div>
            </div>

            <div>
              <h3 className="font-medium">{t('settings.finnhubApiKey')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {t('settings.getFinnhubKey')}{' '}
                <a 
                  href="https://finnhub.io" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 underline"
                >
                  finnhub.io
                </a>
                {' '}{t('settings.toEnableStockData')}
              </p>
              
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    placeholder={t('settings.enterFinnhubApiKey')}
                    className={`w-full px-3 py-2 pr-10 border rounded-md ${
                      isApiEnabled 
                        ? 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100' 
                        : 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                    }`}
                    disabled={!isApiEnabled}
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                      isApiEnabled 
                        ? 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300' 
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                    disabled={!isApiEnabled}
                  >
                    {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                
                {apiKeyError && (
                  <p className="text-sm text-red-500">{apiKeyError}</p>
                )}
                
                <div className="flex space-x-2">
                  <Button
                    onClick={() => onApiKeyChange(tempApiKey)}
                    disabled={!isApiEnabled || apiKeyStatus === 'saving' || !tempApiKey.trim()}
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
                  
                  {apiKey && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        onApiKeyRemove();
                        setTempApiKey('');
                      }}
                      disabled={!isApiEnabled}
                      className="text-red-600 hover:text-red-700"
                    >
                      {t('common.remove')}
                    </Button>
                  )}
                </div>
                
                {apiKey && (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {t('settings.apiKeyConfigured')}
                  </p>
                )}
              </div>
            </div>
            
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
                {clearDataStatus === 'clearing' ? t('settings.clearingData') :
                 clearDataStatus === 'success' ? t('settings.dataCleared') :
                 t('settings.clearPartialData')}
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
                {clearDataStatus === 'clearing' ? t('settings.clearingData') :
                 clearDataStatus === 'success' ? t('settings.dataCleared') :
                 t('settings.clearAllData')}
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
          getLogLevel={getLogLevel}
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
