import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/common/Card';
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import formatService from "@service/infrastructure/formatService";
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

// Custom tooltip component moved outside parent component for better performance
interface PortfolioHistoryTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      date: string;
      value: number;
      change: number;
      changePercentage: number;
      timestamp?: string;
    };
  }>;
  isIntradayView?: boolean;
}

const PortfolioHistoryTooltip: React.FC<PortfolioHistoryTooltipProps> = ({ active, payload, isIntradayView }) => {
  if (!active || !payload?.length) return null;
  
  const data = payload[0].payload;
  const changeColor = data.change >= 0 ? 'text-green-600' : 'text-red-600';

  // Format date/time based on whether it's intraday view
  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isIntradayView) {
      // For intraday, show date and time
      return format(date, 'MMM d, HH:mm');
    } else {
      // For daily view, show just date
      return format(date, 'MMM d, yyyy');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 shadow-lg rounded border border-gray-200 dark:border-gray-700">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
        {formatDateTime(data.date)}
      </p>
      <p className="font-medium">
        {formatService.formatCurrency(data.value)}
      </p>
      <p className={`text-sm font-medium ${changeColor}`}>
        {data.change >= 0 ? '+' : ''}{formatService.formatCurrency(data.change)}
        &nbsp;({data.changePercentage >= 0 ? '+' : ''}
        {data.changePercentage.toFixed(2)}%)
      </p>
    </div>
  );
};

const PortfolioHistoryCard: React.FC<PortfolioHistoryCardProps> = ({ history, isIntradayView = false }) => {
  const { t } = useTranslation();

  // Filter out entries with NaN values
  const transformedHistory = useMemo(() => {
    if (!history || history.length === 0) return [];
    return history.filter(item => typeof item.value === 'number' && !isNaN(item.value));
  }, [history]);

  const firstDay = transformedHistory[0];
  const lastDay = transformedHistory[transformedHistory.length - 1];
  const totalChange = lastDay?.value - firstDay?.value || 0;
  const totalChangePercentage = firstDay?.value ? (totalChange / firstDay.value) * 100 : 0;
  const gradientColor = totalChange >= 0 ? '#22C55E' : '#EF4444';
  const changeColor = totalChange >= 0 ? 'text-green-600' : 'text-red-600';

  // Y-Achse: min = niedrigster Wert - 10%, max = höchster Wert + 10%, niemals unter 0
  const calculateYAxisDomain = () => {
    if (transformedHistory.length === 0) return ['auto', 'auto'];
    const values = transformedHistory.map(item => item.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    if (minValue === maxValue) return ['auto', 'auto'];
    const domainMin = Math.max(0, Math.floor(minValue - minValue * 0.1));
    const domainMax = Math.ceil(maxValue + maxValue * 0.1);
    return [domainMin, domainMax];
  };
  const [yAxisMin, yAxisMax] = calculateYAxisDomain();
  const formatXAxisLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isIntradayView) {
      return format(date, 'MMM d, HH:mm');
    } else {
      return format(date, 'MMM d');
    }
  };
  const getTitle = () => {
    if (isIntradayView) {
      return t('dashboard.portfolioHistoryIntraday') || 'Portfolio Verlauf (Intraday)';
    }
    return t('dashboard.portfolioHistory') || 'Portfolio Verlauf';
  };

  // Now do the conditional return
  if (!transformedHistory || transformedHistory.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            {t('dashboard.portfolioHistory')}
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
        <div className="flex flex-col items-end">
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {formatService.formatCurrency(lastDay?.value || 0)}
          </p>
          <p className={`text-sm font-medium ${changeColor}`}>
            {totalChange >= 0 ? '+' : ''}{formatService.formatCurrency(totalChange)}
            &nbsp;({totalChangePercentage >= 0 ? '+' : ''}
            {totalChangePercentage.toFixed(2)}%)
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {transformedHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={transformedHistory} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={gradientColor} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={gradientColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.3} />
                <XAxis 
                  dataKey="date"
                  tickFormatter={formatXAxisLabel}
                  tick={{ fontSize: 12 }}
                  stroke="#6B7280"
                  interval={isIntradayView ? Math.floor(transformedHistory.length / 10) : 'preserveStart'}
                />
                <YAxis 
                  domain={[yAxisMin, yAxisMax]}
                  tickFormatter={(value) => formatService.formatCurrency(value)}
                  tick={{ fontSize: 12 }}
                  stroke="#6B7280"
                  width={80}
                />
                <Tooltip content={<PortfolioHistoryTooltip isIntradayView={isIntradayView} />} />
                <Area 
                  type="monotone"
                  dataKey="value"
                  stroke={gradientColor}
                  fill="url(#portfolioGradient)"
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
              <LineChart className="w-12 h-12 mb-2 opacity-50" />
              <p>{t('dashboard.noHistoricalData')}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioHistoryCard;
