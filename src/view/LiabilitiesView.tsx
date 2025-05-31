import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Plus, Trash2, Edit, Landmark } from 'lucide-react';
import { Liability } from '../types';
import { MaterialLiabilityForm } from '../container/MaterialLiabilityForm';
import { useTranslation } from 'react-i18next';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { EmptyState } from '../ui/EmptyState';
import { Modal } from '../ui/Modal';
import { DataSummaryCard } from '../ui/DataSummaryCard';
import formatService from '../service/formatService';
import { useDeviceCheck } from '../service/helper/useDeviceCheck';

interface LiabilitiesViewProps {
  liabilities: Liability[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  totalDebt: number;
  totalMonthlyPayment: number;
  isAddingLiability: boolean;
  editingLiability: Liability | null;
  onAddLiability: (data: any) => void;
  onUpdateLiability: (data: any) => void;
  onDeleteLiability: (id: string) => void;
  onSetIsAddingLiability: (isAdding: boolean) => void;
  onSetEditingLiability: (liability: Liability | null) => void;
}

const LiabilitiesView: React.FC<LiabilitiesViewProps> = ({
  liabilities,
  status,
  totalDebt,
  totalMonthlyPayment,
  isAddingLiability,
  editingLiability,
  onAddLiability,
  onUpdateLiability,
  onDeleteLiability,
  onSetIsAddingLiability,
  onSetEditingLiability
}) => {
  const { t } = useTranslation();
  const isDesktop = useDeviceCheck();

  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  const summaryItems = [
    [{
      label: t('liabilities.totalDebt'),
      value: formatService.formatCurrency(totalDebt),
      valueClassName: 'text-red-500 dark:text-red-400'
    }],
    [{
      label: t('liabilities.monthlyPayments'),
      value: formatService.formatCurrency(totalMonthlyPayment),
      valueClassName: 'text-red-500 dark:text-red-400',
      subValue: t('common.across', { count: liabilities.length })
    }]
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('liabilities.title')}</h1>
        <Button onClick={() => onSetIsAddingLiability(true)}>
          <Plus size={16} className="mr-2" />
          {isDesktop && t('liabilities.addLiability')}
        </Button>
      </div>

      {/* Summary Card */}
      <DataSummaryCard 
        title={t('liabilities.summary')} 
        items={summaryItems} 
      />

      {/* Liabilities List */}
      {liabilities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {liabilities.map(liability => (
            <Card key={liability.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className="bg-red-100 dark:bg-red-900 p-2 rounded-full">
                      <Landmark className="w-4 h-4 text-red-600 dark:text-red-300" />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium">{liability.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t(`liabilities.types.${liability.type}`)} • {liability.interestRate}%
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-red-500 dark:text-red-400">
                      {formatService.formatCurrency(liability.currentBalance)}
                    </div>
                    {liability.paymentSchedule && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatService.formatCurrency(liability.paymentSchedule.amount)}/mo
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end mt-4 space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onSetEditingLiability(liability)}
                    className="text-gray-600 dark:text-gray-300"
                  >
                    <Edit size={14} className="mr-1" />
                    {t('common.edit')}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                    onClick={() => onDeleteLiability(liability.id)}
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
          icon={<Landmark className="h-6 w-6 text-red-600 dark:text-red-400" />}
          title={t('liabilities.noLiabilities')}
          description={t('liabilities.noLiabilitiesDesc')}
          actionLabel={t('liabilities.addLiability')}
          onAction={() => onSetIsAddingLiability(true)}
        />
      )}

      {/* Liability Form Modal */}
      <Modal
        isOpen={isAddingLiability || editingLiability !== null}
        onClose={() => {
          onSetIsAddingLiability(false);
          onSetEditingLiability(null);
        }}
      >
        <MaterialLiabilityForm
          initialData={editingLiability || undefined}
          onSubmit={editingLiability ? onUpdateLiability : onAddLiability}
          onCancel={() => {
            onSetIsAddingLiability(false);
            onSetEditingLiability(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default LiabilitiesView;
