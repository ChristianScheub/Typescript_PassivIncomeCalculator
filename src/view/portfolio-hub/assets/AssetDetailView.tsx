import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, TrendingUp, Calendar, DollarSign, Package, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { PortfolioPosition } from '@/types/domains/portfolio/position';
import { AssetDefinition } from '@/types/domains/assets/entities';
import { formatService } from '@service';
import { PriceHistoryView, PriceChart, DividendHistoryView } from '@ui/portfolioHub';
import { featureFlag_Debug_View } from '../../../config/featureFlags';
import { IconButton } from '@/ui/shared';

interface AssetDetailViewProps {
  asset: PortfolioPosition;
  isOpen: boolean;
  onClose: () => void;
  getAssetTypeLabel: (type: string) => string;
}

// Helper: Accept assetDefinition as prop for all detail fields
export const AssetDetailView: React.FC<AssetDetailViewProps & { assetDefinition?: AssetDefinition }> = ({
  asset,
  assetDefinition,
  isOpen,
  onClose,
  getAssetTypeLabel
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const isPositiveReturn = asset.totalReturn >= 0;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end md:items-center justify-center">
      {/* Mobile: Bottom sheet, Desktop: Modal */}
      <div className="bg-white dark:bg-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-xl md:rounded-xl md:max-h-[80vh]">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 md:p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
                {asset.name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {getAssetTypeLabel(asset.type)}
                </span>
                {asset.ticker && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {asset.ticker}
                    </span>
                  </>
                )}
              </div>
            </div>
            <IconButton
              onClick={onClose}
              icon={<X className="h-5 w-5" />}
              aria-label="Close asset details"
              variant="ghost"
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 space-y-6">
          {/* Key Performance Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t('assets.currentValue')}
                </span>
                <DollarSign className="h-4 w-4 text-gray-400" />
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {formatService.formatCurrency(asset.currentValue)}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t('assets.totalReturn')}
                </span>
                {isPositiveReturn ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                )}
              </div>
              <p className={`text-xl font-bold ${
                isPositiveReturn 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {asset.totalReturn >= 0 ? '+' : ''}
                {formatService.formatPercentage(asset.totalReturnPercentage)}
              </p>
              <p className={`text-sm ${
                isPositiveReturn 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {formatService.formatCurrency(asset.totalReturn)}
              </p>
            </div>
          </div>

          {/* Monthly Income Highlight */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">
                  {t('assets.monthlyIncome')}
                </p>
                <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                  {formatService.formatCurrency(asset.monthlyIncome)}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {t('assets.annualIncome')}: {formatService.formatCurrency(asset.annualIncome)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>

          {/* Investment Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <Package className="h-5 w-5 mr-2" />
              {t('assets.investmentDetails')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t('assets.totalQuantity')}:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {asset.totalQuantity.toLocaleString('de-DE', { maximumFractionDigits: 4 })}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t('assets.averagePrice')}:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {formatService.formatCurrency(asset.averagePurchasePrice)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t('assets.totalInvestment')}:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {formatService.formatCurrency(asset.totalInvestment)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {assetDefinition?.currentPrice && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t('assets.currentPrice')}:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {formatService.formatCurrency(assetDefinition.currentPrice || 0)}
                    </span>
                  </div>
                )}

                {assetDefinition?.sectors && assetDefinition.sectors.length > 0 && (
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t('assets.sectors')}:
                    </span>
                    {assetDefinition.sectors.map((sector: { sectorName?: string; sector?: string; percentage?: number }, idx: number) => (
                      <div key={sector.sectorName || sector.sector || idx} className="flex justify-between items-center pl-2">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {sector.sectorName || sector.sector}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {sector.percentage != null ? `${sector.percentage}%` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {assetDefinition?.country && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t('assets.country')}:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {assetDefinition.country}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Price History */}
          {featureFlag_Debug_View&& assetDefinition?.priceHistory && assetDefinition.priceHistory.length > 0 && (
            <PriceHistoryView
              priceHistory={assetDefinition.priceHistory}
              showSourceIcons={true}
              maxEntries={9000}
            />
          )}

          {/* Price Chart */}
          {assetDefinition?.priceHistory && assetDefinition.priceHistory.length > 1 && (
            <PriceChart
              priceHistory={assetDefinition.priceHistory}
              ticker={assetDefinition.ticker}
              transactions={asset.transactions}
            />
          )}

          {/* Dividend History */}
          {assetDefinition?.dividendHistory && assetDefinition.dividendHistory.length > 0 && (
            <DividendHistoryView
              dividendHistory={assetDefinition.dividendHistory}
              maxEntries={9000}
              showSourceIcons={true}
            />
          )}

          {/* Asset Information - Country, Sector, Description */}
          {assetDefinition && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                {t('assets.assetInformation')}
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Key asset information: Country, Sector, Description */}
                  {assetDefinition.country && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t('assets.country')}:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {assetDefinition.country}
                      </span>
                    </div>
                  )}

                  {assetDefinition.sectors && assetDefinition.sectors.length > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t('assets.sector')}:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {assetDefinition.sectors.map(s => s.sector).join(', ')}
                      </span>
                    </div>
                  )}

                  {assetDefinition.ticker && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t('assets.ticker')}:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {assetDefinition.ticker}
                      </span>
                    </div>
                  )}

                  {assetDefinition.exchange && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t('assets.exchange')}:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {assetDefinition.exchange}
                      </span>
                    </div>
                  )}

                  {assetDefinition.isin && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t('assets.isin')}:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {assetDefinition.isin}
                      </span>
                    </div>
                  )}

                  {assetDefinition.wkn && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t('assets.wkn')}:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {assetDefinition.wkn}
                      </span>
                    </div>
                  )}

                  {assetDefinition.riskLevel && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t('assets.riskLevel')}:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {t(`assets.riskLevels.${assetDefinition.riskLevel}`)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {assetDefinition.description && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {t('assets.description')}:
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {assetDefinition.description}
                    </p>
                  </div>
                )}

                {/* Dividend Information */}
                {assetDefinition.dividendInfo && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {t('assets.dividendInformation')}:
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {t('assets.dividendAmount')}:
                        </span>
                        <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                          {formatService.formatCurrency(assetDefinition.dividendInfo.amount)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {t('assets.frequency')}:
                        </span>
                        <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                          {t(`assets.frequencies.${assetDefinition.dividendInfo.frequency}`)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Asset Categories */}
          {asset.categoryAssignments && asset.categoryAssignments.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                {t('categories.title')}
              </h3>
              <div className="space-y-3">
                {asset.categoryAssignments.map((assignment) => (
                  <div key={`${assignment.category.id}-${assignment.option.id}`} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {assignment.category.name}
                        </p>
                        {assignment.category.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {assignment.category.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {assignment.option.name}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transaction History */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              {t('assets.transactionHistory')} ({asset.transactions.length})
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {[...asset.transactions]
                .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
                .map((transaction) => (
                  <div
                    key={transaction.id}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {transaction.transactionType === 'buy' ? t('assets.purchase') : t('assets.sale')}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {new Date(transaction.purchaseDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {transaction.purchaseQuantity} × {formatService.formatCurrency(transaction.purchasePrice)}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {formatService.formatCurrency(transaction.value)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
