import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { PortfolioHistoryPoint } from '@/types/domains/portfolio/history';
import { formatService } from '@/service';
import { ChartEmptyState } from '@/ui/shared';
import { TabButton, TabGroup } from '@/ui/portfolioHub/TabButton';
import { ChartTooltip } from '@/ui/portfolioHub';
interface PortfolioHistoryViewProps {
  historyData: PortfolioHistoryPoint[];
  totalInvestment: number;
  currentValue: number;
  isLoading?: boolean;
  timeRange: '1T' | '1W' | '1M' | '3M' | '6M' | '1J' | 'Max';
  onTimeRangeChange: (range: '1T' | '1W' | '1M' | '3M' | '6M' | '1J' | 'Max') => void;
}

interface ChartDotProps {
  cx: number;
  cy: number;
  payload?: {
    hasTransactions?: boolean;
  };
}

const ChartDot = (props: ChartDotProps) => {
  const { cx, cy, payload } = props;
  const hasTransactions = payload?.hasTransactions;
  const radius = hasTransactions ? 6 : 3;
  const color = hasTransactions ? "#dc2626" : "#2563eb";

  return (
    <circle
      cx={cx}
      cy={cy}
      r={radius}
      fill={color}
      stroke={color}
      strokeWidth={2}
    />
  );
};

export const PortfolioHistoryView: React.FC<PortfolioHistoryViewProps> = ({
  historyData,
  totalInvestment,
  currentValue,
  isLoading = false,
  timeRange,
  onTimeRangeChange
}) => {
  console.log('PortfolioHistoryView received', historyData.length, 'points for', timeRange);
  const { t } = useTranslation();

  const chartData = useMemo(() => {
    return historyData.map(point => ({
      date: point.date,
      value: point.value,
      formattedDate: new Date(point.date).toLocaleDateString('de-DE'),
      hasTransactions: point.transactions.length > 0
    }));
  }, [historyData]);

  const performanceMetrics = useMemo(() => {
    if (historyData.length === 0) {
      return {
        totalReturn: 0,
        totalReturnPercentage: 0,
        peakValue: 0,
        lowestValue: 0
      };
    }

    const values = historyData.map(p => p.value).filter(v => isFinite(v) && v >= 0);
    
    if (values.length === 0) {
      return {
        totalReturn: 0,
        totalReturnPercentage: 0,
        peakValue: 0,
        lowestValue: 0
      };
    }

    const totalReturn = currentValue - totalInvestment;
    const totalReturnPercentage = totalInvestment > 0 ? (totalReturn / totalInvestment) * 100 : 0;

    return {
      totalReturn: isFinite(totalReturn) ? totalReturn : 0,
      totalReturnPercentage: isFinite(totalReturnPercentage) ? totalReturnPercentage : 0,
      peakValue: Math.max(...values),
      lowestValue: Math.min(...values)
    };
  }, [historyData, currentValue, totalInvestment]);

  const timeFilters: Array<{ key: typeof timeRange; label: string }> = [
    { key: '1T', label: '1T' },
    { key: '1W', label: '1W' },
    { key: '1M', label: '1M' },
    { key: '3M', label: '3M' },
    { key: '6M', label: '6M' },
    { key: '1J', label: '1J' },
    { key: 'Max', label: 'Max' }
  ];

  // Y-Achse: min = niedrigster Wert - 10%, max = höchster Wert + 10%
  const values = chartData.map(p => p.value).filter(v => isFinite(v));
  let yDomain: [number | 'auto', number | 'auto'] = ['auto', 'auto'];
  if (values.length > 0) {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const domainMin = Math.max(0, Math.floor((min - min * 0.1)));
    const domainMax = Math.ceil(max + max * 0.1);
    yDomain = [domainMin, domainMax];
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600 dark:text-gray-400">
          {t('common.loading')}
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <ChartEmptyState
        title={t('portfolio.noHistoryData')}
        description={t('portfolio.noHistoryDataDesc')}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Filter Buttons */}
      <TabGroup>
        {timeFilters.map((filter) => (
          <TabButton
            key={filter.key}
            isActive={timeRange === filter.key}
            onClick={() => onTimeRangeChange(filter.key)}
          >
            {filter.label}
          </TabButton>
        ))}
      </TabGroup>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('portfolio.currentValue')}
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {formatService.formatCurrency(currentValue)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('portfolio.totalReturn')}
              </p>
              <p className={`text-xl font-bold ${
                performanceMetrics.totalReturn >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {formatService.formatCurrency(performanceMetrics.totalReturn)}
              </p>
              <p className={`text-sm ${
                performanceMetrics.totalReturnPercentage >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {performanceMetrics.totalReturnPercentage >= 0 ? '+' : ''}
                {performanceMetrics.totalReturnPercentage.toFixed(2)}%
              </p>
            </div>
            {performanceMetrics.totalReturn >= 0 ? (
              <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
            ) : (
              <TrendingDown className="h-8 w-8 text-red-600 dark:text-red-400" />
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {t('portfolio.peakValue')}
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {formatService.formatCurrency(performanceMetrics.peakValue)}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {t('portfolio.lowestValue')}
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {formatService.formatCurrency(performanceMetrics.lowestValue)}
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {t('portfolio.valueHistory')}
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="formattedDate"
                tick={{ fontSize: 12 }}
                className="text-gray-600 dark:text-gray-400"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                className="text-gray-600 dark:text-gray-400"
                tickFormatter={(value) => formatService.formatCurrency(value)}
                domain={yDomain}
              />
              <Tooltip content={<ChartTooltip chartType="bar" t={t} useCustomFormatting={true} showTransactions={true} />} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#2563eb" 
                strokeWidth={2}
                dot={ChartDot}
                activeDot={{ r: 6, fill: "#2563eb" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center mt-4 space-x-6 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
            <span className="text-gray-600 dark:text-gray-400">
              {t('portfolio.portfolioValue')}
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-600 rounded-full mr-2"></div>
            <span className="text-gray-600 dark:text-gray-400">
              {t('portfolio.transactionDays')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
