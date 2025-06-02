import React from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '../Card';
import { MonthlyProjection } from '../../types';
import formatService from '../../service/formatService';

interface BarChartCashFlowProjectionProps {
  projections: MonthlyProjection[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  const { t } = useTranslation();

  if (active && payload && payload.length > 0) {
    // Prüfe ob Asset-Einkommen deutlich höher als normal ist (Dividendenzahlungen)
    const assetIncomeEntry = payload.find((entry: any) => entry.dataKey === 'assetIncome');
    const isDividendMonth = assetIncomeEntry && assetIncomeEntry.value > 0;
    
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
        <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">
          {new Date(label).toLocaleString('default', { month: 'long', year: 'numeric' })}
          {isDividendMonth && assetIncomeEntry.value > 0 && (
            <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-1 rounded">
              📈 {t('forecast.dividendPayment')}
            </span>
          )}
        </p>
        
        {/* Zeige alle Einträge */}
        {payload.map((entry: any) => {
          if (entry.value === 0) return null;
          
          let entryLabel = '';
          const isIncome = ['activeIncome', 'assetIncome'].includes(entry.dataKey);
          
          switch (entry.dataKey) {
            case 'activeIncome':
              entryLabel = t('dashboard.income');
              break;
            case 'assetIncome':
              entryLabel = t('dashboard.assetIncome');
              break;
            case 'expenseTotal':
              entryLabel = t('forecast.expenses');
              break;
            case 'liabilityPayments':
              entryLabel = t('dashboard.liabilities');
              break;
            default:
              return null;
          }
          
          return (
            <div key={entry.dataKey} className="flex justify-between items-center mb-1">
              <span className="text-sm mr-4" style={{ color: entry.color }}>
                {entryLabel}:
                {entry.dataKey === 'assetIncome' && entry.value > 0 && (
                  <span className="ml-1 text-xs opacity-70">
                    🏦
                  </span>
                )}
              </span>
              <span className="text-sm font-medium" style={{ color: entry.color }}>
                {isIncome ? '+' : ''}{formatService.formatCurrency(isIncome ? entry.value : -Math.abs(entry.value))}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

const BarChartCashFlowProjection: React.FC<BarChartCashFlowProjectionProps> = ({
  projections
}) => {
  const { t } = useTranslation();

  return (
    <Card title={t('forecast.cashFlowProjection')} className="col-span-1 lg:col-span-2">
      {projections.length > 0 ? (
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={projections} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <text
                x="50%"
                y="10"
                textAnchor="middle"
                className="text-sm font-semibold fill-current"
              >
                {t('forecast.cashFlowProjection')}
              </text>
              <XAxis 
                dataKey="month" 
                tickFormatter={(value) => new Date(value).toLocaleString('default', { month: 'short' })}
                height={40}
              />
              <YAxis 
                tickFormatter={(value) => formatService.formatCurrency(value)} 
                width={80}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} />
              <Bar 
                dataKey="activeIncome" 
                stackId="income" 
                fill="#16a34a" 
                name={t('dashboard.income')} 
              />
              <Bar 
                dataKey="assetIncome" 
                stackId="income" 
                fill="#3b82f6" 
                name={t('dashboard.assetIncome')} 
              />
              <Bar 
                dataKey="expenseTotal" 
                stackId="expenses" 
                fill="#ef4444" 
                name={t('forecast.expenses')} 
              />
              <Bar 
                dataKey="liabilityPayments" 
                stackId="expenses" 
                fill="#f97316" 
                name={t('dashboard.liabilities')} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-80 flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">{t('forecast.noAssetData')}</p>
        </div>
      )}
    </Card>
  );
};

export default BarChartCashFlowProjection;
