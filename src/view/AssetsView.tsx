import React from 'react';
import { Edit, Plus, Trash2, Wallet } from 'lucide-react';
import { Asset, AssetType } from '../types';
import { useTranslation } from 'react-i18next';
import formatService from '../service/formatService';
import { Modal } from '../ui/Modal';
import { DataSummaryCard } from '../ui/DataSummaryCard';
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
  const isDesktop = useDeviceCheck();

  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  const summaryItems = [
    [
      {
        id: 'total-value',
        label: t('pages.totalValue'),
        value: formatService.formatCurrency(totalAssetValue),
        subValue: t('pages.totalAcross', { count: assets.length }),
        valueClassName: 'text-blue-600 dark:text-blue-400'
      }
    ],
    [
      {
        id: 'monthly-income',
        label: t('pages.monthlyPassiveIncome'),
        value: formatService.formatCurrency(monthlyAssetIncome),
        subValue: `${formatService.formatCurrency(annualAssetIncome)} ${t('pages.yearly')}`,
        valueClassName: 'text-emerald-500 dark:text-emerald-400'
      }
    ]
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('assets.title')}</h1>
        <Button onClick={() => onSetIsAddingAsset(true)}>
          <Plus size={16} className="mr-2" />
          {isDesktop && t('assets.addAsset')}
        </Button>
      </div>

      <DataSummaryCard 
        title={t('assets.summary')} 
        items={summaryItems} 
      />

      {assets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...assets].sort((a, b) => b.value - a.value).map(asset => (
            <Card key={asset.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                      <Wallet className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium">{asset.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {getAssetTypeLabel(asset.type)}
                        {asset.ticker && ` • ${asset.ticker}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatService.formatCurrency(asset.value)}</div>
                    {asset.type === 'stock' && asset.quantity && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {asset.quantity} {t('pages.shares')}
                      </p>
                    )}
                    {calculateAssetMonthlyIncome(asset) > 0 && (
                      <div className="text-sm font-medium text-emerald-500 dark:text-emerald-400 mt-1">
                        +{formatService.formatCurrency(calculateAssetMonthlyIncome(asset))}/mo
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end mt-4 space-x-2">
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
