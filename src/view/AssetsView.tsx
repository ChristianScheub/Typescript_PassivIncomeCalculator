import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Asset } from '../types';
import { PortfolioPosition } from '../service/portfolioService/portfolioCalculations';
import { AssetTransactionForm } from '../ui/forms/AssetTransactionForm';
import { useDeviceCheck } from '../service/helper/useDeviceCheck';
import { MobileAssetSummaryCard } from '../ui/layout/MobileAssetSummaryCard';
import { DesktopAssetSummaryCards } from '../ui/layout/DesktopAssetSummaryCards';
import formatService from '../service/formatService';
import FloatingBtn, { ButtonAlignment } from '../ui/layout/floatingBtn';
import { Add } from '@mui/icons-material';
import { 
  RefreshCw, 
  TrendingUp, 
  Calendar,
  Settings,
  Edit,
  Trash2,
  Package
} from 'lucide-react';
import { getCurrentQuantity, getCurrentValue } from '../utils/transactionCalculations';

interface PortfolioData {
  positions: PortfolioPosition[];
  totals: {
    totalValue: number;
    totalInvestment: number;
    totalReturn: number;
    totalReturnPercentage: number;
    monthlyIncome: number;
    annualIncome: number;
    positionCount: number;
    transactionCount: number;
  };
  metadata: {
    lastCalculated: string;
    assetCount: number;
    definitionCount: number;
    positionCount: number;
  };
}

interface AssetsViewProps {
  assets: Asset[];
  portfolioData: PortfolioData;
  status: string;
  totalAssetValue: number;
  monthlyAssetIncome: number;
  annualAssetIncome: number;
  isAddingAsset: boolean;
  editingAsset: Asset | null;
  isUpdatingPrices: boolean;
  isApiEnabled: boolean;
  getAssetTypeLabel: (type: string) => string;
  onAddAsset: (data: any) => void;
  onUpdateAsset: (data: any) => void;
  onDeleteAsset: (id: string) => void;
  onSetIsAddingAsset: (isAdding: boolean) => void;
  onSetEditingAsset: (asset: Asset | null) => void;
  onUpdateStockPrices: () => void;
  onNavigateToDefinitions: () => void;
  onNavigateToCalendar: () => void;
}

