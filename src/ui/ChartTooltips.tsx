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
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow">
        <p className="text-sm font-medium">{label}</p>
        {payload.map((item, index) => (
          <p key={index} className="text-sm">
            {t(`${translationPrefix}.${item.dataKey}`)}: {formatService.formatCurrency(item.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
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
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    let name;
    
    if (data.category && translationPrefix) {
      name = t(`${translationPrefix}.${data.category}`);
    } else {
      name = data.name;
    }
      
    return (
      <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow">
        <p className="text-sm font-medium">{name}</p>
        <p className="text-sm">{formatService.formatCurrency(data.value || data.amount)}</p>
        <p className="text-sm">({formatService.formatPercentage(data.percentage)})</p>
      </div>
    );
  }
  return null;
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
  stackId?: string;
  firstBarColor?: string;
  secondBarColor?: string;
  firstBarLabel?: string;
  secondBarLabel?: string;
}

export const CustomStackedBarTooltip: React.FC<CustomStackedBarTooltipProps> = ({
  active,
  payload,
  stackId,
  firstBarColor,
  secondBarColor,
  firstBarLabel,
  secondBarLabel
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow">
        <p className="text-sm font-medium">{payload[0].payload.name}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <p 
              key={index} 
              className="text-sm"
              style={{ color: index === 0 ? firstBarColor : secondBarColor }}
            >
              {index === 0 ? firstBarLabel : secondBarLabel}: {formatService.formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      </div>
    );
  }
  return null;
};
