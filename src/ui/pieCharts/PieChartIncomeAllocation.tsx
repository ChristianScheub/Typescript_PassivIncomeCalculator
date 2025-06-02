import React from 'react';
import { useTranslation } from 'react-i18next';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Card } from '../Card';
import { CustomPieTooltip } from '../CustomPieTooltip';
import { IncomeAllocation } from '../../types';
import { COLORS } from '../../utils/constants';
import formatService from '../../service/formatService';

interface PieChartIncomeAllocationProps {
  readonly incomeAllocation: ReadonlyArray<IncomeAllocation>;
}

const PieChartIncomeAllocation: React.FC<PieChartIncomeAllocationProps> = ({
  incomeAllocation = []
}) => {
  const { t } = useTranslation();

  // Transform the data with unique IDs and computed indices
  const chartData = React.useMemo(() => Array.from(
    incomeAllocation.map((income) => ({
      ...income,
      id: `income-${income.type}`
    }))
  ), [incomeAllocation]);

  return (
    <Card title={t('forecast.incomeAllocation')}>
      <div className="h-[400px]">
        {chartData.length > 0 ? (
          <ResponsiveContainer>
            <PieChart>
              <text
                x="50%"
                y="20"
                textAnchor="middle"
                className="text-lg font-semibold"
              >
                {t('forecast.incomeAllocation')}
              </text>
              <Pie
                data={chartData}
                cx="50%"
                cy="55%"
                outerRadius={120}
                innerRadius={60}
                fill="#8884d8"
                dataKey="amount"
              >
                {chartData.map((income) => (
                  <Cell key={income.id} fill={COLORS[chartData.findIndex(i => i.type === income.type) % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip formatCurrency={formatService.formatCurrency} formatPercentage={(value) => `${(value * 100).toFixed(1)}%`} />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">{t('forecast.noIncomeData')}</p>
          </div>
        )}
      </div>
      
      {chartData.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {chartData.map((income) => (
            <div key={income.id} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: COLORS[chartData.findIndex(i => i.type === income.type) % COLORS.length] }}
              />
              <div>
                <div className="text-sm font-medium">{t(`income.types.${income.type}`)}</div>
                <div className="text-sm text-gray-500">
                  {formatService.formatCurrency(income.amount)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default PieChartIncomeAllocation;
