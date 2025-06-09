import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Asset } from '../types';
import { PortfolioPosition } from '../service/portfolioService/portfolioCalculations';
import { AssetTransactionForm } from '../ui/forms/AssetTransactionForm';
import { useDeviceCheck } from '../service/helper/useDeviceCheck';
import { MobileAssetSummaryCard } from '../ui/layout/MobileAssetSummaryCard';
import { DesktopAssetSummaryCards } from '../ui/layout/DesktopAssetSummaryCards';
import { PortfolioView } from './PortfolioView';
import { TransactionView } from './TransactionView';
import { AssetDetailView } from './AssetDetailView';
import FloatingBtn, { ButtonAlignment } from '../ui/layout/floatingBtn';
import { Add } from '@mui/icons-material';
import { 
  RefreshCw, 
  TrendingUp, 
  Calendar,
  Settings,
  Package
} from 'lucide-react';

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
  const [selectedAsset, setSelectedAsset] = useState<PortfolioPosition | null>(null);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);

  const handleAssetClick = (asset: PortfolioPosition) => {
    setSelectedAsset(asset);
    setIsDetailViewOpen(true);
  };

  const handleCloseDetailView = () => {
    setIsDetailViewOpen(false);
    setSelectedAsset(null);
  };

  // Sort portfolio positions by current value (highest to lowest)
  const sortedPortfolioAssets = useMemo(() => {
    return [...portfolioData.positions].sort((a, b) => 
      b.currentValue - a.currentValue
    );
  }, [portfolioData.positions]);
  
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
      {isDesktop ? (          <DesktopAssetSummaryCards
            totalAssetValue={totalAssetValue}
            monthlyAssetIncome={monthlyAssetIncome}
            annualAssetIncome={annualAssetIncome}
            totalAssets={viewMode === 'portfolio' ? sortedPortfolioAssets.length : assets.length}
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
                  {viewMode === 'portfolio' ? sortedPortfolioAssets.length : assets.length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        </>
      )}

      {/* Assets List */}
      {(viewMode === 'portfolio' ? sortedPortfolioAssets.length : assets.length) > 0 ? (
        viewMode === 'portfolio' ? (
          <PortfolioView
            portfolioAssets={sortedPortfolioAssets}
            getAssetTypeLabel={getAssetTypeLabel}
            onAssetClick={handleAssetClick}
          />
        ) : (
          <TransactionView
            assets={sortedAssets}
            portfolioData={portfolioData}
            getAssetTypeLabel={getAssetTypeLabel}
            onEditAsset={onSetEditingAsset}
            onDeleteAsset={onDeleteAsset}
          />
        )
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

      {/* Asset Detail View */}
      {selectedAsset && (
        <AssetDetailView
          asset={selectedAsset}
          isOpen={isDetailViewOpen}
          onClose={handleCloseDetailView}
          getAssetTypeLabel={getAssetTypeLabel}
        />
      )}
    </div>
  );
};
