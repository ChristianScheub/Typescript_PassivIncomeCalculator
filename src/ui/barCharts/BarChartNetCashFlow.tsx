import React from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card } from '../Card';
import { MonthlyProjection } from '../../types';
import formatService from '../../service/formatService';

interface BarChartNetCashFlowProps {
  projections: MonthlyProjection[];
}

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
              <Tooltip 
                formatter={(value: number) => [formatService.formatCurrency(value), t('forecast.net')]}
              />
              <Bar dataKey="netCashFlow" name={t('forecast.net')} radius={[4, 4, 0, 0]}>
                {projections.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
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
