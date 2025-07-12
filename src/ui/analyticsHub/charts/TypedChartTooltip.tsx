import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChartTooltipPayload, BaseChartData } from '@/types/shared/charts';
import formatService from '@/service/infrastructure/formatService';

interface TypedChartTooltipProps extends ChartTooltipPayload {
  // Chart type specific props
  chartType?: 'bar' | 'pie' | 'line' | 'stacked';
  
  // Formatting props
  formatCurrency?: (value: number) => string;
  formatPercentage?: (value: number) => string;
  
  // Content props
  translationPrefix?: string;
  translateItemKey?: boolean;
  nameKey?: string;
  valueKey?: string;
  
  // Special cases
  showTransactions?: boolean;
  
  // Custom translations
  t?: (key: string) => string;
  
  // Additional props
  name?: string;
}

// Type guards for safe value extraction
const getNumericValue = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

const getStringValue = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return '';
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  // For objects and other complex types, return empty string to avoid '[object Object]'
  return '';
};

/**
 * Type-safe chart tooltip component that handles multiple chart types
 */
export const TypedChartTooltip: React.FC<TypedChartTooltipProps> = ({
  active,
  payload,
  label,
  chartType = 'bar',
  formatCurrency: propFormatCurrency,
  formatPercentage: propFormatPercentage,
  translationPrefix = 'dashboard',
  translateItemKey = false,
  nameKey = 'name',
  valueKey = 'value',
  showTransactions = false,
  t: customT,
  name
}) => {
  const { t: i18nT } = useTranslation();
  const t = customT || i18nT;

  // Formatting functions
  const formatCurrencyFn = propFormatCurrency || formatService.formatCurrency;
  const formatPercentageFn = propFormatPercentage || formatService.formatPercentage;

  if (!active || !payload || payload.length === 0) {
    return null;
  }

  // Extract data safely
  const payloadItem = payload[0];
  const data = (payloadItem?.payload as BaseChartData) || {};
  const value = getNumericValue(payloadItem?.value);

  // Portfolio history special case (line charts with change data)
  if (chartType === 'line' && 'change' in data) {
    const change = getNumericValue(data.change);
    const changePercentage = getNumericValue(data.changePercentage);
    
    return (
      <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm">{t('portfolio.totalValue')}: {formatCurrencyFn(value)}</p>
        <p className="text-sm">
          {t('portfolio.change')}: {formatCurrencyFn(change)} 
          ({formatPercentageFn(changePercentage)})
        </p>
        {showTransactions && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t('portfolio.transactionDay')}
          </p>
        )}
      </div>
    );
  }
  
  // Stacked bar special case
  if (chartType === 'stacked') {
    const amount = getNumericValue(data.value || value);
    const percentage = getNumericValue(data.percentage);
    
    return (
      <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow">
        <div className="space-y-1">
          <p className="text-sm font-medium">{label}</p>
          {amount > 0 && (
            <p className="text-sm">{t('common.total')}: {formatCurrencyFn(amount)}</p>
          )}
          {percentage > 0 && (
            <p className="text-sm">({formatPercentageFn(percentage)})</p>
          )}
        </div>
      </div>
    );
  }
  
  // Pie chart case
  if (chartType === 'pie') {
    const displayName = (() => {
      if (data.category && translationPrefix) {
        return t(`${translationPrefix}.${data.category}`);
      } else if (data[nameKey] && translationPrefix && translateItemKey) {
        return t(`${translationPrefix}.${getStringValue(data[nameKey])}`);
      } else {
        return getStringValue(data[nameKey] || data.name || name);
      }
    })();

    const displayValue = getNumericValue(data[valueKey] || data.value || value);
    const percentage = getNumericValue(data.percentage);
    
    return (
      <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow">
        <p className="text-sm font-medium">{displayName}</p>
        <p className="text-sm">{formatCurrencyFn(displayValue)}</p>
        {percentage > 0 && (
          <p className="text-sm">({formatPercentageFn(percentage)})</p>
        )}
      </div>
    );
  }

  // Default case (bar charts, line charts without special formatting)
  const displayName = getStringValue(data[nameKey] || data.name || name || label);
  const displayValue = getNumericValue(data[valueKey] || data.value || value);
  
  return (
    <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow">
      <p className="text-sm font-medium">{displayName}</p>
      <p className="text-sm">{formatCurrencyFn(displayValue)}</p>
    </div>
  );
};

export default TypedChartTooltip;