export const AssetsView: React.FC<AssetsViewProps> = ({
  assets,
  portfolioData,
  status,
  totalAssetValue,
  monthlyAssetIncome,
  annualAssetIncome,
  isAddingAsset,
  editingAsset,
  isUpdatingPrices,
  isApiEnabled,
  getAssetTypeLabel,
  onAddAsset,
  onUpdateAsset,
  onDeleteAsset,
  onSetIsAddingAsset,
  onSetEditingAsset,
  onUpdateStockPrices,
  onNavigateToDefinitions,
  onNavigateToCalendar
}) => {
  const { t } = useTranslation();
  const isDesktop = useDeviceCheck();
  const [viewMode, setViewMode] = useState<'portfolio' | 'transactions'>('portfolio');

  // Use portfolio positions from the service instead of local calculation
  const portfolioAssets = portfolioData.positions;
  
  // Sort assets by purchase date (newest first) for transaction view
  const sortedAssets = useMemo(() => {
    return [...assets].sort((a, b) => 
      new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
    );
  }, [assets]);
  
  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Layout - responsive */}
      {isDesktop ? (
        // Desktop Layout: Title and buttons side by side
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t('assets.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('assets.subtitle')}
            </p>
          </div>
          <div className="flex gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-md p-1">
              <button
                onClick={() => setViewMode('portfolio')}
                className={`flex items-center px-3 py-1 text-sm rounded transition-colors ${
                  viewMode === 'portfolio'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <Package className="h-4 w-4 mr-1" />
                {t('assets.portfolioView')}
              </button>
              <button
                onClick={() => setViewMode('transactions')}
                className={`flex items-center px-3 py-1 text-sm rounded transition-colors ${
                  viewMode === 'transactions'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <Calendar className="h-4 w-4 mr-1" />
                {t('assets.transactionsView')}
              </button>
            </div>

            {/* Hide "Kurse aktualisieren" button when disabled */}
            {!isUpdatingPrices && isApiEnabled && (
              <button 
                onClick={onUpdateStockPrices}
                className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('assets.updatePrices')}
              </button>
            )}
            
            {/* Asset-Definitionen verwalten Button */}
            <button 
              onClick={onNavigateToDefinitions}
              className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <Settings className="h-4 w-4 mr-2" />
              {t('assets.manageDefinitions')}
            </button>
          </div>
        </div>
      ) : (
        // Mobile Layout: Title above, buttons below
        <div className="mb-6">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t('assets.title')}
            </h1>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-md p-1">
              <button
                onClick={() => setViewMode('portfolio')}
                className={`flex items-center px-3 py-1 text-sm rounded transition-colors ${
                  viewMode === 'portfolio'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <Package className="h-4 w-4 mr-1" />
                {t('assets.portfolioView')}
              </button>
              <button
                onClick={() => setViewMode('transactions')}
                className={`flex items-center px-3 py-1 text-sm rounded transition-colors ${
                  viewMode === 'transactions'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <Calendar className="h-4 w-4 mr-1" />
                {t('assets.transactionsView')}
              </button>
            </div>

            {/* Hide "Kurse aktualisieren" button when disabled */}
            {!isUpdatingPrices && isApiEnabled && (
              <button 
                onClick={onUpdateStockPrices}
                className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('assets.updatePrices')}
              </button>
            )}
            
            {/* Asset-Definitionen verwalten Button */}
            <button 
              onClick={onNavigateToDefinitions}
              className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <Settings className={`h-4 w-4 ${isDesktop ? 'mr-2' : ''}`} />
              {isDesktop && (
                <span>
                  {t('assets.manageDefinitions')}
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {isDesktop ? (
        <DesktopAssetSummaryCards
          totalAssetValue={totalAssetValue}
          monthlyAssetIncome={monthlyAssetIncome}
          annualAssetIncome={annualAssetIncome}
          totalAssets={viewMode === 'portfolio' ? portfolioAssets.length : assets.length}
          onNavigateToCalendar={onNavigateToCalendar}
        />
      ) : (
        <>
          <MobileAssetSummaryCard
            totalAssetValue={totalAssetValue}
            monthlyAssetIncome={monthlyAssetIncome}
            annualAssetIncome={annualAssetIncome}
            onNavigateToCalendar={onNavigateToCalendar}
          />
          
          {/* Positions/Transactions Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {viewMode === 'portfolio' ? t('assets.totalPositions') : t('assets.totalTransactions')}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {viewMode === 'portfolio' ? portfolioAssets.length : assets.length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        </>
      )}

      {/* Assets List */}
      {(viewMode === 'portfolio' ? portfolioAssets.length : assets.length) > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {viewMode === 'portfolio' ? (
            // Portfolio View
            portfolioAssets.map(portfolioAsset => (
              <div key={portfolioAsset.id} className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-all duration-300">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{portfolioAsset.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {getAssetTypeLabel(portfolioAsset.type)}
                        {portfolioAsset.ticker && ` • ${portfolioAsset.ticker}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300">
                        {portfolioAsset.type}
                      </span>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {portfolioAsset.transactions.length} {t('assets.transactions')}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('assets.totalQuantity')}:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {portfolioAsset.totalQuantity.toLocaleString('de-DE', { maximumFractionDigits: 4 })}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('assets.averagePrice')}:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {formatService.formatCurrency(portfolioAsset.averagePurchasePrice)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('assets.totalInvestment')}:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {formatService.formatCurrency(portfolioAsset.totalInvestment)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('assets.currentValue')}:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {formatService.formatCurrency(portfolioAsset.currentValue)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('assets.totalReturn')}:</span>
                      <span className={`font-medium ${portfolioAsset.totalReturn >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {formatService.formatCurrency(portfolioAsset.totalReturn)} 
                        ({portfolioAsset.totalReturn >= 0 ? '+' : ''}{formatService.formatPercentage(portfolioAsset.totalReturnPercentage)})
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">{t('assets.monthlyIncome')}:</span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        {formatService.formatCurrency(portfolioAsset.monthlyIncome)}
                      </span>
                    </div>

                    {portfolioAsset.sector && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">{t('assets.sector')}:</span>
                        <span className="text-gray-900 dark:text-gray-100">{portfolioAsset.sector}</span>
                      </div>
                    )}

                    {portfolioAsset.assetDefinition?.currentPrice && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">{t('assets.currentPrice')}:</span>
                        <span className="text-gray-900 dark:text-gray-100">{formatService.formatCurrency(portfolioAsset.assetDefinition.currentPrice)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-700 p-3 flex justify-between">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {portfolioAsset.transactions.length > 1 && 
                      `${t('assets.purchaseDates')}: ${portfolioAsset.transactions
                        .map(t => new Date(t.purchaseDate).toLocaleDateString())
                        .slice(0, 2)
                        .join(', ')}${portfolioAsset.transactions.length > 2 ? '...' : ''}`
                    }
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Transactions View - sorted by purchase date (newest first)
            sortedAssets.map(asset => (
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
                        {(() => {
                          // Find the portfolio position for this asset
                          const position = portfolioData.positions.find(pos => 
                            pos.transactions.some(t => t.id === asset.id)
                          );
                          if (position && position.totalQuantity > 0) {
                            // Calculate proportional income based on this transaction's quantity
                            const transactionQuantity = getCurrentQuantity(asset);
                            const proportionalIncome = (position.monthlyIncome * transactionQuantity) / position.totalQuantity;
                            return formatService.formatCurrency(proportionalIncome);
                          }
                          return formatService.formatCurrency(0);
                        })()}
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
                    onClick={() => {
                      onSetEditingAsset(asset);
                    }}
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
            ))
          )}
        </div>
      ) : (
        // EmptyState ersetzt durch native HTML
        <div className="text-center py-12">
          <TrendingUp className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {t('assets.noAssets')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t('assets.noAssetsDesc')}
          </p>
          <button 
            onClick={() => onSetIsAddingAsset(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {t('assets.addTransaction')}
          </button>
        </div>
      )}

      {/* Hide floating button when AssetTransactionForm is open */}
      {!isAddingAsset && !editingAsset && (
        <FloatingBtn
          alignment={ButtonAlignment.RIGHT}
          icon={Add}
          onClick={() => onSetIsAddingAsset(true)}
          backgroundColor="#2563eb"
          hoverBackgroundColor="#1d4ed8"
        />
      )}

      <AssetTransactionForm
        isOpen={isAddingAsset || !!editingAsset}
        onClose={() => {
          onSetIsAddingAsset(false);
          onSetEditingAsset(null);
        }}
        onSubmit={editingAsset ? onUpdateAsset : onAddAsset}
        editingAsset={editingAsset}
      />
    </div>
  );
};
