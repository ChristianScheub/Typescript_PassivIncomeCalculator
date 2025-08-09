import React from 'react';
import { Key } from 'lucide-react';
import { CollapsibleSection, Toggle } from '@ui/shared';
import { useTranslation } from 'react-i18next';
import { StockAPIProvider } from '@/types/shared/base/enums';
import { StockApiSettingsSection } from './StockApiSettingsSection';

interface ProviderInfo {
  name: string;
  description: string;
  keyPlaceholder: string;
  website: string;
  requiresApiKey: boolean;
}

type ProviderInfoMap = Record<StockAPIProvider, ProviderInfo>;

interface StockApiProviderSectionProps {
  isApiEnabled: boolean;
  selectedProvider: StockAPIProvider;
  apiKeys?: { [K in StockAPIProvider]?: string };
  apiKeyStatus: 'idle' | 'saving' | 'success' | 'error';
  apiKeyError: string | null;
  currency: 'EUR' | 'USD';
  isDeveloperModeEnabled: boolean;
  tempApiKeys: Record<StockAPIProvider, string>;
  showApiKey: boolean;
  onApiToggle?: (enabled: boolean) => void;
  onProviderChange: (provider: StockAPIProvider) => void;
  onApiKeyChange: (provider: StockAPIProvider, apiKey: string) => void;
  onApiKeyRemove: (provider: StockAPIProvider) => void;
  onCurrencyChange: (currency: 'EUR' | 'USD') => void;
  setTempApiKeys: React.Dispatch<React.SetStateAction<Record<StockAPIProvider, string>>>;
  setShowApiKey: React.Dispatch<React.SetStateAction<boolean>>;
  apiKeyButtonText: string;
}

export const StockApiProviderSection: React.FC<StockApiProviderSectionProps> = ({
  isApiEnabled,
  selectedProvider,
  apiKeys,
  apiKeyStatus,
  apiKeyError,
  currency,
  isDeveloperModeEnabled,
  tempApiKeys,
  showApiKey,
  onApiToggle,
  onProviderChange,
  onApiKeyChange,
  onApiKeyRemove,
  onCurrencyChange,
  setTempApiKeys,
  setShowApiKey,
  apiKeyButtonText,
}) => {
  const { t } = useTranslation();

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
    },
    [StockAPIProvider.IEX_CLOUD]: {
      name: 'IEX Cloud',
      description: 'Real-time and historical financial data from IEX Cloud',
      keyPlaceholder: 'Enter your IEX Cloud API key',
      website: 'https://iexcloud.io',
      requiresApiKey: true
    },
    [StockAPIProvider.TWELVE_DATA]: {
      name: 'Twelve Data',
      description: 'Real-time and historical financial data from Twelve Data API',
      keyPlaceholder: 'Enter your Twelve Data API key',
      website: 'https://twelvedata.com',
      requiresApiKey: true
    },
    [StockAPIProvider.QUANDL]: {
      name: 'Quandl (Nasdaq Data Link)',
      description: 'Financial and economic data from Quandl/Nasdaq Data Link',
      keyPlaceholder: 'Enter your Quandl API key',
      website: 'https://data.nasdaq.com',
      requiresApiKey: true
    },
    [StockAPIProvider.EOD_HISTORICAL_DATA]: {
      name: 'EOD Historical Data',
      description: 'End-of-day and real-time financial data',
      keyPlaceholder: 'Enter your EOD Historical Data API key',
      website: 'https://eodhistoricaldata.com',
      requiresApiKey: true
    },
    [StockAPIProvider.POLYGON_IO]: {
      name: 'Polygon.io',
      description: 'Real-time and historical stock market data from Polygon.io',
      keyPlaceholder: 'Enter your Polygon.io API key',
      website: 'https://polygon.io',
      requiresApiKey: true
    }
  };

  return (
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
            onChange={onApiToggle || (() => {})}
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
              {Object.values(StockAPIProvider)
                .filter((provider) => {
                  // Yahoo Finance nur im Developer Mode auswählbar
                  if (provider === StockAPIProvider.YAHOO && !isDeveloperModeEnabled) return false;
                  return true;
                })
                .map((provider) => {
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
                [StockAPIProvider.IEX_CLOUD]: apiKeys?.[StockAPIProvider.IEX_CLOUD] ?? '',
                [StockAPIProvider.TWELVE_DATA]: apiKeys?.[StockAPIProvider.TWELVE_DATA] ?? '',
                [StockAPIProvider.QUANDL]: apiKeys?.[StockAPIProvider.QUANDL] ?? '',
                [StockAPIProvider.EOD_HISTORICAL_DATA]: apiKeys?.[StockAPIProvider.EOD_HISTORICAL_DATA] ?? '',
                [StockAPIProvider.POLYGON_IO]: apiKeys?.[StockAPIProvider.POLYGON_IO] ?? '',
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
  );
};
