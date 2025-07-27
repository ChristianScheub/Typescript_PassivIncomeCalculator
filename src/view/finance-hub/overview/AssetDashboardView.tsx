import React from 'react';
import { useTranslation } from 'react-i18next';
import { PullToRefresh, NetWorthSnapshot } from '@ui/startHub';
import { Button, ButtonGroup, IconButton } from '@ui/shared';
import { History } from 'lucide-react';
import { AssetPositionsList } from '@ui/portfolioHub';
import { AssetFocusTimeRange } from '@/types/shared/analytics';
import { DEFAULT_TIME_RANGE_FILTERS } from '@/types/shared/charts/timeRange';
import { PortfolioHistoryPoint } from '@/types/domains/portfolio/performance';
import { AssetDefinition } from '@/types/domains/assets/entities';
import PortfolioHistoryCard from '../../../ui/startHub/PortfolioHistoryCard';
import { AssetWithValue } from '@/types/domains/portfolio/assetWithValue';

export interface PortfolioSummary {
  totalValue: number;
  totalDayChange: number;
  totalDayChangePercent: number;
}

interface AssetDashboardViewProps {
  portfolioHistory: PortfolioHistoryPoint[];
  assetsWithValues: AssetWithValue[];
  portfolioSummary: PortfolioSummary;
  selectedTimeRange: AssetFocusTimeRange;
  onTimeRangeChange: (timeRange: AssetFocusTimeRange) => void;
  onRefresh: () => Promise<void>;
  isRefreshing: boolean;
  onNavigateToForecast: () => void;
  onNavigateToSettings: () => void;
  onNavigateToAssetDetail: (assetDefinition: AssetDefinition) => void; // Updated prop type
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  isApiEnabled: boolean;
  onUpdateIntradayHistory: () => Promise<void>;
  isIntradayView?: boolean; // New prop to indicate if showing intraday data
}

const AssetDashboardView: React.FC<AssetDashboardViewProps> = ({
  portfolioHistory,
  assetsWithValues,
  portfolioSummary: _portfolioSummary, // eslint-disable-line @typescript-eslint/no-unused-vars
  selectedTimeRange,
  onTimeRangeChange,
  onRefresh,
  isRefreshing,
  onNavigateToForecast,
  onNavigateToSettings,
  onNavigateToAssetDetail, // Destructure the updated prop
  netWorth,
  totalAssets,
  totalLiabilities,
  isApiEnabled,
  onUpdateIntradayHistory,
  isIntradayView
}) => {
  const { t } = useTranslation();

  const timeRangeOptions: { value: AssetFocusTimeRange; label: string }[] = 
    DEFAULT_TIME_RANGE_FILTERS.map(filter => ({
      value: filter.key as AssetFocusTimeRange,
      label: t(filter.label)
    }));

  return (
    <PullToRefresh
      onRefresh={onRefresh}
      isRefreshing={isRefreshing}
      className="min-h-screen"
    >
      <div className="space-y-6 pb-8 overflow-x-hidden">
        <div style={{ height: "10vw" }}> </div>

        {/* Net Worth Snapshot */}
        <NetWorthSnapshot
          netWorth={netWorth}
          totalAssets={totalAssets}
          totalLiabilities={totalLiabilities}
          onNavigateToForecast={onNavigateToForecast}
          onNavigateToSettings={onNavigateToSettings}
        />

        {/* Portfolio History Chart */}
        {portfolioHistory.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('assetFocus.portfolioHistory') || 'Portfolio Verlauf'}
              </h3>
              {isApiEnabled && (
                <IconButton
                  onClick={onUpdateIntradayHistory}
                  icon={<History className="h-4 w-4" />}
                  aria-label={t("assetFocus.updateIntradayHistory") || "Intraday Verlauf aktualisieren"}
                  variant="outline"
                  size="iconSm"
                  className="bg-white dark:bg-gray-800 shadow-sm"
                />
              )}
            </div>
            <PortfolioHistoryCard 
              history={portfolioHistory.map((point, index) => ({
                date: point.date,
                value: point.totalValue,
                change: index > 0 ? point.totalValue - portfolioHistory[index - 1].totalValue : 0,
                changePercentage: index > 0 && portfolioHistory[index - 1].totalValue > 0 
                  ? ((point.totalValue - portfolioHistory[index - 1].totalValue) / portfolioHistory[index - 1].totalValue) * 100 
                  : 0
              }))}
              isIntradayView={isIntradayView || false}
            />
          </div>
        )}

        {/* Time Range Selector */}
        <div className="flex justify-center">
          <ButtonGroup className="grid grid-cols-6 gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            {timeRangeOptions.map((option) => (
              <Button
                key={option.value}
                onClick={() => onTimeRangeChange(option.value)}
                variant={selectedTimeRange === option.value ? 'default' : 'ghost'}
                size="sm"
                className={`px-3 py-1 text-xs font-medium transition-all ${
                  selectedTimeRange === option.value
                    ? 'bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {option.label}
              </Button>
            ))}
          </ButtonGroup>
        </div>

        {/* Assets List */}
        <AssetPositionsList
          assetsWithValues={assetsWithValues}
          onAssetClick={onNavigateToAssetDetail}
        />
      </div>
    </PullToRefresh>
  );
};

export default AssetDashboardView;
