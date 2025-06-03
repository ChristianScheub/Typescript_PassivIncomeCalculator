import React from 'react';
import { Edit, Plus, Trash2, Wallet, Calendar, TrendingUp, ArrowUpCircle, BarChart3, Home, Landmark, Coins, DollarSign, Gem, FileText } from 'lucide-react';
import { Asset, AssetType } from '../types';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import formatService from '../service/formatService';
import { Modal } from '../ui/Modal';
import { MaterialAssetForm } from '../container/forms/MaterialAssetForm';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { useDeviceCheck } from '../service/helper/useDeviceCheck';

interface AssetsViewProps {
  assets: Asset[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  totalAssetValue: number;
  monthlyAssetIncome: number;
  annualAssetIncome: number;
  isAddingAsset: boolean;
  editingAsset: Asset | null;
  calculateAssetMonthlyIncome: (asset: Asset) => number;
  getAssetTypeLabel: (type: AssetType) => string;
  onAddAsset: (data: any) => void;
  onUpdateAsset: (data: any) => void;
  onDeleteAsset: (id: string) => void;
  onSetIsAddingAsset: (isAdding: boolean) => void;
  onSetEditingAsset: (asset: Asset | null) => void;
}

export const AssetsView: React.FC<AssetsViewProps> = ({
  assets,
  status,
  totalAssetValue,
  monthlyAssetIncome,
  annualAssetIncome,
  isAddingAsset,
  editingAsset,
  calculateAssetMonthlyIncome,
  getAssetTypeLabel,
  onAddAsset,
  onUpdateAsset,
  onDeleteAsset,
  onSetIsAddingAsset,
  onSetEditingAsset
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isDesktop = useDeviceCheck();

  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('assets.title')}</h1>
        <Button onClick={() => onSetIsAddingAsset(true)}>
          <Plus size={16} className="mr-2" />
          {isDesktop && t('assets.addAsset')}
        </Button>
      </div>

      {/* Dashboard-Style Vermögen Card */}
      <div 
        className="relative bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 rounded-3xl p-4 sm:p-6 text-white overflow-hidden cursor-pointer hover:from-blue-600 hover:via-purple-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-[1.02]"
        onClick={() => navigate('/asset-calendar')}
      >
        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-2">
            <BarChart3 className="w-5 h-5" />
            <h2 className="text-base sm:text-lg font-medium opacity-90">Gesamtwert </h2>
          </div>
          <div className="text-2xl sm:text-4xl font-bold mb-2 truncate">
            {formatService.formatCurrency(totalAssetValue)}
          </div>
          <div className="text-xs sm:text-sm opacity-90 mb-4">
            Gesamt über {assets.length} Vermögenswerte
          </div>
          <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-2 sm:space-y-0 text-xs sm:text-sm">
            <div className="flex items-center space-x-1 min-w-0">
              <ArrowUpCircle size={14} className="flex-shrink-0" />
              <span className="truncate">Monatliches passives Einkommen: {formatService.formatCurrency(monthlyAssetIncome)}</span>
            </div>
            <div className="flex items-center space-x-1 min-w-0">
              <TrendingUp size={14} className="flex-shrink-0" />
              <span className="truncate">Jährlich: {formatService.formatCurrency(annualAssetIncome)}</span>
            </div>
          </div>
        </div>
        
        {/* Calendar Icon */}
        <div className="absolute top-4 right-4 p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all">
          <Calendar className="w-5 h-5" />
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-white/10 opacity-50"></div>
      </div>

      {assets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...assets].sort((a, b) => b.value - a.value).map(asset => (
            <Card key={asset.id} className="hover:shadow-md transition-shadow rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col">
                  {/* Asset Icon und Typ */}
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full flex-shrink-0">
                        {asset.type === 'stock' && <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-300" />}
                        {asset.type === 'bond' && <Landmark className="w-4 h-4 text-blue-600 dark:text-blue-300" />}
                        {asset.type === 'real_estate' && <Home className="w-4 h-4 text-blue-600 dark:text-blue-300" />}
                        {asset.type === 'crypto' && <Gem className="w-4 h-4 text-blue-600 dark:text-blue-300" />}
                        {asset.type === 'cash' && <Coins className="w-4 h-4 text-blue-600 dark:text-blue-300" />}
                        {asset.type === 'other' && <FileText className="w-4 h-4 text-blue-600 dark:text-blue-300" />}
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-medium mb-0">{asset.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {getAssetTypeLabel(asset.type)}
                          {asset.ticker && ` • ${asset.ticker}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-xl font-bold">{formatService.formatCurrency(asset.value)}</div>
                  </div>
                  
                  {/* Aktien Anzahl und monatliches Einkommen */}
                  <div className="px-4 pb-3">
                    {asset.type === 'stock' && asset.quantity && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {asset.quantity} {t('pages.shares')}
                      </p>
                    )}
                    {calculateAssetMonthlyIncome(asset) > 0 && (
                      <div className="text-sm font-medium text-emerald-500 dark:text-emerald-400 flex items-center">
                        <TrendingUp size={14} className="mr-1" />
                        +{formatService.formatCurrency(calculateAssetMonthlyIncome(asset))}/Monat
                      </div>
                    )}
                  </div>
                  
                  {/* Trennlinie */}
                  <div className="border-t border-gray-100 dark:border-gray-700 w-full mt-1"></div>
                  
                  {/* Action Buttons */}
                  <div className="p-2 flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onSetEditingAsset(asset)}
                      className="text-gray-600 dark:text-gray-300"
                    >
                      <Edit size={14} className="mr-1" />
                      {t('common.edit')}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                      onClick={() => onDeleteAsset(asset.id)}
                    >
                      <Trash2 size={14} className="mr-1" />
                      {t('common.delete')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Wallet className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
          title={t('assets.noAssets')}
          description={t('assets.noAssetsDesc')}
          actionLabel={t('assets.addAsset')}
          onAction={() => onSetIsAddingAsset(true)}
        />
      )}

      {/* Asset Form Modal */}
      <Modal
        isOpen={isAddingAsset || editingAsset !== null}
        onClose={() => {
          onSetIsAddingAsset(false);
          onSetEditingAsset(null);
        }}
      >
        <MaterialAssetForm
          initialData={editingAsset || undefined}
          onSubmit={async (data) => {
            if (editingAsset) {
              await onUpdateAsset(data);
            } else {
              await onAddAsset(data);
            }
            onSetIsAddingAsset(false);
            onSetEditingAsset(null);
          }}
        />
      </Modal>
    </div>
  );
};
