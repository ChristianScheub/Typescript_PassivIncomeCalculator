import React from 'react';
import { useTranslation } from 'react-i18next';
import { PortfolioPosition } from '@/types/domains/portfolio/position';
import { formatService } from '@/service';

interface AssetPortfolioViewProps {
  portfolioAssets: PortfolioPosition[];
  getAssetTypeLabel: (type: string) => string;
  onAssetClick: (asset: PortfolioPosition) => void;
}

export const AssetPortfolioView: React.FC<AssetPortfolioViewProps> = ({
  portfolioAssets,
  getAssetTypeLabel,
  onAssetClick
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-3 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:space-y-0">
      {portfolioAssets.map(portfolioAsset => (
        <div 
          key={portfolioAsset.id} 
          onClick={() => onAssetClick(portfolioAsset)}
          className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg active:shadow-sm transition-all duration-200 cursor-pointer"
        >
          {/* Mobile-first compact design */}
          <div className="p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base md:text-lg text-gray-900 dark:text-gray-100 truncate">
                  {portfolioAsset.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {getAssetTypeLabel(portfolioAsset.type)}
                  {portfolioAsset.ticker && ` • ${portfolioAsset.ticker}`}
                </p>
              </div>
              <div className="ml-2 flex flex-col items-end">
                <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300">
                  {portfolioAsset.totalQuantity.toLocaleString('de-DE', { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Key metrics - Mobile optimized */}
            <div className="space-y-2">
              {/* Current Value - Most important metric */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t('assets.currentValue')}
                </span>
                <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {formatService.formatCurrency(portfolioAsset.currentValue)}
                </span>
              </div>

              {/* Return Percentage */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t('assets.return')}
                </span>
                <span className={`text-sm font-medium ${
                  portfolioAsset.totalReturn >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {portfolioAsset.totalReturn >= 0 ? '+' : ''}{formatService.formatPercentage(portfolioAsset.totalReturnPercentage)}
                </span>
              </div>

              {/* Monthly Income */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t('assets.monthlyIncome')}
                </span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  {formatService.formatCurrency(portfolioAsset.monthlyIncome)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
