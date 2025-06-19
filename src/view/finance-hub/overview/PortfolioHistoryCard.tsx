import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '../../../ui/common/Card';
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import formatService from '../../../service/formatService';
import { LineChart } from 'lucide-react';

interface PortfolioHistoryCardProps {
  history30Days: Array<{
    date: string;
    value: number;
    change: number;
    changePercentage: number;
  }>;
}

// Custom tooltip component moved outside parent component for better performance
interface PortfolioHistoryTooltipProps {
  active?: boolean;
  payload?: any[];
}

const PortfolioHistoryTooltip: React.FC<PortfolioHistoryTooltipProps> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  
  const data = payload[0].payload;
  const changeColor = data.change >= 0 ? 'text-green-600' : 'text-red-600';

  return (
    <div className="bg-white dark:bg-gray-800 p-3 shadow-lg rounded border border-gray-200 dark:border-gray-700">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
        {format(new Date(data.date), 'MMM d, yyyy')}
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

const PortfolioHistoryCard: React.FC<PortfolioHistoryCardProps> = ({ history30Days }) => {
  const { t } = useTranslation();
  
  // Find the overall change
  const firstDay = history30Days[0];
  const lastDay = history30Days[history30Days.length - 1];
  const totalChange = lastDay.value - firstDay.value;
  const totalChangePercentage = firstDay.value ? (totalChange / firstDay.value) * 100 : 0;

  const gradientColor = totalChange >= 0 ? '#22C55E' : '#EF4444';
  const changeColor = totalChange >= 0 ? 'text-green-600' : 'text-red-600';

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-xl">
            {t('dashboard.portfolioHistory')}
          </CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('dashboard.last30Days')}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {formatService.formatCurrency(lastDay.value)}
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
          {history30Days.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history30Days} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={gradientColor} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={gradientColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.3} />
                <XAxis 
                  dataKey="date"
                  tickFormatter={(date) => format(new Date(date), 'MMM d')}
                  tick={{ fontSize: 12 }}
                  stroke="#6B7280"
                />
                <YAxis 
                  tickFormatter={(value) => formatService.formatCurrency(value)}
                  tick={{ fontSize: 12 }}
                  stroke="#6B7280"
                  width={80}
                />
                <Tooltip content={<PortfolioHistoryTooltip />} />
                <Area 
                  type="monotone"
                  dataKey="value"
                  stroke={gradientColor}
                  fill="url(#portfolioGradient)"
                  strokeWidth={2}
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
