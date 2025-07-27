import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { formatService } from '@/service';
import { ChartEmptyState } from '@/ui/shared';
import { TabButton, TabGroup } from '@/ui/portfolioHub/TabButton';
import { ChartTooltip } from '@/ui/analyticsHub/charts/ChartTooltips';
import { 
  TimeRangeChart, 
  TimeRangeChartFilter, 
  PortfolioChartDataPoint, 
  ChartConfig,
  DEFAULT_TIME_RANGE_FILTERS
} from '@/types/shared/charts/timeRange';
import { PortfolioPerformanceMetrics } from '@/types/domains/portfolio/performance';

/**
 * Props for the generic PortfolioChart component
 */
export interface PortfolioChartProps {
  /** Chart data points */
  data: PortfolioChartDataPoint[];
  
  /** Current portfolio value for metrics calculation */
  currentValue?: number;
  
  /** Total investment amount for metrics calculation */
  totalInvestment?: number;
  
  /** Loading state */
  isLoading?: boolean;
  
  /** Chart configuration */
  chartConfig?: Partial<ChartConfig>;
  
  /** Display options */
  showPerformanceMetrics?: boolean;
  showTimeRangeFilter?: boolean;
  showLegend?: boolean;
  
  /** Time range filter */
  timeRange?: TimeRangeChart;
  availableTimeRanges?: TimeRangeChartFilter[];
  onTimeRangeChange?: (range: TimeRangeChart) => void;
  
  /** Chart customization */
  title?: string;
  className?: string;
  
  /** Data transformation for display */
  isIntradayView?: boolean;
}

/**
 * Default chart configuration
 */
const defaultChartConfig: ChartConfig = {
  chartType: 'line',
  height: 320,
  showDots: true,
  showGrid: true,
  strokeWidth: 2,
  colors: {
    primary: '#2563eb',
    positive: '#16a34a',
    negative: '#dc2626',
    grid: '#e5e7eb'
  }
};

/**
 * Generic Portfolio Chart Component
 * 
 * A reusable chart component for displaying portfolio value history
 * with optional performance metrics, time range filters, and customizable display options.
 */
