import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CollapsibleSection, ConfirmationDialog } from '@ui/shared';
import { Download, Trash, Monitor, Brain, Shield } from 'lucide-react';
import DebugSettings from '@/ui/settings/DebugSettings';
import { featureFlag_Debug_Settings_View } from '@/config/featureFlags';
import { StockAPIProvider } from '@/types/shared/base/enums';
import { DashboardMode } from '@/types/shared/analytics';
import { DividendApiSettingsSection } from '../../../ui/settings/DividendApiSettingsSection';
import { StockApiProviderSection } from '../../../ui/settings/StockApiProviderSection';
import { ClearDataSection } from '../../../ui/settings/ClearDataSection';
import { DeveloperModeSettingsSection } from '../../../ui/settings/DeveloperModeSettingsSection';
import { DataManagementSection } from '../../../ui/settings/DataManagementSection';
import { DashboardSettingsSection } from '../../../ui/settings/DashboardSettingsSection';
import { AboutSection } from '../../../ui/settings/AboutSection';
import { AISettingsContainer } from '@/container/settings/AISettingsContainer';
import { getButtonText } from '@/ui/settings';
import { ClearStatus } from '@/types/shared/ui/clearButton';

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
  // Clear operations - consolidated
  clearStatuses: Record<string, ClearStatus>;
  clearHandlers: Record<string, () => void>;
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
  onApiToggle?: (enabled: boolean) => void;
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
  selectedDiviProvider: string;
  dividendApiKey: { [provider: string]: string };
  onDiviApiKeyChange: (provider: string, apiKey: string) => void;
  onDiviApiKeyRemove: (provider: string) => void;
  onDiviProviderChange: (provider: string) => void;
  formatLogEntry: (logEntry: string) => { timestamp: string; message: string };
  onPortfolioHistoryRefresh?: () => void;
  // Developer Mode Props
  isDeveloperModeEnabled: boolean;
  developerPassword: string;
  developerActivationStatus: 'idle' | 'loading' | 'success' | 'error';
  onDeveloperPasswordChange: (password: string) => void;
  onDeveloperModeActivation: () => void;
  onDeveloperModeDeactivation: () => void;
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
  // Clear operations - consolidated objects
  clearStatuses,
  clearHandlers,
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
  selectedDiviProvider,
  dividendApiKey,
  onDiviApiKeyChange,
  onDiviApiKeyRemove,
  onDiviProviderChange,
  formatLogEntry,
  confirmDialog,
  onCloseConfirmDialog,
  isDividendApiEnabled,
  onDividendApiToggle,
  onPortfolioHistoryRefresh,
  // Developer Mode Props
  isDeveloperModeEnabled,
  developerPassword,
  developerActivationStatus,
  onDeveloperPasswordChange,
  onDeveloperModeActivation,
  onDeveloperModeDeactivation,
}) => {
  const { t } = useTranslation();
  const [showApiKey, setShowApiKey] = useState(false);
  const [tempApiKeys, setTempApiKeys] = useState<Record<StockAPIProvider, string>>({
    [StockAPIProvider.FINNHUB]: apiKeys?.[StockAPIProvider.FINNHUB] ?? '',
    [StockAPIProvider.YAHOO]: apiKeys?.[StockAPIProvider.YAHOO] ?? '',
    [StockAPIProvider.ALPHA_VANTAGE]: apiKeys?.[StockAPIProvider.ALPHA_VANTAGE] ?? '',
    [StockAPIProvider.IEX_CLOUD]: apiKeys?.[StockAPIProvider.IEX_CLOUD] ?? '',
    [StockAPIProvider.TWELVE_DATA]: apiKeys?.[StockAPIProvider.TWELVE_DATA] ?? '',
    [StockAPIProvider.QUANDL]: apiKeys?.[StockAPIProvider.QUANDL] ?? '',
    [StockAPIProvider.EOD_HISTORICAL_DATA]: apiKeys?.[StockAPIProvider.EOD_HISTORICAL_DATA] ?? '',
    [StockAPIProvider.POLYGON_IO]: apiKeys?.[StockAPIProvider.POLYGON_IO] ?? '',
  });

  // Update tempApiKeys when apiKeys prop changes
  useEffect(() => {
    setTempApiKeys({
      [StockAPIProvider.FINNHUB]: apiKeys?.[StockAPIProvider.FINNHUB] ?? '',
      [StockAPIProvider.YAHOO]: apiKeys?.[StockAPIProvider.YAHOO] ?? '',
      [StockAPIProvider.ALPHA_VANTAGE]: apiKeys?.[StockAPIProvider.ALPHA_VANTAGE] ?? '',
      [StockAPIProvider.IEX_CLOUD]: apiKeys?.[StockAPIProvider.IEX_CLOUD] ?? '',
      [StockAPIProvider.TWELVE_DATA]: apiKeys?.[StockAPIProvider.TWELVE_DATA] ?? '',
      [StockAPIProvider.QUANDL]: apiKeys?.[StockAPIProvider.QUANDL] ?? '',
      [StockAPIProvider.EOD_HISTORICAL_DATA]: apiKeys?.[StockAPIProvider.EOD_HISTORICAL_DATA] ?? '',
      [StockAPIProvider.POLYGON_IO]: apiKeys?.[StockAPIProvider.POLYGON_IO] ?? '',
    });
  }, [apiKeys]);

  // Extract button text helpers for reduced complexity
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
        <DashboardSettingsSection
          dashboardMode={dashboardMode}
          onDashboardModeChange={onDashboardModeChange}
        />
      </CollapsibleSection>

      {/* AI Assistant Configuration */}
      <CollapsibleSection
        title={t('settings.ai.title')}
        icon={<Brain size={20} />}
        defaultExpanded={false}
      >
        <AISettingsContainer />
      </CollapsibleSection>
      
      {/* Stock API Configuration */}
      <StockApiProviderSection
        isApiEnabled={isApiEnabled}
        selectedProvider={selectedProvider}
        apiKeys={apiKeys}
        apiKeyStatus={apiKeyStatus}
        apiKeyError={apiKeyError}
        currency={currency}
        isDeveloperModeEnabled={isDeveloperModeEnabled}
        tempApiKeys={tempApiKeys}
        showApiKey={showApiKey}
        onApiToggle={onApiToggle}
        onProviderChange={onProviderChange}
        onApiKeyChange={onApiKeyChange}
        onApiKeyRemove={onApiKeyRemove}
        onCurrencyChange={onCurrencyChange}
        setTempApiKeys={setTempApiKeys}
        setShowApiKey={setShowApiKey}
        apiKeyButtonText={apiKeyButtonText}
      />

      {/* Dividend API Configuration */}
      <DividendApiSettingsSection
        enabled={isDividendApiEnabled}
        selectedProvider={
          selectedDiviProvider
            ? selectedDiviProvider
            : (isDeveloperModeEnabled
                ? 'yahoo'
                : Object.keys(dividendApiKey).find(p => p !== 'yahoo') || '')
        }
        apiKeys={
          Object.fromEntries(
            Object.entries(dividendApiKey || {}).filter(([p]) => isDeveloperModeEnabled || p !== 'yahoo')
          )
        }
        onEnabledChange={onDividendApiToggle}
        onProviderChange={onDiviProviderChange}
        onApiKeyChange={onDiviApiKeyChange}
        onApiKeyRemove={onDiviApiKeyRemove}
        isDeveloperModeEnabled={isDeveloperModeEnabled}
      />

      {/* Data Management */}
      <CollapsibleSection
        title={t('settings.dataManagement')}
        icon={<Download size={20} />}
        defaultExpanded={false}
      >
        <DataManagementSection
          exportStatus={exportStatus}
          importStatus={importStatus}
          importError={importError}
          onExportData={onExportData}
          onImportData={onImportData}
        />
      </CollapsibleSection>

      {/* Clear Data Section */}
      <CollapsibleSection
        title={t("settings.clearData")}
        icon={<Trash size={20} />}
        defaultExpanded={false}
      >
        <ClearDataSection
          clearStatuses={clearStatuses}
          clearHandlers={clearHandlers}
        />
      </CollapsibleSection>

      {/* Developer Mode Settings */}
      <CollapsibleSection
        title={t('settings.developerMode')}
        icon={<Shield size={20} />}
        defaultExpanded={false}
      >
        <DeveloperModeSettingsSection
          isDeveloperModeEnabled={isDeveloperModeEnabled}
          developerPassword={developerPassword}
          developerActivationStatus={developerActivationStatus}
          onDeveloperPasswordChange={onDeveloperPasswordChange}
          onDeveloperModeActivation={onDeveloperModeActivation}
          onDeveloperModeDeactivation={onDeveloperModeDeactivation}
        />
      </CollapsibleSection>
      
      {/* Debug Settings Component */}
      {featureFlag_Debug_Settings_View || isDeveloperModeEnabled && (
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
          pullToRefreshFake={onPortfolioHistoryRefresh}
        />
      )}
      {/* About */}
      <AboutSection
        isDeveloperModeEnabled={isDeveloperModeEnabled}
      />

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
