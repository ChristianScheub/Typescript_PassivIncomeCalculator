import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '../../ui/common/Card';
import { SummaryCard } from '../../ui/common/SummaryCard';
import { Button } from '../../ui/common/Button';
import { Plus, CreditCard, Edit, Trash2 } from 'lucide-react';
import { LoadingSpinner } from '../../ui/feedback/LoadingSpinner';
import { Modal } from '../../ui/common/Modal';
import { EmptyState } from '../../ui/feedback/EmptyState';
import { Income } from '../../types';
import { MaterialIncomeForm } from '../../container/forms/MaterialIncomeForm';
import formatService from '../../service/formatService';
import { useDeviceCheck } from '../../service/helper/useDeviceCheck';

interface IncomeViewProps {
  status: string;
  items: Income[];
  isAddingIncome: boolean;
  editingIncome: Income | null;
  totalMonthlyIncome: number;
  annualIncome: number;
  getIncomeTypeLabel: (type: string) => string;
  calculateMonthlyAmount: (income: Income) => number;
  onSetIsAddingIncome: (isAdding: boolean) => void;
  onSetEditingIncome: (income: Income | null) => void;
  onAddIncome: (income: Income) => Promise<void>;
  onUpdateIncome: (income: Income) => Promise<void>;
  onDeleteIncome: (id: string) => void;
}

const IncomeView: React.FC<IncomeViewProps> = ({
  status,
  items,
  isAddingIncome,
  editingIncome,
  totalMonthlyIncome,
  annualIncome,
  getIncomeTypeLabel,
  calculateMonthlyAmount,
  onSetIsAddingIncome,
  onSetEditingIncome,
  onAddIncome,
  onUpdateIncome,
  onDeleteIncome
}) => {
  const { t } = useTranslation();
  const isDesktop = useDeviceCheck();

  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('income.title')}</h1>
        <Button onClick={() => onSetIsAddingIncome(true)}>
          <Plus size={16} className="mr-2" />
          {isDesktop && t('income.addIncome')}
        </Button>
      </div>

      <SummaryCard
        title={t('income.summary')}
        subtitle={t('common.across', { count: items.length })}
        value={formatService.formatCurrency(totalMonthlyIncome)}
        valueDescription={t('pages.totalMonthlyIncome')}
        secondaryValue={formatService.formatCurrency(annualIncome)}
        secondaryValueDescription={t('pages.totalAnnualIncome')}
        icon={CreditCard}
        gradientFrom="from-emerald-600"
        gradientTo="to-emerald-400"
        darkGradientFrom="from-emerald-800"
        darkGradientTo="to-emerald-600"
        accentColor="emerald-100/80"
      />

      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(income => (
            <Card key={income.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className={`bg-${income.isPassive ? 'purple' : 'emerald'}-100 dark:bg-${income.isPassive ? 'purple' : 'emerald'}-900 p-2 rounded-full`}>
                      <CreditCard className={`w-4 h-4 ${income.isPassive ? 'text-purple-600 dark:text-purple-300' : 'text-emerald-600 dark:text-emerald-300'}`} />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium">{income.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {getIncomeTypeLabel(income.type)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-semibold text-emerald-500 dark:text-emerald-400">
                      {formatService.formatCurrency(calculateMonthlyAmount(income))}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      per month
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end mt-4 space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onSetEditingIncome(income)}
                    className="text-gray-600 dark:text-gray-300"
                  >
                    <Edit size={14} className="mr-1" />
                    {t('common.edit')}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                    onClick={() => onDeleteIncome(income.id)}
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
          icon={<CreditCard className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />}
          title={t('income.noIncome')}
          description={t('income.noIncomeDesc')}
          actionLabel={t('income.addIncome')}
          onAction={() => onSetIsAddingIncome(true)}
        />
      )}

      <Modal
        isOpen={isAddingIncome || !!editingIncome}
        onClose={() => {
          onSetIsAddingIncome(false);
          onSetEditingIncome(null);
        }}
      >
        <MaterialIncomeForm
          initialData={editingIncome || undefined}
          onSubmit={(data: any) => {
            const income: Income = {
              id: editingIncome?.id || Date.now().toString(),
              name: data.name,
              type: data.type,
              createdAt: editingIncome?.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              isPassive: data.isPassive,
              startDate: data.startDate,
              endDate: data.endDate,
              notes: data.notes,
              paymentSchedule: {
                frequency: data.paymentSchedule.frequency,
                amount: data.paymentSchedule.amount,
                months: data.paymentSchedule.months
              }
            };
            return editingIncome ? onUpdateIncome(income) : onAddIncome(income);
          }}
        />
      </Modal>
    </div>
  );
};

export default IncomeView;
