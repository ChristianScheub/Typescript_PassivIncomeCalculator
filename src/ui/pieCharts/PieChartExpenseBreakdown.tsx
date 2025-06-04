import React from 'react';
import { useTranslation } from 'react-i18next';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Card } from '../Card';
import { ExpenseBreakdown } from '../../types';
import { COLORS } from '../../utils/constants';
import formatService from '../../service/formatService';


interface PieChartExpenseBreakdownProps {
  readonly expenseBreakdown: ReadonlyArray<ExpenseBreakdown>;
  readonly liabilities?: ReadonlyArray<{ readonly category: string; readonly amount: number }>;
}

interface PieChartExpenseBreakdownTooltipProps {
  active?: boolean;
  payload?: any[];
  t: (key: string) => string;
  formatService: typeof formatService;
}

const PieChartExpenseBreakdownTooltip: React.FC<PieChartExpenseBreakdownTooltipProps> = ({ active, payload, t, formatService }) => {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;
  const name = data.type === 'liability'
    ? t(`liabilities.types.${data.category}`)
    : t(`expenses.categories.${data.category}`);
  return (
    <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow">
      <p className="text-sm font-medium">{name}</p>
      <p className="text-sm">{formatService.formatCurrency(data.amount)}</p>
      <p className="text-sm">({data.percentage.toFixed(1)}%)</p>
    </div>
  );
};

const PieChartExpenseBreakdown: React.FC<PieChartExpenseBreakdownProps> = ({
  expenseBreakdown = [],
  liabilities = []
}) => {
  const { t } = useTranslation();

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
      <div className="h-[400px]">
        {combinedData.length > 0 ? (
          <ResponsiveContainer>
            <PieChart>
              <text
                x="50%"
                y="20"
                textAnchor="middle"
                className="text-lg font-semibold fill-current"
              >
                {t('forecast.expenseBreakdown')}
              </text>
              <Pie
                data={combinedData}
                cx="50%"
                cy="55%"
                outerRadius={120}
                innerRadius={60}
                fill="#8884d8"
                dataKey="amount"
              >
                {combinedData.map((entry) => (
                  <Cell 
                    key={entry.id}
                    fill={entry.type === 'liability' ? '#ef4444' : COLORS[combinedData.findIndex(d => d.category === entry.category) % COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                content={(props) => (
                  <PieChartExpenseBreakdownTooltip {...props} t={t} formatService={formatService} />
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">{t('forecast.noData')}</p>
          </div>
        )}
      </div>
      
      {combinedData.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {combinedData.map((item) => (
            <div key={item.id} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ 
                  backgroundColor: item.type === 'liability' ? '#ef4444' : COLORS[combinedData.findIndex(d => d.category === item.category) % COLORS.length]
                }}
              />
              <div>
                <div className="text-sm font-medium">
                  {item.type === 'liability'
                    ? t(`liabilities.types.${item.category}`)
                    : t(`expenses.categories.${item.category}`)
                  }
                </div>
                <div className="text-sm text-gray-500">
                  {formatService.formatCurrency(item.amount)}
                  {total > 0 && ` (${item.percentage.toFixed(1)}%)`}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default PieChartExpenseBreakdown;
