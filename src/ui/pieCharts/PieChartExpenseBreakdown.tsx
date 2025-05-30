import React from 'react';
import { useTranslation } from 'react-i18next';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Card } from '../Card';
import { CustomPieTooltip } from '../CustomPieTooltip';
import { ExpenseBreakdown } from '../../types';
import { COLORS } from '../../utils/constants';
import formatService from '../../service/formatService';

interface CombinedDataItem {
  category: string;
  amount: number;
  type: 'expense' | 'liability';
}

interface PieChartExpenseBreakdownProps {
  expenseBreakdown: ExpenseBreakdown[];
  liabilities?: { category: string; amount: number }[];
}

const PieChartExpenseBreakdown: React.FC<PieChartExpenseBreakdownProps> = ({
  expenseBreakdown = [], // Standardwert, falls keine Ausgaben übergeben werden
  liabilities = [] // Standardwert, falls keine Verbindlichkeiten übergeben werden
}) => {
  const { t } = useTranslation();

  const combinedData: CombinedDataItem[] = [
    ...expenseBreakdown.filter(expense => expense?.category && expense?.amount).map(expense => ({
      category: expense.category,
      amount: expense.amount,
      type: 'expense' as const
    })),
    ...liabilities.filter(liability => liability?.category && liability?.amount).map(liability => ({
      category: liability.category,
      amount: liability.amount,
      type: 'liability' as const
    }))
  ];

  // Gesamtsumme für Prozentsatz berechnen
  const total = combinedData.reduce((sum, item) => sum + item.amount, 0);

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
                {combinedData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.type === 'liability' ? '#ef4444' : COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                content={
                  <CustomPieTooltip 
                    formatCurrency={formatService.formatCurrency} 
                    formatPercentage={(value) => total > 0 ? `${((value / total) * 100).toFixed(1)}%` : '0%'} 
                  />
                } 
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
          {combinedData.map((item, index) => (
            <div key={`${item.category}-${index}`} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ 
                  backgroundColor: item.type === 'liability' ? '#ef4444' : COLORS[index % COLORS.length]
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
                  {total > 0 && ` (${((item.amount / total) * 100).toFixed(1)}%)`}
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
