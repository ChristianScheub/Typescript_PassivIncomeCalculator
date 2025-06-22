import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/ui/common/Card';
import { Button } from '@/ui/common/Button';
import { MiniAnalyticsCard } from '@/ui/dashboard/MiniAnalyticsCard';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from "@service/infrastructure/formatService/methods/formatCurrency";

interface PerformanceData {
  currentValue: number;
  totalReturn: number;
  totalReturnPercent: number;
  peakValue: number;
  lowestValue: number;
  volatility: number;
  hasHistoricalData: boolean;
  dailyReturn: number;
  monthlyReturn: number;
  annualizedReturn: number;
  sharpeRatio: number;
}

interface AssetPerformance {
  id: string;
  name: string;
  symbol?: string;
  currentValue: number;
  purchaseValue: number;
  invested: number;
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

// Helper function to determine Sharpe ratio color
const getSharpeRatioColor = (sharpeRatio: number): string => {
  if (sharpeRatio > 1) return 'bg-green-500';
  if (sharpeRatio > 0.5) return 'bg-yellow-500';
  return 'bg-red-500';
};

// Extracted component interfaces
interface TopPerformersProps {
  assetPerformance: AssetPerformance[];
  t: (key: string) => string;
}

interface AssetPerformanceRowProps {
  asset: AssetPerformance;
}

interface PerformanceOverviewProps {
  performanceData: PerformanceData;
  t: (key: string) => string;
}

interface ReturnsOverviewProps {
  performanceData: PerformanceData;
  t: (key: string) => string;
}

interface DetailedAssetPerformanceProps {
  assetPerformance: AssetPerformance[];
  t: (key: string) => string;
}

interface DetailedAssetRowProps {
  asset: AssetPerformance;
  t: (key: string) => string;
}

// Extracted Components
const AssetPerformanceRow: React.FC<AssetPerformanceRowProps> = ({ asset }) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
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
);

const TopPerformers: React.FC<TopPerformersProps> = ({ assetPerformance, t }) => (
  <Card>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
      {t('analytics.performance.topPerformers') || 'Top Performers'}
    </h3>
    {assetPerformance.length > 0 ? (
      <div className="space-y-3">
        {assetPerformance.slice(0, 5).map((asset) => (
          <AssetPerformanceRow key={asset.id} asset={asset} />
        ))}
      </div>
    ) : (
      <p className="text-gray-600 dark:text-gray-400 text-center py-8">
        {t('analytics.performance.noData') || 'No performance data available'}
      </p>
    )}
  </Card>
);

const PerformanceOverview: React.FC<PerformanceOverviewProps> = ({ performanceData, t }) => (
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
);

const ReturnsOverview: React.FC<ReturnsOverviewProps> = ({ performanceData, t }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <MiniAnalyticsCard
      title={t('analytics.performance.dailyReturn') || 'Daily Return'}
      value={`${performanceData.dailyReturn.toFixed(3)}%`}
      icon={performanceData.dailyReturn >= 0 ? 
        <TrendingUp className="h-5 w-5" /> : 
        <TrendingDown className="h-5 w-5" />
      }
      color={performanceData.dailyReturn >= 0 ? 
        "text-green-600 dark:text-green-400" : 
        "text-red-600 dark:text-red-400"
      }
    />
    <MiniAnalyticsCard
      title={t('analytics.performance.monthlyReturn') || 'Monthly Return'}
      value={`${performanceData.monthlyReturn.toFixed(2)}%`}
      icon={performanceData.monthlyReturn >= 0 ? 
        <TrendingUp className="h-5 w-5" /> : 
        <TrendingDown className="h-5 w-5" />
      }
      color={performanceData.monthlyReturn >= 0 ? 
        "text-green-600 dark:text-green-400" : 
        "text-red-600 dark:text-red-400"
      }
    />
    <MiniAnalyticsCard
      title={t('analytics.performance.annualizedReturn') || 'Annualized Return'}
      value={`${performanceData.annualizedReturn.toFixed(2)}%`}
      icon={performanceData.annualizedReturn >= 0 ? 
        <TrendingUp className="h-5 w-5" /> : 
        <TrendingDown className="h-5 w-5" />
      }
      color={performanceData.annualizedReturn >= 0 ? 
        "text-green-600 dark:text-green-400" : 
        "text-red-600 dark:text-red-400"
      }
    />
  </div>
);

const DetailedAssetRow: React.FC<DetailedAssetRowProps> = ({ asset, t }) => (
  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
    <div className="flex items-center justify-between mb-3">
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
      <div className="grid grid-cols-3 gap-4 text-right">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('analytics.performance.invested') || 'Invested'}
          </p>
          <p className="font-medium text-gray-900 dark:text-white">
            {formatCurrency(asset.invested)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('analytics.performance.currentValue') || 'Current'}
          </p>
          <p className="font-medium text-gray-900 dark:text-white">
            {formatCurrency(asset.currentValue)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('analytics.performance.return') || 'Return'}
          </p>
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
    </div>
  </div>
);

