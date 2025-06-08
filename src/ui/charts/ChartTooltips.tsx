import React from 'react';
import { useTranslation } from 'react-i18next';
import formatService from '../../service/formatService';

interface ChartBarTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  translationPrefix?: string;
}

export const ChartBarTooltip: React.FC<ChartBarTooltipProps> = ({ 
  active, 
  payload, 
  label, 
  translationPrefix = 'dashboard'
}) => {
  const { t } = useTranslation();
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow">
      <p className="text-sm font-medium">{label}</p>
      {payload.map((item, index) => (
        <p key={`${item.dataKey}-${index}`} className="text-sm">
          {t(`${translationPrefix}.${item.dataKey}`)}: {formatService.formatCurrency(item.value)}
        </p>
      ))}
    </div>
  );
};

interface ChartPieTooltipProps {
  active?: boolean;
  payload?: any[];
  translationPrefix?: string;
}

export const ChartPieTooltip: React.FC<ChartPieTooltipProps> = ({ 
  active, 
  payload, 
  translationPrefix
}) => {
  const { t } = useTranslation();
  if (!active || !payload?.length) return null;

  const data = payload?.[0]?.payload;
  if (!data) return null;

  const name = data?.category && translationPrefix 
    ? t(`${translationPrefix}.${data.category}`)
    : data.name;
      
  return (
    <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow">
      <p className="text-sm font-medium">{name}</p>
      <p className="text-sm">{formatService.formatCurrency(data.value || data.amount)}</p>
      <p className="text-sm">({formatService.formatPercentage(data.percentage)})</p>
    </div>
  );
};

interface CustomBarTooltipProps {
  active?: boolean;
  payload?: any[];
  name?: string;
}

export const CustomBarTooltip: React.FC<CustomBarTooltipProps> = ({ 
  active, 
  payload,
  name 
}) => {
  const data = payload?.[0]?.payload;
  if (active && data) {
    return (
      <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow">
        <p className="text-sm font-medium">{name || data?.name}</p>
        <p className="text-sm">{formatService.formatCurrency(data?.value || data?.amount)}</p>
      </div>
    );
  }
  return null;
};

interface CustomStackedBarTooltipProps {
  active?: boolean;
  payload?: any[];
  firstBarColor?: string;
}

export const CustomStackedBarTooltip: React.FC<CustomStackedBarTooltipProps> = ({ 
  active, 
  payload,
  firstBarColor 
}) => {
  const { t } = useTranslation();
  const data = payload?.[0]?.payload;
  if (!active || !data) return null;

  const { amount, percentage, firstBar, secondBar } = data;

  return (
    <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow">
      <div className="space-y-1">
        {firstBar?.value && (
          <p className="text-sm" style={{ color: firstBarColor }}>
            {firstBar.name}: {formatService.formatCurrency(firstBar.value)}
          </p>
        )}
        {secondBar?.value && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {secondBar.name}: {formatService.formatCurrency(secondBar.value)}
          </p>
        )}
        {amount && <p className="text-sm">{t('common.total')}: {formatService.formatCurrency(amount)}</p>}
        {percentage && <p className="text-sm">({formatService.formatPercentage(percentage)})</p>}
      </div>
    </div>
  );
};
