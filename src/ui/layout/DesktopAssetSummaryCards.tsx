import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatService } from '@/service';
import { Wallet, Calendar, TrendingUp } from 'lucide-react';

interface DesktopAssetSummaryCardsProps {
  totalAssetValue: number;
  monthlyAssetIncome: number;
  annualAssetIncome: number;
  totalAssets: number;
  onNavigateToCalendar?: () => void;
  onNavigateToAnalytics?: () => void;
}

export const DesktopAssetSummaryCards: React.FC<DesktopAssetSummaryCardsProps> = ({
  totalAssetValue,
  monthlyAssetIncome,
  annualAssetIncome,
  totalAssets,
  onNavigateToCalendar,
  onNavigateToAnalytics
}) => {
  const { t } = useTranslation();
  
  return (
    <div className="hidden sm:block">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={onNavigateToAnalytics}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('assets.totalValue')}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatService.formatCurrency(totalAssetValue)}
              </p>
            </div>
            <Wallet className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={onNavigateToCalendar}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('assets.monthlyIncome')}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatService.formatCurrency(monthlyAssetIncome)}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={onNavigateToCalendar}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('assets.annualIncome')}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatService.formatCurrency(annualAssetIncome)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={onNavigateToAnalytics}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('assets.totalPositions')}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {totalAssets}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-gray-600 dark:text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
};
