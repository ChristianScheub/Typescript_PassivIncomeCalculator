import React from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card } from '../../common/Card';
import { MonthlyProjection } from '@/types/domains/analytics';
import { formatService } from '../../../service';
import { CashFlowTooltipPayload } from '../../../types/shared/charts';

interface BarChartNetCashFlowProps {
  projections: MonthlyProjection[];
}

const CustomNetTooltip: React.FC<CashFlowTooltipPayload> = ({ active, payload, label }) => {
  const { t } = useTranslation();

  if (active && payload && payload.length > 0) {
    const data = payload[0].payload; // Gesamte Datenzeile
    const netValue = payload[0].value;
    
    if (!data) return null;
    
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
        <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">
          {label ? new Date(label).toLocaleString('default', { month: 'long', year: 'numeric' }) : ''}
        </p>
        
        {/* Zeige Einnahmen Details */}
        <div className="mb-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-green-600 mr-4">
              {t('dashboard.income')}:
            </span>
            <span className="text-sm font-medium text-green-600">
              +{formatService.formatCurrency(data.activeIncome)}
            </span>
          </div>
          {data.assetIncome > 0 && (
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-blue-600 mr-4">
                {t('dashboard.assetIncome')}:
              </span>
              <span className="text-sm font-medium text-blue-600">
                +{formatService.formatCurrency(data.assetIncome)}
              </span>
            </div>
          )}
        </div>
        
        {/* Zeige Ausgaben Details */}
        <div className="mb-2">
          {data.expenseTotal > 0 && (
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-red-600 mr-4">
                {t('forecast.expenses')}:
              </span>
              <span className="text-sm font-medium text-red-600">
                {formatService.formatCurrency(-data.expenseTotal)}
              </span>
            </div>
          )}
          {data.liabilityPayments > 0 && (
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-orange-600 mr-4">
                {t('dashboard.liabilities')}:
              </span>
              <span className="text-sm font-medium text-orange-600">
                {formatService.formatCurrency(-data.liabilityPayments)}
              </span>
            </div>
          )}
        </div>

        {/* Zeige Netto-Ergebnis */}
        <hr className="border-gray-200 dark:border-gray-600 my-2" />
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold mr-4">
            {t('forecast.net')}:
          </span>
          <span className={`text-sm font-bold ${netValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatService.formatCurrency(netValue)}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const BarChartNetCashFlow: React.FC<BarChartNetCashFlowProps> = ({
  projections
}) => {
  const { t } = useTranslation();

  return (
    <Card title={t('forecast.netCashFlow')}>
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
                {t('forecast.netCashFlow')}
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
              <Tooltip content={<CustomNetTooltip />} />
              <Bar dataKey="netCashFlow" name={t('forecast.net')} radius={[4, 4, 0, 0]}>
                {projections.map((entry) => (
                  <Cell 
                    key={entry.month} 
                    fill={entry.netCashFlow >= 0 ? '#16a34a' : '#ef4444'}
                  />
                ))}
              </Bar>
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

export default BarChartNetCashFlow;
