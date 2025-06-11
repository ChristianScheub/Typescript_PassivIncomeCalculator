import React from 'react';
import { useTranslation } from 'react-i18next';
import GenericPieChart from '../../../ui/charts/pieCharts/GenericPieChart';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import formatService from '../../../service/formatService';

interface LiabilityAnnualAnalyticsViewProps {
  categoryBreakdown: Array<{ category: string; amount: number; percentage: number }>;
  individualLiabilities: Array<{ name: string; amount: number; category: string; percentage: number }>;
  paymentScheduleData: Array<{ month: string; amount: number; breakdown: Array<{ name: string; amount: number }> }>;
}

const LiabilityAnnualAnalyticsView: React.FC<LiabilityAnnualAnalyticsViewProps> = ({
  categoryBreakdown,
  individualLiabilities,
  paymentScheduleData
}) => {
  const { t } = useTranslation();

  // Transform category breakdown data for GenericPieChart
  const categoryChartData = categoryBreakdown.map(item => ({
    name: item.category,
    value: item.amount,
    percentage: item.percentage
  }));

  // Transform individual liabilities data for GenericPieChart
  const individualChartData = individualLiabilities.map(item => ({
    name: item.name,
    value: item.amount,
    percentage: item.percentage
  }));

  // Custom tooltip for the bar chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-gray-100">{`${label}`}</p>
          <p className="text-blue-600 dark:text-blue-400">
            {`Gesamtzahlung: ${formatService.formatCurrency(payload[0].value)}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Top Row: Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Annual Payments by Liability Types */}
        <GenericPieChart
          title={t('analytics.liabilities.annualByCategories')}
          data={categoryChartData}
          nameKey="name"
          valueKey="value"
          translationKey="liabilities.types"
          emptyStateMessage={t('analytics.liabilities.noCategoryData')}
          showDirectLabels={false}
        />

        {/* Annual Individual Liability Payments */}
        <GenericPieChart
          title={t('analytics.liabilities.annualIndividual')}
          data={individualChartData}
          nameKey="name"
          valueKey="value"
          emptyStateMessage={t('analytics.liabilities.noIndividualData')}
          showDirectLabels={true}
        />
      </div>

      {/* Bottom Row: Payment Schedule Bar Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {t('analytics.liabilities.paymentSchedule')}
        </h3>
        
        {paymentScheduleData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentScheduleData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="month" 
                  stroke="#6B7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6B7280"
                  fontSize={12}
                  tickFormatter={(value) => formatService.formatCurrency(value, "EUR")}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="amount" 
                  fill="#DC2626"
                  name={t('analytics.liabilities.monthlyPayments')}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">
              {t('analytics.liabilities.noPaymentData')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiabilityAnnualAnalyticsView;
