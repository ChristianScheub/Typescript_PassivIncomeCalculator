import React from 'react';
import { useTranslation } from 'react-i18next';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Card } from '../../common/Card';
import { IncomeAllocation } from '@/types/domains/analytics';
import { COLORS_LIGHT, COLORS_DARK } from '../../../utils/constants';
import formatService from '../../../service/formatService';
import { useTheme } from '../../../hooks/useTheme';

interface PieChartIncomeAllocationProps {
  readonly incomeAllocation: ReadonlyArray<IncomeAllocation>;
}

// Custom tooltip for income allocation
const IncomeTooltip: React.FC<{
  active?: boolean;
  payload?: any[];
}> = ({ active, payload }) => {
  const { t } = useTranslation();
  
  if (!active || !payload?.length) return null;
  
  const data = payload?.[0]?.payload;
  if (!data) return null;
  
  const name = t(`income.types.${data.type}`);
      
  return (
    <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow">
      <p className="text-sm font-medium">{name}</p>
      <p className="text-sm">{formatService.formatCurrency(data.amount)}</p>
      <p className="text-sm">({data.percentage.toFixed(1)}%)</p>
    </div>
  );
};

const PieChartIncomeAllocation: React.FC<PieChartIncomeAllocationProps> = ({
  incomeAllocation = []
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  
  // Use theme-aware colors
  const colors = theme === 'dark' ? COLORS_DARK : COLORS_LIGHT;

  // Transform the data with unique IDs and computed indices
  const chartData = React.useMemo(() => Array.from(
    incomeAllocation.map((income) => ({
      ...income,
      id: `income-${income.type}`
    }))
  ), [incomeAllocation]);

  return (
    <Card title={t('forecast.incomeAllocation')}>
      <div className="w-full">
        {chartData.length > 0 ? (
          <div className="flex flex-col">
            {/* Chart container with proper spacing */}
            <div className="h-[280px] w-full">
              <ResponsiveContainer>
                <PieChart>
                  <text
                    x="50%"
                    y="25"
                    textAnchor="middle"
                    className="text-lg font-semibold fill-current"
                  >
                    {t('forecast.incomeAllocation')}
                  </text>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="60%"
                    outerRadius={85}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {chartData.map((income) => (
                      <Cell key={income.id} fill={colors[chartData.findIndex(i => i.type === income.type) % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<IncomeTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend - Single column layout for better readability */}
            <div className="mt-6 space-y-3 px-4 max-h-48 overflow-y-auto">
              {chartData.map((income) => (
                <div key={income.id} className="flex items-center space-x-3 py-1">
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: colors[chartData.findIndex(i => i.type === income.type) % colors.length] }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {t(`income.types.${income.type}`)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatService.formatCurrency(income.amount)} ({income.percentage.toFixed(1)}%)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">{t('forecast.noIncomeData')}</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PieChartIncomeAllocation;
