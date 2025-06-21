import React from 'react';
import { useTranslation } from 'react-i18next';
import { PullToRefresh } from '../../../ui/common/PullToRefresh';
import { NetWorthSnapshot } from '../../../ui/dashboard/NetWorthSnapshot';
import { Button } from '../../../ui/common/Button';
import { ButtonGroup } from '../../../ui/common/ButtonGroup';
import { IconButton } from '../../../ui/common/IconButton';
import { History } from 'lucide-react';
import { AssetPositionsList, AssetWithValue } from '../../../ui/components/AssetPositionsList';
import { AssetFocusTimeRange } from '../../../store/slices/dashboardSettingsSlice';
import { PortfolioHistoryPoint } from '../../../types/domains/portfolio/history';
import { Asset, AssetDefinition } from '../../../types/domains/assets/entities';
import PortfolioHistoryCard from './PortfolioHistoryCard';

interface PortfolioSummary {
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
  onNavigateToForecast: () => void;
  onNavigateToSettings: () => void;
  onNavigateToAssetDetail: (asset: Asset, assetDefinition: AssetDefinition) => void;
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
  portfolioSummary: _portfolioSummary, // Renamed to indicate it's intentionally unused
  selectedTimeRange,
  onTimeRangeChange,
  onRefresh,
  onNavigateToForecast,
  onNavigateToSettings,
  onNavigateToAssetDetail,
  netWorth,
  totalAssets,
  totalLiabilities,
  isApiEnabled,
  onUpdateIntradayHistory,
  isIntradayView
}) => {
  const { t } = useTranslation();

  const timeRangeOptions: { value: AssetFocusTimeRange; label: string }[] = [
    { value: '1D', label: '1T' },
    { value: '1W', label: '1W' },
    { value: '1M', label: '1M' },
    { value: '3M', label: '3M' },
    { value: '1Y', label: '1J' },
    { value: 'ALL', label: t('common.all') || 'Alle' }
  ];

  return (
    <PullToRefresh
      onRefresh={onRefresh}
      refreshingText={t("dashboard.refreshing") || "Aktualisiere..."}
      pullToRefreshText={
        t("dashboard.pullToRefresh") || "Zum Aktualisieren ziehen"
      }
      releaseToRefreshText={
        t("dashboard.releaseToRefresh") || "Loslassen zum Aktualisieren"
      }
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
              history30Days={portfolioHistory.map((point, index) => ({
                date: point.date,
                value: point.value,
                change: index > 0 ? point.value - portfolioHistory[index - 1].value : 0,
                changePercentage: index > 0 && portfolioHistory[index - 1].value > 0 
                  ? ((point.value - portfolioHistory[index - 1].value) / portfolioHistory[index - 1].value) * 100 
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