export const PortfolioChart: React.FC<PortfolioChartProps> = ({
  data,
  currentValue,
  totalInvestment,
  isLoading = false,
  chartConfig,
  showPerformanceMetrics = false,
  showTimeRangeFilter = false,
  showLegend = false,
  timeRange,
  availableTimeRanges = DEFAULT_TIME_RANGE_FILTERS,
  onTimeRangeChange,
  title,
  className = '',
  isIntradayView = false
}) => {
  const { t } = useTranslation();
  
  // Merge chart configuration with defaults
  const config = useMemo(() => ({
    ...defaultChartConfig,
    ...chartConfig
  }), [chartConfig]);

  // Transform data for chart consumption
  const chartData = useMemo(() => {
    return data.map(point => ({
      ...point,
      formattedDate: point.formattedDate || new Date(point.date).toLocaleDateString('de-DE')
    }));
  }, [data]);

  // Filter out invalid chart data
  const validChartData = useMemo(() => {
    return chartData.filter(point => {
      const date = new Date(point.date);
      const isValidDate = !isNaN(date.getTime());
      const isValidValue = typeof point.value === 'number' && !isNaN(point.value) && isFinite(point.value);
      
      if (!isValidDate) {
        console.warn('Filtering out invalid date in chart data:', point.date);
      }
      if (!isValidValue) {
        console.warn('Filtering out invalid value in chart data:', point.value);
      }
      
      return isValidDate && isValidValue;
    });
  }, [chartData]);

  // Calculate performance metrics
  const performanceMetrics = useMemo((): PortfolioPerformanceMetrics => {
    if (validChartData.length === 0 || !currentValue || !totalInvestment) {
      return {
        totalReturn: 0,
        totalReturnPercentage: 0,
        peakValue: 0,
        lowestValue: 0
      };
    }

    const values = validChartData.map(p => p.value).filter(v => isFinite(v) && v >= 0);
    
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
  }, [validChartData, currentValue, totalInvestment]);

  // Calculate Y-axis domain
  const yDomain = useMemo((): [number | 'auto', number | 'auto'] => {
    const values = validChartData.map(p => p.value).filter(v => isFinite(v));
    if (values.length === 0) return ['auto', 'auto'];
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    const domainMin = Math.max(0, Math.floor(min - min * 0.1));
    const domainMax = Math.ceil(max + max * 0.1);
    
    return [domainMin, domainMax];
  }, [validChartData]);

  // Format X-axis labels based on view type
  const formatXAxisLabel = useMemo(() => {
    return (dateStr: string) => {
      const date = new Date(dateStr);
      
      // Validate date
      if (isNaN(date.getTime())) {
        console.warn('Invalid date string:', dateStr);
        return dateStr; // Return original string if date is invalid
      }
      
      if (isIntradayView) {
        return new Intl.DateTimeFormat('de-DE', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(date);
      } else {
        return new Intl.DateTimeFormat('de-DE', {
          month: 'short',
          day: 'numeric'
        }).format(date);
      }
    };
  }, [isIntradayView]);

  // Loading state
  if (isLoading) {
    return (
      <div className={`flex justify-center items-center h-64 ${className}`}>
        <div className="text-lg text-gray-600 dark:text-gray-400">
          {t('common.loading')}
        </div>
      </div>
    );
  }

  // Empty state
  if (validChartData.length === 0) {
    return (
      <div className={className}>
        <ChartEmptyState
          title={t('portfolio.noHistoryData')}
          description={t('portfolio.noHistoryDataDesc')}
        />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Time Range Filter */}
      {showTimeRangeFilter && timeRange && onTimeRangeChange && (
        <TabGroup>
          {availableTimeRanges.map((filter) => (
            <TabButton
              key={filter.key}
              isActive={timeRange === filter.key}
              onClick={() => onTimeRangeChange(filter.key)}
            >
              {filter.label}
            </TabButton>
          ))}
        </TabGroup>
      )}

      {/* Performance Metrics Cards */}
      {showPerformanceMetrics && currentValue && totalInvestment && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Current Value */}
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

          {/* Total Return */}
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

          {/* Peak Value */}
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

          {/* Lowest Value */}
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
      )}

      {/* Chart Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {title}
          </h3>
        )}
        
        <div style={{ height: config.height }}>
          <ResponsiveContainer width="100%" height="100%">
            {config.chartType === 'area' ? (
              <AreaChart data={validChartData}>
                {config.showGrid && (
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.3} />
                )}
                <XAxis 
                  dataKey="formattedDate"
                  tick={{ fontSize: 12 }}
                  stroke="#6B7280"
                  tickFormatter={formatXAxisLabel}
                  interval={isIntradayView ? Math.floor(validChartData.length / 10) : 'preserveStart'}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#6B7280"
                  tickFormatter={(value) => formatService.formatCurrency(value)}
                  domain={yDomain}
                />
                <Tooltip 
                  content={
                    <ChartTooltip 
                      chartType="line" 
                      t={t} 
                      useCustomFormatting={true} 
                      showTransactions={true} 
                    />
                  } 
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke={config.colors.primary}
                  fill={`url(#gradientFill)`}
                  strokeWidth={config.strokeWidth}
                  dot={false}
                  connectNulls={false}
                />
                <defs>
                  <linearGradient id="gradientFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={config.colors.primary} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={config.colors.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
              </AreaChart>
            ) : (
              <LineChart data={validChartData}>
                {config.showGrid && (
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.3} />
                )}
                <XAxis 
                  dataKey="formattedDate"
                  tick={{ fontSize: 12 }}
                  stroke="#6B7280"
                  tickFormatter={formatXAxisLabel}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#6B7280"
                  tickFormatter={(value) => formatService.formatCurrency(value)}
                  domain={yDomain}
                />
                <Tooltip 
                  content={
                    <ChartTooltip 
                      chartType="line" 
                      t={t} 
                      useCustomFormatting={true} 
                      showTransactions={true} 
                    />
                  } 
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={config.colors.primary}
                  strokeWidth={config.strokeWidth}
                  dot={config.showDots ? { r: 3, fill: config.colors.primary } : false}
                  activeDot={{ r: 6, fill: config.colors.primary }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        {showLegend && (
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
        )}
      </div>
    </div>
  );
};

export default PortfolioChart;
