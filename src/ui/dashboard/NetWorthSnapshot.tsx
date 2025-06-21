import React from 'react';
import { useTranslation } from 'react-i18next';
import { CiSettings } from 'react-icons/ci';
import { TrendingUp, TrendingDown } from 'lucide-react';
import formatService from '../../service/infrastructure/formatService';
import { IconButton } from '../common/IconButton';

interface NetWorthSnapshotProps {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  onNavigateToForecast: () => void;
  onNavigateToSettings: () => void;
}

export const NetWorthSnapshot: React.FC<NetWorthSnapshotProps> = ({
  netWorth,
  totalAssets,
  totalLiabilities,
  onNavigateToForecast,
  onNavigateToSettings,
}) => {
  const { t } = useTranslation();

  return (
    <div className="relative bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-3xl p-4 sm:p-6 text-white overflow-hidden">
      <div
        className="absolute inset-0 w-3/4 cursor-pointer z-10"
        onClick={onNavigateToForecast}
      />

      <div
        className="absolute inset-y-0 right-0 w-1/4 cursor-pointer z-10"
        onClick={onNavigateToSettings}
      />

      <div className="relative z-0">
        <h2 className="text-base sm:text-lg font-medium opacity-90 truncate">
          {t("dashboard.netWorth")}
        </h2>
        <div className="text-2xl sm:text-4xl font-bold mb-2 truncate">
          {formatService.formatCurrency(netWorth)}
        </div>
        <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-2 sm:space-y-0 text-xs sm:text-sm">
          <div className="flex items-center space-x-1 min-w-0">
            <TrendingUp size={14} className="flex-shrink-0" />
            <span className="truncate">
              {t("dashboard.totalAssets")}:{" "}
              {formatService.formatCurrency(totalAssets)}
            </span>
          </div>
          <div className="flex items-center space-x-1 min-w-0">
            <TrendingDown size={14} className="flex-shrink-0" />
            <span className="truncate">
              {t("dashboard.totalLiabilities")}:{" "}
              {formatService.formatCurrency(totalLiabilities)}
            </span>
          </div>
        </div>
      </div>

      <IconButton
        icon={<CiSettings className="w-5 h-5" />}
        className="absolute top-4 right-4 z-20 pointer-events-none bg-white bg-opacity-20 hover:bg-opacity-30"
        variant="ghost"
        size="icon"
        aria-label="Settings"
      />
    </div>
  );
};
