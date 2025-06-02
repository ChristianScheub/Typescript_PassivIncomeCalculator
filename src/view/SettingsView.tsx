import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Download, Upload, Moon, Sun } from 'lucide-react';
import LanguageSelector from '../ui/LanguageSelector';
import DebugSettings from '../ui/DebugSettings';
import { featureFlag_Debug_Settings_View } from '../config/featureFlags';

interface SettingsViewProps {
  theme: string;
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
  onThemeChange: () => void;
  onExportData: () => void;
  onImportData: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleLogs: () => void;
  onRefreshLogs: () => void;
  onExportLogs: () => void;
  onClearLogs: () => void;
  onAutoRefreshChange: (enabled: boolean) => void;
  formatLogEntry: (logEntry: string) => { timestamp: string; message: string };
  getLogLevel: (message: string) => string;
  getLogLevelColor: (level: string) => string;
}

const SettingsView: React.FC<SettingsViewProps> = ({
  theme,
  exportStatus,
  importStatus,
  importError,
  logs,
  showLogs,
  autoRefresh,
  analytics,
  onThemeChange,
  onExportData,
  onImportData,
  onToggleLogs,
  onRefreshLogs,
  onExportLogs,
  onClearLogs,
  onAutoRefreshChange,
  formatLogEntry,
  getLogLevel,
  getLogLevelColor
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('navigation.settings')}</h1>
      
      {/* Appearance */}
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle>{t('settings.appearance')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">{t('settings.theme')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('settings.themeDescription')}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={onThemeChange}
              className="flex items-center space-x-2"
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              <span>{theme === 'light' ? t('settings.darkMode') : t('settings.lightMode')}</span>
            </Button>
          </div>

          {/* Language Selector */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="font-medium">{t('settings.language')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('settings.languageDescription')}
              </p>
            </div>
            <LanguageSelector />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle>{t('settings.dataManagement')}</CardTitle>
        </CardHeader>
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
              <strong>Passive Income Calculator</strong>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Version 1.0.0
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Track your assets, liabilities, income, and expenses to achieve financial independence.
            </p>
            
            {featureFlag_Debug_Settings_View && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-yellow-600 dark:text-yellow-400 font-mono">
                  🚧 Debug Mode Active
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Additional debugging features are enabled. Disable in production.
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
