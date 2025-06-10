import React from 'react';
import { useTranslation } from 'react-i18next';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Card } from '../../common/Card';
import { COLORS_LIGHT, COLORS_DARK } from '../../../utils/constants';
import formatService from '../../../service/formatService';
import { useTheme } from '../../../hooks/useTheme';

interface GenericPieChartData {
  name: string;
  value: number;
  percentage?: number;
  [key: string]: any;
}

interface GenericPieChartProps {
  title: string;
  data: GenericPieChartData[];
  nameKey: string;
  valueKey: string;
  showTitle?: boolean;
  translationKey?: string; // Optional translation key prefix (e.g., "assets.types")
  emptyStateMessage?: string;
  showDirectLabels?: boolean; // Whether to show labels directly on chart without translation
}

const GenericPieChart: React.FC<GenericPieChartProps> = ({
  title,
  data,
  nameKey,
  valueKey,
  showTitle = true,
  translationKey,
  emptyStateMessage,
  showDirectLabels = false
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  
  // Use theme-aware colors
  const colors = theme === 'dark' ? COLORS_DARK : COLORS_LIGHT;

  // Custom tooltip component
  const CustomTooltip: React.FC<{
    active?: boolean;
    payload?: any[];
  }> = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    
    const data = payload?.[0]?.payload;
    if (!data) return null;
    
    // Use translation if key is provided and showDirectLabels is false
    const displayName = !showDirectLabels && translationKey 
      ? t(`${translationKey}.${data[nameKey]}`)
      : data[nameKey];
        
    return (
      <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow">
        <p className="text-sm font-medium">{displayName}</p>
        <p className="text-sm">{formatService.formatCurrency(data[valueKey])}</p>
        <p className="text-sm">({data.percentage ? `${data.percentage.toFixed(1)}%` : formatService.formatPercentage(data.percentage || 0)})</p>
      </div>
    );
  };

  return (
    <Card title={title}>
      <div className="w-full">
        {data.length > 0 ? (
          <div className="flex flex-col">
            {/* Chart container with proper spacing */}
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  {showTitle && (
                    <text
                      x="50%"
                      y="25"
                      textAnchor="middle"
                      className="text-lg font-semibold fill-current"
                    >
                      {title}
                    </text>
                  )}
                  <Pie
                    data={data}
                    cx="50%"
                    cy={showTitle ? "60%" : "50%"}
                    outerRadius={showTitle ? 85 : 100}
                    innerRadius={showTitle ? 40 : 50}
                    fill="#8884d8"
                    dataKey={valueKey}
                  >
                    {data.map((item, index) => (
                      <Cell key={item[nameKey]} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend - Single column layout for better readability */}
            <div className="mt-6 space-y-3 px-4 max-h-48 overflow-y-auto">
              {data.map((item, index) => {
                // Use translation if key is provided and showDirectLabels is false
                const displayName = !showDirectLabels && translationKey 
                  ? t(`${translationKey}.${item[nameKey]}`)
                  : item[nameKey];
                  
                return (
                  <div key={item[nameKey]} className="flex items-center space-x-3 py-1">
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: colors[index % colors.length] }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {displayName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatService.formatCurrency(item[valueKey])}
                        {item.percentage && ` (${item.percentage.toFixed(1)}%)`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">
              {emptyStateMessage || t('common.noData')}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default GenericPieChart;
