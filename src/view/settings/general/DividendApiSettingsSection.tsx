import React, { useState } from 'react';
import { Key, Eye, EyeOff } from 'lucide-react';
import { CollapsibleSection } from '@/ui/common/CollapsibleSection';
import { Toggle } from '@/ui/common/Toggle';
import { Button } from '@/ui/common/Button';
import { useTranslation } from 'react-i18next';
import sqliteService from '@service/infrastructure/sqlLiteService';
import { calculateDividendCAGRForYears, generateDividendForecast } from '@/utils/dividendHistoryUtils';

interface DividendApiSettingsSectionProps {
  enabled: boolean;
  selectedProvider: string;
  apiKeys: { [provider: string]: string };
  onEnabledChange: (enabled: boolean) => void;
  onProviderChange: (provider: string) => void;
  onApiKeyChange: (provider: string, apiKey: string) => void;
  onApiKeyRemove: (provider: string) => void;
}

const providerInfo = {
  yahoo: {
    name: 'Yahoo Finance',
    description: 'Dividenden werden automatisch von Yahoo Finance abgerufen. Kein API-Key nötig.',
    website: 'https://finance.yahoo.com',
    requiresApiKey: false,
  },
  finnhub: {
    name: 'Finnhub',
    description: 'Dividenden können von Finnhub abgerufen werden. API-Key erforderlich.',
    website: 'https://finnhub.io',
    requiresApiKey: true,
  },
};

export const DividendApiSettingsSection: React.FC<DividendApiSettingsSectionProps> = ({
  enabled,
  selectedProvider,
  apiKeys,
  onEnabledChange,
  onProviderChange,
  onApiKeyChange,
  onApiKeyRemove,
}) => {
  const { t } = useTranslation();
  const safeProvider = selectedProvider && providerInfo[selectedProvider as 'yahoo' | 'finnhub'] ? selectedProvider : 'yahoo';
  const safeApiKey = apiKeys && apiKeys[safeProvider] !== undefined ? apiKeys[safeProvider] : '';
  const [tempApiKey, setTempApiKey] = useState(safeApiKey);
  const [showApiKey, setShowApiKey] = useState(false);

  React.useEffect(() => {
    setTempApiKey(apiKeys && apiKeys[safeProvider] !== undefined ? apiKeys[safeProvider] : '');
  }, [safeProvider, apiKeys]);

  // Button-Handler: Prognose für alle Assets neu berechnen
  const handleRecalculateForecasts = async () => {
    const allAssets = await sqliteService.getAll('assetDefinitions');
    for (const asset of allAssets) {
      if (asset.dividendHistory && asset.dividendHistory.length > 0) {
        asset.dividendGrowthPast3Y = calculateDividendCAGRForYears(asset.dividendHistory, 3) ?? 0;
        asset.dividendForecast3Y = generateDividendForecast(asset.dividendHistory, 3);
        await sqliteService.update('assetDefinitions', asset);
      }
    }
  };

  return (
    <CollapsibleSection
      title={t('settings.dividendApiConfig')}
      icon={<Key size={20} />}
      defaultExpanded={false}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">{t('settings.enableDividendApi')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('settings.enableDividendApiDescription')}
            </p>
          </div>
          <Toggle
            checked={enabled}
            onChange={onEnabledChange}
            id="dividend-api-toggle"
            label={t('settings.enableDividendApi')}
          />
        </div>
        {enabled && (
          <div>
            <h3 className="font-medium">{t('settings.selectDividendApiProvider')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {(['yahoo', 'finnhub'] as string[]).map((provider) => {
                const info = providerInfo[provider as 'yahoo' | 'finnhub'];
                const isSelected = selectedProvider === provider;
                return (
                  <div
                    key={provider}
                    onClick={() => onProviderChange(provider)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{info.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{info.description}</div>
                      </div>
                      {isSelected && (
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded">
                          {t('settings.active')}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {providerInfo[safeProvider as 'yahoo' | 'finnhub'].requiresApiKey && (
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    placeholder={t('settings.enterFinnhubApiKey')}
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
                <div className="flex space-x-2">
                  <Button
                    onClick={() => onApiKeyChange(safeProvider, tempApiKey)}
                    disabled={!tempApiKey.trim()}
                  >
                    {t('settings.saveApiKey')}
                  </Button>
                  {apiKeys?.[safeProvider] && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        onApiKeyRemove(safeProvider);
                        setTempApiKey('');
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      {t('common.remove')}
                    </Button>
                  )}
                </div>
                {apiKeys?.[safeProvider] && (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {t('settings.apiKeyConfigured')}
                  </p>
                )}
              </div>
            )}
            <div className="flex justify-end mt-4">
              <Button onClick={handleRecalculateForecasts} variant="outline">
                {t('settings.recalculateDividendForecasts') || 'Dividendenprognose aktualisieren'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
};
