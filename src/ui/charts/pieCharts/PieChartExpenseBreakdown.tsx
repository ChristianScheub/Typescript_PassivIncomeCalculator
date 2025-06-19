import React from 'react';
import { useTranslation } from 'react-i18next';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Card } from '../../common/Card';
import { ExpenseBreakdown } from '../../../types/domains/financial/entities';
import { COLORS_LIGHT, COLORS_DARK } from '../../../utils/constants';
import formatService from '../../../service/formatService';
import { useTheme } from '../../../hooks/useTheme';
import { RechartsPayload } from '../../../types/shared/charts';

interface PieChartExpenseBreakdownProps {
  readonly expenseBreakdown: ReadonlyArray<ExpenseBreakdown>;
  readonly liabilities?: ReadonlyArray<{ readonly category: string; readonly amount: number }>;
}

interface PieChartExpenseBreakdownTooltipProps {
  active?: boolean;
  payload?: RechartsPayload[];
}

// Move tooltip component outside to avoid recreation on every render
const PieChartExpenseBreakdownTooltip: React.FC<PieChartExpenseBreakdownTooltipProps> = ({ active, payload }) => {
  const { t } = useTranslation();
  
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;
  
  const name = data.type === 'liability'
    ? t(`liabilities.types.${data.category}`)
    : t(`expenses.categories.${data.category}`);
    
  return (
    <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow">
      <p className="text-sm font-medium">{name}</p>
      <p className="text-sm">{formatService.formatCurrency(typeof data.amount === 'number' ? data.amount : 0)}</p>
      {data.percentage && typeof data.percentage === 'number' && (
        <p className="text-sm">({data.percentage.toFixed(1)}%)</p>
      )}
    </div>
  );
};

const PieChartExpenseBreakdown: React.FC<PieChartExpenseBreakdownProps> = ({
  expenseBreakdown = [],
  liabilities = []
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  
  // Use theme-aware colors
  const colors = theme === 'dark' ? COLORS_DARK : COLORS_LIGHT;

  // Calculate total first for percentage calculation
  const total = React.useMemo(() => {
    const expenseTotal = expenseBreakdown
      .filter(expense => expense?.category && expense?.amount)
      .reduce((sum, expense) => sum + expense.amount, 0);
    const liabilityTotal = liabilities
      .filter(liability => liability?.category && liability?.amount)
      .reduce((sum, liability) => sum + liability.amount, 0);
    return expenseTotal + liabilityTotal;
  }, [expenseBreakdown, liabilities]);

  // Create mutable array for Recharts compatibility while keeping our business logic immutable
  const combinedData = React.useMemo(() => Array.from([
    ...expenseBreakdown
      .filter(expense => expense?.category && expense?.amount)
      .map(expense => ({
        category: expense.category,
        amount: expense.amount,
        percentage: total > 0 ? (expense.amount / total) * 100 : 0,
        type: 'expense' as const,
        id: `expense-${expense.category}`
      })),
    ...liabilities
      .filter(liability => liability?.category && liability?.amount)
      .map(liability => ({
        category: liability.category,
        amount: liability.amount,
        percentage: total > 0 ? (liability.amount / total) * 100 : 0,
        type: 'liability' as const,
        id: `liability-${liability.category}`
      }))
  ]), [expenseBreakdown, liabilities, total]);

  return (
    <Card title={t('forecast.expenseBreakdown')}>
      <div className="w-full">
        {combinedData.length > 0 ? (
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
                    {t('forecast.expenseBreakdown')}
                  </text>
                  <Pie
                    data={combinedData}
                    cx="50%"
                    cy="60%"
                    outerRadius={85}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {combinedData.map((entry) => (
                      <Cell 
                        key={entry.id}
                        fill={entry.type === 'liability' ? '#ef4444' : colors[combinedData.findIndex(d => d.category === entry.category) % colors.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<PieChartExpenseBreakdownTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend - Single column layout for better readability */}
            <div className="mt-6 space-y-3 px-4 max-h-48 overflow-y-auto">
              {combinedData.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 py-1">
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0" 
                    style={{ 
                      backgroundColor: item.type === 'liability' ? '#ef4444' : colors[combinedData.findIndex(d => d.category === item.category) % colors.length]
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {item.type === 'liability'
                        ? t(`liabilities.types.${item.category}`)
                        : t(`expenses.categories.${item.category}`)
                      }
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatService.formatCurrency(item.amount)}
                      {total > 0 && ` (${item.percentage.toFixed(1)}%)`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">{t('forecast.noData')}</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PieChartExpenseBreakdown;
