import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Plus, Trash2, Edit, Landmark } from 'lucide-react';
import { Liability } from '../types';
import { MaterialLiabilityForm } from '../container/forms/MaterialLiabilityForm';
import { useTranslation } from 'react-i18next';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { EmptyState } from '../ui/EmptyState';
import { Modal } from '../ui/Modal';
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
      <Card className="bg-gradient-to-br from-rose-700 to-rose-500 dark:from-rose-900 dark:to-rose-700 rounded-[2rem] overflow-hidden">
        <CardContent className="pt-6 pb-4">
          <div className="flex justify-between items-start mb-8">
            <div className="space-y-1">
              <h2 className="text-lg font-medium text-white">
                {t('liabilities.summary')}
              </h2>
              <p className="text-sm font-medium text-rose-100/80">
                {t('common.across', { count: liabilities.length })}
              </p>
            </div>
            <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm">
              <Landmark className="w-5 h-5 text-white" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <div className="text-3xl font-bold text-white">
                {formatService.formatCurrency(totalDebt)}
              </div>
              <p className="text-sm text-rose-100/90">
                {t('liabilities.totalDebt')}
              </p>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-white">
                {formatService.formatCurrency(totalMonthlyPayment)}
              </div>
              <p className="text-sm text-rose-100/90">
                {t('liabilities.monthlyPayments')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
        />
      </Modal>
    </div>
  );
};

export default LiabilitiesView;
