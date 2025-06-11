import React from 'react';
import { Card, CardContent } from '../../ui/common/Card';
import { Button } from '../../ui/common/Button';
import { Trash2, Edit, Landmark } from 'lucide-react';
import { Liability } from '../../types';
import { MaterialLiabilityForm } from '../../container/forms/MaterialLiabilityForm';
import { useTranslation } from 'react-i18next';
import { LoadingSpinner } from '../../ui/feedback/LoadingSpinner';
import { EmptyState } from '../../ui/feedback/EmptyState';
import { Modal } from '../../ui/common/Modal';
import { SummaryCard } from '../../ui/common/SummaryCard';
import formatService from '../../service/formatService';
import { useDeviceCheck } from '../../service/helper/useDeviceCheck';
import FloatingBtn, { ButtonAlignment } from '../../ui/layout/floatingBtn';
import { Add } from '@mui/icons-material';

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
  onShowAnalytics: () => void;
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
  onSetEditingLiability,
  onShowAnalytics
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
      </div>

      {/* Summary Card */}
      <SummaryCard
        title={t('liabilities.title')}
        subtitle={t('common.across', { count: liabilities.length })}
        value={formatService.formatCurrency(totalDebt)}
        valueDescription={t('liabilities.totalDebt')}
        secondaryValue={formatService.formatCurrency(totalMonthlyPayment)}
        secondaryValueDescription={t('liabilities.monthlyPayments')}
        icon={Landmark}
        gradientFrom="from-red-500"
        gradientTo="to-orange-400"
        darkGradientFrom="from-red-600"
        darkGradientTo="to-orange-500"
        accentColor="red-100/80"
        onClick={onShowAnalytics}
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
        />
      </Modal>

      {/* FloatingBtn nur anzeigen wenn kein Modal geöffnet ist */}
      {!isAddingLiability && !editingLiability && (
        <FloatingBtn
          alignment={ButtonAlignment.RIGHT}
          icon={Add}
          onClick={() => onSetIsAddingLiability(true)}
          backgroundColor="#EF4444"
          hoverBackgroundColor="#DC2626"
        />
      )}
    </div>
  );
};

export default LiabilitiesView;
