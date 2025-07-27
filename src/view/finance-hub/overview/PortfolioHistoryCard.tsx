import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@ui/shared';
import { PortfolioChart } from '@ui/portfolioHub';
import { LineChart } from 'lucide-react';

interface PortfolioHistoryCardProps {
  history: Array<{
    date: string;
    value: number;
    change: number;
    changePercentage: number;
  }>;
  isIntradayView?: boolean; // Optional prop to determine if showing minute-level data
}

const PortfolioHistoryCard: React.FC<PortfolioHistoryCardProps> = ({ history, isIntradayView = false }) => {
  const { t } = useTranslation();

  // Transform data to PortfolioChart format
  const chartData = useMemo(() => {
    if (!history || history.length === 0) return [];
    return history
      .filter(item => {
        // Filter out invalid data points
        const date = new Date(item.date);
        const isValidDate = !isNaN(date.getTime());
        const isValidValue = typeof item.value === 'number' && !isNaN(item.value);
        
        if (!isValidDate) {
          console.warn('Invalid date in portfolio history card:', item.date);
        }
        if (!isValidValue) {
          console.warn('Invalid value in portfolio history card:', item.value);
        }
        
        return isValidDate && isValidValue;
      })
      .map(item => ({
        date: item.date,
        value: item.value,
        change: item.change,
        changePercentage: item.changePercentage,
        formattedDate: new Date(item.date).toLocaleDateString('de-DE'),
        hasTransactions: false
      }));
  }, [history]);

  const getTitle = () => {
    if (isIntradayView) {
      return t('dashboard.portfolioHistoryIntraday') || 'Portfolio Verlauf (Intraday)';
    }
    return t('dashboard.portfolioHistory') || 'Portfolio Verlauf';
  };

  // Calculate totals for header display
  const firstDay = chartData[0];
  const lastDay = chartData[chartData.length - 1];
  const currentValue = lastDay?.value || 0;
  const totalInvestment = firstDay?.value || 0;

  if (!chartData || chartData.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            {getTitle()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500">
            {t('dashboard.noPortfolioHistory')}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-xl">
            {getTitle()}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <PortfolioChart
          data={chartData}
          currentValue={currentValue}
          totalInvestment={totalInvestment}
          isLoading={false}
          showPerformanceMetrics={false}
          showTimeRangeFilter={false}
          showLegend={false}
          chartConfig={{
            chartType: 'area',
            height: 250,
            showDots: false,
            showGrid: true,
            strokeWidth: 2
          }}
          className="h-64"
        />
      </CardContent>
    </Card>
  );
};

export default PortfolioHistoryCard;
