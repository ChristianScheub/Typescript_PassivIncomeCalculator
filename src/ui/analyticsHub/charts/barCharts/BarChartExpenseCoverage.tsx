import React from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '@/ui/shared';
// Removed unused import
import { MonthlyProjection } from '@/types/domains/analytics';

interface BarChartExpenseCoverageProps {
  projections: MonthlyProjection[];
}

const BarChartExpenseCoverage: React.FC<BarChartExpenseCoverageProps> = ({
  projections
}) => {
  const { t } = useTranslation();

  // Formatiere die Daten um sicherzustellen, dass passiveIncomeCoverage eine Nummer ist
  const formattedData = projections.map(proj => ({
    ...proj,
    passiveIncomeCoverage: Number(proj.passiveIncomeCoverage) || 0
  }));

  return (
    <Card title={t('forecast.expenseCoverage')}>
      {formattedData.length > 0 ? (
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <text
                x="50%"
                y="10"
                textAnchor="middle"
                className="text-sm font-semibold fill-current"
              >
                {t('forecast.expenseCoverage')}
              </text>
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleString('default', { month: 'short' })}
                height={40}
              />
              <YAxis 
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                domain={[0, 1]}
                width={60}
              />
              <Tooltip 
                formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, t('forecast.coverage')]}
              />
              <Bar 
                dataKey="passiveIncomeCoverage" 
                fill="#8b5cf6"
                name={t('forecast.coverage')} 
                radius={[4, 4, 0, 0]}
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

export default BarChartExpenseCoverage;
