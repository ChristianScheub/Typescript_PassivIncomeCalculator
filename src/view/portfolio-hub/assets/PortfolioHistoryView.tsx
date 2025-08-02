import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PortfolioHistoryPoint } from '@/types/domains/portfolio/performance';
import { PortfolioChart } from '@/ui/portfolioHub/PortfolioChart';
import { PortfolioChartDataPoint } from '@/types/shared/charts/timeRange';
import { AssetFocusTimeRange } from '@/types/shared/analytics';

interface PortfolioHistoryViewProps {
  historyData: PortfolioHistoryPoint[];
  totalInvestment: number;
  currentValue: number;
  isLoading?: boolean;
  timeRange: AssetFocusTimeRange;
  onTimeRangeChange: (range: AssetFocusTimeRange) => void;
}

export const PortfolioHistoryView: React.FC<PortfolioHistoryViewProps> = ({
  historyData,
  totalInvestment,
  currentValue,
  isLoading = false,
  timeRange,
  onTimeRangeChange
}) => {
  const { t } = useTranslation();

  // Transform historyData to PortfolioChartDataPoint format
  const chartData = useMemo((): PortfolioChartDataPoint[] => {
    return historyData
      .filter(point => {
        // Filter out invalid data points
        const date = new Date(point.date);
        const isValidDate = !isNaN(date.getTime());
        const isValidValue = typeof point.totalValue === 'number' && !isNaN(point.totalValue);
        
        if (!isValidDate) {
          console.warn('Invalid date in history data:', point.date);
        }
        if (!isValidValue) {
          console.warn('Invalid value in history data:', point.totalValue);
        }
        
        return isValidDate && isValidValue;
      })
      .map(point => ({
        date: point.date,
        value: point.totalValue,
        change: point.totalReturn,
        changePercentage: point.totalReturnPercentage,
        formattedDate: new Date(point.date).toLocaleDateString('de-DE'),
        hasTransactions: false // Could be enhanced to detect transaction days
      }));
  }, [historyData]);

  // Time range change handler
  const handleTimeRangeChange = (range: AssetFocusTimeRange) => {
    onTimeRangeChange(range);
  };

  return (
    <div className="container mx-auto px-4 py-4">
      <PortfolioChart
        data={chartData}
        currentValue={currentValue}
        totalInvestment={totalInvestment}
        isLoading={isLoading}
        showPerformanceMetrics={true}
        showTimeRangeFilter={true}
        showLegend={true}
        timeRange={timeRange}
        onTimeRangeChange={handleTimeRangeChange}
        title={t('portfolio.valueHistory')}
        chartConfig={{
          chartType: 'line',
          height: 320,
          showDots: true,
          showGrid: true,
          strokeWidth: 2
        }}
        className="space-y-6"
      />
    </div>
  );
};


