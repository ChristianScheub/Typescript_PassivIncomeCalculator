import React from 'react';
import { useTranslation } from 'react-i18next';
import formatService from '../../service/formatService';

interface ChartTooltipProps {
  // Common props
  active?: boolean;
  payload?: any[];
  label?: string;
  
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
  useCustomFormatting?: boolean;
  showTransactions?: boolean;
  firstBarColor?: string;
  
  // Custom translations
  t?: (key: string) => string;
  
  // Additional props
  name?: string;
}

/**
 * Universal chart tooltip component that handles multiple chart types:
 * - Bar charts (regular, stacked)
 * - Pie charts
 * - Line charts
 * - Portfolio history special formatting
 */
export const ChartTooltip: React.FC<ChartTooltipProps> = ({
  active,
  payload,
  label,
  chartType = 'bar',
  formatCurrency: propFormatCurrency,
  formatPercentage: propFormatPercentage,
  translationPrefix = 'dashboard',
  translateItemKey = true,
  nameKey = 'name',
  valueKey = 'value',
  useCustomFormatting = false,
  showTransactions = false,
  firstBarColor,
  t: propT,
  name
}) => {
  const { t: hookT } = useTranslation();
  const t = propT || hookT;
  
  // Use provided formatting functions or fall back to service
  const formatCurrencyFn = propFormatCurrency || formatService.formatCurrency;
  const formatPercentageFn = propFormatPercentage || formatService.formatPercentage;
  
  if (!active || !payload?.length) return null;
  
  const data = payload[0]?.payload;
  if (!data) return null;
  
  // Portfolio history special case
  if (useCustomFormatting && data.formattedDate) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {data.formattedDate}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('portfolio.value')}: {formatCurrencyFn(payload[0].value)}
        </p>
        {showTransactions && data.hasTransactions && (
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            {t('portfolio.transactionDay')}
          </p>
        )}
      </div>
    );
  }
  
  // Stacked bar special case
  if (chartType === 'stacked' && data) {
    const { amount, percentage, firstBar, secondBar } = data;
    
    return (
      <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow">
        <div className="space-y-1">
          {firstBar?.value && (
            <p className="text-sm" style={{ color: firstBarColor }}>
              {firstBar.name}: {formatCurrencyFn(firstBar.value)}
            </p>
          )}
          {secondBar?.value && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {secondBar.name}: {formatCurrencyFn(secondBar.value)}
            </p>
          )}
          {amount && <p className="text-sm">{t('common.total')}: {formatCurrencyFn(amount)}</p>}
          {percentage && <p className="text-sm">({formatPercentageFn(percentage)})</p>}
        </div>
      </div>
    );
  }
  
  // Pie chart case
  if (chartType === 'pie') {
    // Calculate display name with support for category or specific key
    const displayName = (() => {
      if (data.category && translationPrefix) {
        return t(`${translationPrefix}.${data.category}`);
      } else if (data[nameKey] && translationPrefix && translateItemKey) {
        return t(`${translationPrefix}.${data[nameKey]}`);
      } else {
        return data[nameKey] || data.name || name;
      }
    })();
    
    return (
      <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow">
        <p className="text-sm font-medium">{displayName}</p>
        <p className="text-sm">{formatCurrencyFn(data[valueKey] || data.value || data.amount)}</p>
        {data.percentage !== undefined && (
          <p className="text-sm">({formatPercentageFn(data.percentage)})</p>
        )}
      </div>
    );
  }
  
  // Simple bar/line chart (default case)
  if (chartType === 'bar' || chartType === 'line') {
    return (
      <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow">
        <p className="text-sm font-medium">{label || name || data[nameKey] || data.name}</p>
        {Array.isArray(payload) ? (
          payload.map((item, index) => (
            <p key={`${item.dataKey || index}-${index}`} className="text-sm">
              {translateItemKey && item.dataKey 
                ? t(`${translationPrefix}.${item.dataKey}`) 
                : (item.name || item.dataKey)
              }: {formatCurrencyFn(item.value)}
            </p>
          ))
        ) : (
          <p className="text-sm">{formatCurrencyFn(data[valueKey] || data.value || data.amount)}</p>
        )}
      </div>
    );
  }
  
  // Fallback case
  return (
    <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow">
      {label && <p className="text-sm font-medium">{label}</p>}
      <p className="text-sm">{formatCurrencyFn(data[valueKey] || data.value || data.amount)}</p>
    </div>
  );
};

// End of ChartTooltip component
