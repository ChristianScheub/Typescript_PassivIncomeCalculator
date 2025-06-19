import React from 'react';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../../common/Card';
import { COLORS_LIGHT, COLORS_DARK } from '../../../utils/constants';
import formatService from '../../../service/formatService';
import { useTheme } from '../../../hooks/useTheme';
import { ChartEmptyState } from '../../feedback/EnhancedEmptyState';
import { LineChartData, ChartTooltipPayload } from '../../../types/shared/charts';

interface GenericLineChartProps {
  title: string;
  data: LineChartData[];
  nameKey?: string;
  valueKey?: string;
  emptyStateMessage?: string;
  height?: number;
  showGrid?: boolean;
  color?: string;
}

// Custom tooltip for line chart
const LineChartTooltip: React.FC<ChartTooltipPayload> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  
  const data = payload?.[0]?.payload;
  if (!data) return null;
      
  return (
    <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow">
      <p className="text-sm font-medium">{label}</p>
      <p className="text-sm">{formatService.formatCurrency(data.value)}</p>
    </div>
  );
};

const GenericLineChart: React.FC<GenericLineChartProps> = ({
  title,
  data,
  nameKey = 'name',
  valueKey = 'value',
  emptyStateMessage,
  height = 400,
  showGrid = true,
  color
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  
  // Use theme-aware colors
  const colors = theme === 'dark' ? COLORS_DARK : COLORS_LIGHT;
  const lineColor = color || colors[0];

  return (
    <Card title={title}>
      <div style={{ height: `${height}px` }}>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              {showGrid && (
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} 
                />
              )}
              <XAxis 
                dataKey={nameKey}
                tick={{ fontSize: 12 }}
                stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                tickFormatter={(value) => formatService.formatCurrency(value)}
              />
              <Tooltip content={<LineChartTooltip />} />
              <Line 
                type="monotone" 
                dataKey={valueKey} 
                stroke={lineColor}
                strokeWidth={2}
                dot={{ fill: lineColor, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: lineColor }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <ChartEmptyState
            description={emptyStateMessage || t('emptyStates.charts.noData')}
            variant="minimal"
          />
        )}
      </div>
    </Card>
  );
};

export default GenericLineChart;
