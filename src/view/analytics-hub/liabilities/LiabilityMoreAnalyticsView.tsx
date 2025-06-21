import React from 'react';
import { useTranslation } from 'react-i18next';
import GenericPieChart from '../../../ui/charts/pieCharts/GenericPieChart';
import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area } from 'recharts';
import formatService from '@service/infrastructure/formatService';

interface LiabilityMoreAnalyticsViewProps {
  debtBalanceBreakdown: Array<{ category: string; amount: number; percentage: number }>;
  annualInterestBreakdown: Array<{ category: string; amount: number; percentage: number }>;
  debtProjectionData5Years: Array<{ month: string; total: number; [key: string]: unknown }>;
  debtProjectionData10Years: Array<{ month: string; total: number; [key: string]: unknown }>;
  debtProjectionData30Years: Array<{ month: string; total: number; [key: string]: unknown }>;
}

// Define tooltip props interface
interface TooltipPayloadEntry {
  dataKey: string;
  value: number;
  color: string;
}

interface DebtProjectionTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}

// Custom tooltip component moved outside of parent component
const DebtProjectionTooltip = ({ active, payload, label }: DebtProjectionTooltipProps) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">{`${label}`}</p>
        {payload.map((entry: TooltipPayloadEntry) => (
          <p key={`${entry.dataKey}-${entry.value}`} style={{ color: entry.color }}>
            {`${entry.dataKey === 'total' ? 'Gesamtschuld' : entry.dataKey}: ${formatService.formatCurrency(entry.value)}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const LiabilityMoreAnalyticsView: React.FC<LiabilityMoreAnalyticsViewProps> = ({
  debtBalanceBreakdown,
  annualInterestBreakdown,
  debtProjectionData5Years,
  debtProjectionData10Years,
  debtProjectionData30Years
}) => {
  const { t } = useTranslation();

  // Transform debt balance data for GenericPieChart
  const debtBalanceChartData = debtBalanceBreakdown.map(item => ({
    name: item.category,
    value: item.amount,
    percentage: item.percentage
  }));

  // Transform annual interest data for GenericPieChart
  const interestChartData = annualInterestBreakdown.map(item => ({
    name: item.category,
    value: item.amount,
    percentage: item.percentage
  }));

  // Generate colors for debt projection chart
  const colors = ['#DC2626', '#2563EB', '#16A34A', '#CA8A04', '#9333EA', '#C2410C', '#0891B2', '#BE123C'];

  // Helper function to render debt projection charts
  const renderDebtProjectionChart = (data: Array<{ month: string; total: number; [key: string]: unknown }>, title: string, height: string = 'h-96') => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        {title}
      </h3>
      
      {data.length > 0 ? (
        <div className={height}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="month" 
                stroke="#6B7280"
                fontSize={12}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="#6B7280"
                fontSize={12}
                tickFormatter={(value) => formatService.formatCurrency(value)}
              />
              <Tooltip content={<DebtProjectionTooltip />} />
              <Legend />
              
              {/* Total debt area */}
              <Area
                type="monotone"
                dataKey="total"
                stackId="1"
                stroke="#DC2626"
                fill="#DC2626"
                fillOpacity={0.3}
                name="Gesamtschuld"
              />
              
              {/* Individual liability areas */}
              {Object.keys(data[0] || {})
                .filter(key => key !== 'month' && key !== 'total')
                .slice(0, 7) // Limit to 7 individual liabilities for readability
                .map((liabilityName, index) => (
                  <Area
                    key={liabilityName}
                    type="monotone"
                    dataKey={liabilityName}
                    stackId="2"
                    stroke={colors[index % colors.length]}
                    fill={colors[index % colors.length]}
                    fillOpacity={0.6}
                    name={liabilityName}
                  />
                ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className={height + " flex items-center justify-center"}>
          <p className="text-gray-500 dark:text-gray-400">
            {t('analytics.liabilities.noProjectionData')}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Top Row: Debt Balance and Interest Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Debt Balance by Type */}
        <GenericPieChart
          title={t('analytics.liabilities.debtBalanceByType')}
          data={debtBalanceChartData}
          nameKey="name"
          valueKey="value"
          translationKey="liabilities.types"
          emptyStateMessage={t('analytics.liabilities.noCategoryData')}
          showDirectLabels={false}
        />

        {/* Annual Interest Cost by Type */}
        <GenericPieChart
          title={t('analytics.liabilities.annualInterestByType')}
          data={interestChartData}
          nameKey="name"
          valueKey="value"
          translationKey="liabilities.types"
          emptyStateMessage={t('analytics.liabilities.noInterestData')}
          showDirectLabels={false}
        />
      </div>

      {/* Debt Projections */}
      {renderDebtProjectionChart(
        debtProjectionData5Years,
        t('analytics.liabilities.debtProjection5Years'),
        'h-96'
      )}

      {renderDebtProjectionChart(
        debtProjectionData10Years,
        t('analytics.liabilities.debtProjection10Years'),
        'h-96'
      )}

      {renderDebtProjectionChart(
        debtProjectionData30Years,
        t('analytics.liabilities.debtProjection30Years'),
        'h-96'
      )}
    </div>
  );
};

export default LiabilityMoreAnalyticsView;
