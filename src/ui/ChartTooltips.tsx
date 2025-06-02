import React from 'react';
import { useTranslation } from 'react-i18next';
import formatService from '../service/formatService';

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
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    return (
      <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow">
        <p className="text-sm font-medium">{name || data.name}</p>
        <p className="text-sm">{formatService.formatCurrency(data.value || data.amount)}</p>
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
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow">
      <p className="text-sm font-medium">{data.name}</p>
      {payload.map((bar, index) => (
        <p 
          key={`${bar.dataKey}-${index}`} 
          className="text-sm"
          style={{ color: index === 0 ? firstBarColor : undefined }}
        >
          {bar.name}: {formatService.formatCurrency(bar.value)}
        </p>
      ))}
    </div>
  );
};