const DetailedAssetPerformance: React.FC<DetailedAssetPerformanceProps> = ({ assetPerformance, t }) => (
  <Card>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
      {t('analytics.performance.assetReturns') || 'Returns by Asset'}
    </h3>
    {assetPerformance.length > 0 ? (
      <div className="space-y-4">
        {assetPerformance.map((asset) => (
          <DetailedAssetRow key={asset.id} asset={asset} t={t} />
        ))}
      </div>
    ) : (
      <p className="text-gray-600 dark:text-gray-400 text-center py-8">
        {t('analytics.performance.noData') || 'No performance data available'}
      </p>
    )}
  </Card>
);

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
            <PerformanceOverview performanceData={performanceData} t={t} />

            {/* Top Performers */}
            <TopPerformers assetPerformance={assetPerformance} t={t} />
          </div>
        )}

        {selectedTab === 'returns' && (
          <div className="space-y-6">
            {/* Returns Overview */}
            <ReturnsOverview performanceData={performanceData} t={t} />

            {/* Returns Breakdown by Asset */}
            <DetailedAssetPerformance assetPerformance={assetPerformance} t={t} />

            {/* Risk Metrics */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('analytics.performance.riskMetrics') || 'Risk Metrics'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t('analytics.performance.volatility') || 'Volatility'}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {performanceData.volatility.toFixed(2)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(performanceData.volatility * 2, 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t('analytics.performance.sharpeRatio') || 'Sharpe Ratio'}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {performanceData.sharpeRatio.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getSharpeRatioColor(performanceData.sharpeRatio)}`}
                      style={{ width: `${Math.min(Math.max(performanceData.sharpeRatio * 20, 10), 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {selectedTab === 'historical' && (
          <div className="space-y-6">
            {performanceData.hasHistoricalData ? (
              <>
                {/* Historical Performance Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <MiniAnalyticsCard
                    title={t('analytics.performance.peakValue') || 'Peak Value'}
                    value={formatCurrency(performanceData.peakValue)}
                    icon={<TrendingUp className="h-5 w-5" />}
                    color="text-green-600 dark:text-green-400"
                  />
                  <MiniAnalyticsCard
                    title={t('analytics.performance.lowestValue') || 'Lowest Value'}
                    value={formatCurrency(performanceData.lowestValue)}
                    icon={<TrendingDown className="h-5 w-5" />}
                    color="text-red-600 dark:text-red-400"
                  />
                  <MiniAnalyticsCard
                    title={t('analytics.performance.volatility') || 'Volatility'}
                    value={`${performanceData.volatility.toFixed(2)}%`}
                    icon={<TrendingUp className="h-5 w-5" />}
                    color="text-yellow-600 dark:text-yellow-400"
                  />
                  <MiniAnalyticsCard
                    title={t('analytics.performance.totalReturn') || 'Total Return'}
                    value={`${performanceData.totalReturnPercent.toFixed(2)}%`}
                    icon={performanceData.totalReturn >= 0 ? 
                      <TrendingUp className="h-5 w-5" /> : 
                      <TrendingDown className="h-5 w-5" />
                    }
                    color={performanceData.totalReturn >= 0 ? 
                      "text-green-600 dark:text-green-400" : 
                      "text-red-600 dark:text-red-400"
                    }
                  />
                </div>

                {/* Performance Timeline */}
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {t('analytics.performance.performanceTimeline') || 'Performance Timeline'}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {t('analytics.performance.bestDay') || 'Best Single Day'}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t('analytics.performance.highestGain') || 'Highest daily gain'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600 dark:text-green-400">
                          +{performanceData.dailyReturn > 0 ? performanceData.dailyReturn.toFixed(2) : '0.00'}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {t('analytics.performance.bestMonth') || 'Best Month'}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t('analytics.performance.highestMonthlyGain') || 'Highest monthly gain'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600 dark:text-green-400">
                          +{performanceData.monthlyReturn > 0 ? performanceData.monthlyReturn.toFixed(2) : '0.00'}%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {t('analytics.performance.annualizedPerformance') || 'Annualized Performance'}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t('analytics.performance.yearOverYearReturn') || 'Year-over-year return'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${
                          performanceData.annualizedReturn >= 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {performanceData.annualizedReturn >= 0 ? '+' : ''}{performanceData.annualizedReturn.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Asset Historical Performance */}
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {t('analytics.performance.assetHistoricalPerformance') || 'Asset Historical Performance'}
                  </h3>
                  {assetPerformance.length > 0 ? (
                    <div className="space-y-3">
                      {assetPerformance.map((asset) => (
                        <div key={asset.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
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
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                asset.gainPercent >= 0 ? 'bg-green-500' : 'bg-red-500'
                              }`}
                              style={{ 
                                width: `${Math.min(Math.abs(asset.gainPercent) * 2, 100)}%` 
                              }}
                            />
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
              </>
            ) : (
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t('analytics.performance.historicalAnalysis') || 'Historical Analysis'}
                </h3>
                <div className="text-center py-12">
                  <TrendingUp className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {t('analytics.performance.noHistoricalDataTitle') || 'No Historical Data Available'}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    {t('analytics.performance.noHistoricalData') || 'Add assets with price history to see performance over time. Historical analysis helps track your portfolio\'s long-term performance trends.'}
                  </p>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceAnalyticsView;
