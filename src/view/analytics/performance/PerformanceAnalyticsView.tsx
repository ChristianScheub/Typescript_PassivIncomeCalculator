import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../../../ui/common/Card';
import { Button } from '../../../ui/common/Button';
import { MiniAnalyticsCard } from '../../../ui/dashboard/MiniAnalyticsCard';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../../../service/formatService/methods/formatCurrency';

interface PerformanceData {
  currentValue: number;
  totalReturn: number;
  totalReturnPercent: number;
  peakValue: number;
  lowestValue: number;
  volatility: number;
  hasHistoricalData: boolean;
}

interface AssetPerformance {
  id: string;
  name: string;
  symbol?: string;
  currentValue: number;
  purchaseValue: number;
  gain: number;
  gainPercent: number;
}

interface PerformanceAnalyticsViewProps {
  selectedTab: 'portfolio' | 'returns' | 'historical';
  performanceData: PerformanceData;
  assetPerformance: AssetPerformance[];
  onTabChange: (tab: 'portfolio' | 'returns' | 'historical') => void;
  onBack?: () => void;
}

const PerformanceAnalyticsView: React.FC<PerformanceAnalyticsViewProps> = ({
  selectedTab,
  performanceData,
  assetPerformance,
  onTabChange,
  onBack
}) => {
  const { t } = useTranslation();

  const tabs = [
    { id: 'portfolio' as const, label: t('analytics.performance.portfolio') || 'Portfolio Performance' },
    { id: 'returns' as const, label: t('analytics.performance.returns') || 'Return Analysis' },
    { id: 'historical' as const, label: t('analytics.performance.historical') || 'Historical Data' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-6">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('analytics.performance.title') || 'Performance Analytics'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {t('analytics.performance.subtitle') || 'Track your portfolio performance and returns'}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                      selectedTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {selectedTab === 'portfolio' && (
          <div className="space-y-6">
            {/* Performance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MiniAnalyticsCard
                title={t('analytics.performance.currentValue') || 'Current Value'}
                value={formatCurrency(performanceData.currentValue)}
                icon={<TrendingUp className="h-5 w-5" />}
                color="text-blue-600 dark:text-blue-400"
              />
              <MiniAnalyticsCard
                title={t('analytics.performance.totalReturn') || 'Total Return'}
                value={`${formatCurrency(performanceData.totalReturn)} (${performanceData.totalReturnPercent.toFixed(2)}%)`}
                icon={performanceData.totalReturn >= 0 ? 
                  <TrendingUp className="h-5 w-5" /> : 
                  <TrendingDown className="h-5 w-5" />
                }
                color={performanceData.totalReturn >= 0 ? 
                  "text-green-600 dark:text-green-400" : 
                  "text-red-600 dark:text-red-400"
                }
              />
              <MiniAnalyticsCard
                title={t('analytics.performance.peakValue') || 'Peak Value'}
                value={formatCurrency(performanceData.peakValue)}
                icon={<TrendingUp className="h-5 w-5" />}
                color="text-green-600 dark:text-green-400"
              />
              <MiniAnalyticsCard
                title={t('analytics.performance.volatility') || 'Volatility'}
                value={`${performanceData.volatility.toFixed(2)}%`}
                icon={<TrendingUp className="h-5 w-5" />}
                color="text-yellow-600 dark:text-yellow-400"
              />
            </div>

            {/* Top Performers */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('analytics.performance.topPerformers') || 'Top Performers'}
              </h3>
              {assetPerformance.length > 0 ? (
                <div className="space-y-3">
                  {assetPerformance.slice(0, 5).map((asset) => (
                    <div key={asset.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {asset.name}
                        </h4>
                        {asset.symbol && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {asset.symbol}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${
                          asset.gain >= 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {formatCurrency(asset.gain)}
                        </p>
                        <p className={`text-sm ${
                          asset.gainPercent >= 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {asset.gainPercent >= 0 ? '+' : ''}{asset.gainPercent.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                  {t('analytics.performance.noData') || 'No performance data available'}
                </p>
              )}
            </Card>
          </div>
        )}

        {selectedTab === 'returns' && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('analytics.performance.returnsAnalysis') || 'Returns Analysis'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t('analytics.performance.returnsComingSoon') || 'Detailed returns analysis coming soon.'}
            </p>
          </Card>
        )}

        {selectedTab === 'historical' && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('analytics.performance.historicalAnalysis') || 'Historical Analysis'}
            </h3>
            {performanceData.hasHistoricalData ? (
              <p className="text-gray-600 dark:text-gray-400">
                {t('analytics.performance.historicalComingSoon') || 'Historical analysis charts coming soon.'}
              </p>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                {t('analytics.performance.noHistoricalData') || 'No historical data available. Add assets with price history to see performance over time.'}
              </p>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default PerformanceAnalyticsView;
