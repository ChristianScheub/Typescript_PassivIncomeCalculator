import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/ui/common/Button';
import { Eye, EyeOff } from 'lucide-react';
import { StockAPIProvider } from '@/store/slices/apiConfigSlice';

interface StockApiSettingsSectionProps {
  providerInfo: Record<StockAPIProvider, {
    name: string;
    description: string;
    keyPlaceholder: string;
    website: string;
    requiresApiKey: boolean;
  }>;
  selectedProvider: StockAPIProvider;
  tempApiKeys: Record<StockAPIProvider, string>;
  setTempApiKeys: React.Dispatch<React.SetStateAction<Record<StockAPIProvider, string>>>;
  showApiKey: boolean;
  setShowApiKey: (show: boolean) => void;
  apiKeyError: string | null;
  apiKeyStatus: 'idle' | 'saving' | 'success' | 'error';
  apiKeys?: Record<StockAPIProvider, string>;
  apiKeyButtonText: string;
  onApiKeyChange: (provider: StockAPIProvider, apiKey: string) => void;
  onApiKeyRemove: (provider: StockAPIProvider) => void;
}

export const StockApiSettingsSection: React.FC<StockApiSettingsSectionProps> = ({
  providerInfo,
  selectedProvider,
  tempApiKeys,
  setTempApiKeys,
  showApiKey,
  setShowApiKey,
  apiKeyError,
  apiKeyStatus,
  apiKeys,
  apiKeyButtonText,
  onApiKeyChange,
  onApiKeyRemove,
}) => {
  const { t } = useTranslation();
  const provider = providerInfo[selectedProvider];
  if (!provider || !provider.requiresApiKey) return null;

  return (
    <div>
      <h3 className="font-medium">
        {t('settings.apiKeyFor', { provider: provider.name })}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
        {t('settings.getApiKeyFrom')}{' '}
        <a
          href={provider.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-600 underline"
        >
          {provider.name}
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
            placeholder={provider.keyPlaceholder}
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
  );
};
