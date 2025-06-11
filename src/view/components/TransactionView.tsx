import React from 'react';
import { useTranslation } from 'react-i18next';
import { Edit, Trash2 } from 'lucide-react';
import { Asset } from '../../types';
import { PortfolioPosition } from '../../service/portfolioService/portfolioCalculations';
import formatService from '../../service/formatService';
import { getCurrentQuantity, getCurrentValue } from '../../utils/transactionCalculations';

interface TransactionViewProps {
  assets: Asset[];
  portfolioData: { positions: PortfolioPosition[] };
  getAssetTypeLabel: (type: string) => string;
  onEditAsset: (asset: Asset) => void;
  onDeleteAsset: (id: string) => void;
}

export const TransactionView: React.FC<TransactionViewProps> = ({
  assets,
  portfolioData,
  getAssetTypeLabel,
  onEditAsset,
  onDeleteAsset
}) => {
  const { t } = useTranslation();

  const calculateMonthlyIncomeForAsset = (asset: Asset): number => {
    const position = portfolioData.positions.find(pos => 
      pos.transactions.some(t => t.id === asset.id)
    );
    
    if (!position || position.totalQuantity <= 0) {
      return 0;
    }
    
    const transactionQuantity = getCurrentQuantity(asset);
    return (position.monthlyIncome * transactionQuantity) / position.totalQuantity;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {assets.map(asset => (
        <div key={asset.id} className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-all duration-300">
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{asset.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {getAssetTypeLabel(asset.type)}
                  {asset.assetDefinition?.ticker && ` • ${asset.assetDefinition.ticker}`}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('assets.purchaseDate')}: {new Date(asset.purchaseDate).toLocaleDateString()}
                </p>
              </div>
              <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300">
                {asset.type}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t('assets.currentValue')}:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formatService.formatCurrency(getCurrentValue(asset))}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t('assets.monthlyIncome')}:</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {formatService.formatCurrency(calculateMonthlyIncomeForAsset(asset))}
                </span>
              </div>

              {asset.purchaseQuantity && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{t('assets.quantity')}:</span>
                  <span className="text-gray-900 dark:text-gray-100">{asset.purchaseQuantity}</span>
                </div>
              )}

              {asset.purchasePrice && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{t('assets.purchasePrice')}:</span>
                  <span className="text-gray-900 dark:text-gray-100">{formatService.formatCurrency(asset.purchasePrice)}</span>
                </div>
              )}

              {asset.assetDefinition?.sector && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{t('assets.sector')}:</span>
                  <span className="text-gray-900 dark:text-gray-100">{asset.assetDefinition.sector}</span>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700 p-3 flex justify-end gap-2">
            <button 
              onClick={() => onEditAsset(asset)}
              className="flex items-center px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Edit size={14} className="mr-1" />
              {t('common.edit')}
            </button>
            <button 
              onClick={() => onDeleteAsset(asset.id)}
              className="flex items-center px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
            >
              <Trash2 size={14} className="mr-1" />
              {t('common.delete')}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
