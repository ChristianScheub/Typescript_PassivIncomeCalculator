import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setDividendApiEnabled, setDividendApiProvider, setDividendApiKey, DividendApiProvider } from '@/store/slices/dividendApiConfigSlice';
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/common/Card';
import { CollapsibleSection } from '@/ui/common/CollapsibleSection';
import { Toggle } from '@/ui/common/Toggle';
import { Button } from '@/ui/common/Button';
import { ButtonGroup } from '@/ui/common/ButtonGroup';
import { Key } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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

export const DividendApiSettingsSection: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { enabled, selectedProvider, apiKeys } = useSelector((state: RootState) => state.dividendApiConfig);
  const [tempApiKey, setTempApiKey] = useState(apiKeys[selectedProvider] || '');
  const [showApiKey, setShowApiKey] = useState(false);

  const handleProviderChange = (provider: DividendApiProvider) => {
    dispatch(setDividendApiProvider(provider));
    setTempApiKey(apiKeys[provider] || '');
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
            onChange={(checked) => dispatch(setDividendApiEnabled(checked))}
            id="dividend-api-toggle"
            label={t('settings.enableDividendApi')}
          />
        </div>
        {enabled && (
          <div>
            <h3 className="font-medium">{t('settings.selectDividendApiProvider')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {(['yahoo', 'finnhub'] as DividendApiProvider[]).map((provider) => {
                const info = providerInfo[provider];
                const isSelected = selectedProvider === provider;
                return (
                  <div
                    key={provider}
                    onClick={() => handleProviderChange(provider)}
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
            {providerInfo[selectedProvider].requiresApiKey && (
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
                    {showApiKey ? '🙈' : '👁️'}
                  </button>
                </div>
                <Button
                  onClick={() => dispatch(setDividendApiKey({ provider: selectedProvider, key: tempApiKey }))}
                  disabled={!tempApiKey.trim()}
                >
                  {t('settings.saveApiKey')}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
};
