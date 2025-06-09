import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, TrendingUp, Calendar, DollarSign, Package, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { PortfolioPosition } from '../../service/portfolioService/portfolioCalculations';
import formatService from '../../service/formatService';

interface AssetDetailViewProps {
  asset: PortfolioPosition;
  isOpen: boolean;
  onClose: () => void;
  getAssetTypeLabel: (type: string) => string;
}

export const AssetDetailView: React.FC<AssetDetailViewProps> = ({
  asset,
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
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
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
                {asset.assetDefinition?.currentPrice && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t('assets.currentPrice')}:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {formatService.formatCurrency(asset.assetDefinition.currentPrice)}
                    </span>
                  </div>
                )}

                {asset.sector && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t('assets.sector')}:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {asset.sector}
                    </span>
                  </div>
                )}

                {asset.country && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t('assets.country')}:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {asset.country}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              {t('assets.transactionHistory')} ({asset.transactions.length})
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {asset.transactions
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

          {/* Additional Info */}
          {asset.assetDefinition?.description && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                {t('assets.description')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {asset.assetDefinition.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
