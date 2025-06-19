import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTranslation } from 'react-i18next';
import { BarChartData, GenericChartProps, ChartEventHandlers } from '../../../types/shared/charts';
import TypedChartTooltip from '../TypedChartTooltip';

interface GenericBarChartProps<T extends BarChartData = BarChartData> extends GenericChartProps<T>, ChartEventHandlers<T> {
  title: string;
  nameKey: keyof T;
  valueKey: keyof T;
  translationKey?: string;
  emptyStateMessage?: string;
  orientation?: 'horizontal' | 'vertical';
  formatValue?: (value: number) => string;
}

const GenericBarChart = <T extends BarChartData = BarChartData>({
  title,
  data,
  nameKey,
  valueKey,
  translationKey,
  emptyStateMessage = 'No data available',
  orientation = 'vertical',
  width,
  height = 300,
  margin,
  onBarClick,
  formatValue = (value: number) => `€${value.toLocaleString()}`
}: GenericBarChartProps<T>) => {
  const { t } = useTranslation();

  // Color palette for bars
  const colors = [
    '#3B82F6', // blue-500
    '#10B981', // emerald-500
    '#F59E0B', // amber-500
    '#EF4444', // red-500
    '#8B5CF6', // violet-500
    '#06B6D4', // cyan-500
    '#F97316', // orange-500
    '#84CC16', // lime-500
    '#EC4899', // pink-500
    '#6B7280'  // gray-500
  ];

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toFixed(0);
  };

  const getTranslatedName = (name: string | number) => {
    if (translationKey) {
      try {
        return t(`${translationKey}.${name}`, String(name));
      } catch {
        return String(name);
      }
    }
    return String(name);
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {title}
        </h3>
        <div className="flex items-center justify-center h-48 text-gray-500 dark:text-gray-400">
          {emptyStateMessage}
        </div>
      </div>
    );
  }

  // Prepare data with translated names and color assignment
  const chartData = data.map((item, index) => ({
    ...item,
    displayName: getTranslatedName(item[nameKey]),
    color: colors[index % colors.length]
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        {title}
      </h3>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {orientation === 'vertical' ? (
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="displayName"
                tick={{ fontSize: 12, fill: 'currentColor' }}
                tickLine={{ stroke: 'currentColor' }}
                axisLine={{ stroke: 'currentColor' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: 'currentColor' }}
                tickLine={{ stroke: 'currentColor' }}
                axisLine={{ stroke: 'currentColor' }}
                tickFormatter={formatValue}
              />
              <Tooltip content={<CustomTooltip formatValue={formatValue} />} />
              <Bar dataKey={valueKey} radius={[4, 4, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell key={`cell-${entry.displayName}-${entry[valueKey]}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <BarChart
              layout="horizontal"
              data={chartData}
              margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                type="number"
                tick={{ fontSize: 12, fill: 'currentColor' }}
                tickLine={{ stroke: 'currentColor' }}
                axisLine={{ stroke: 'currentColor' }}
                tickFormatter={formatValue}
              />
              <YAxis 
                type="category"
                dataKey="displayName"
                tick={{ fontSize: 12, fill: 'currentColor' }}
                tickLine={{ stroke: 'currentColor' }}
                axisLine={{ stroke: 'currentColor' }}
                width={80}
              />
              <Tooltip content={<CustomTooltip formatValue={formatValue} />} />
              <Bar dataKey={valueKey} radius={[0, 4, 4, 0]}>
                {chartData.map((entry) => (
                  <Cell key={`cell-${entry.displayName}-${entry[valueKey]}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3">
        {chartData.slice(0, 8).map((item) => (
          <div key={`legend-${item.displayName}`} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-sm" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {item.displayName}
            </span>
          </div>
        ))}
        {chartData.length > 8 && (
          <div className="text-sm text-gray-500 dark:text-gray-500">
            +{chartData.length - 8} more
          </div>
        )}
      </div>
    </div>
  );
};

export default GenericBarChart;
