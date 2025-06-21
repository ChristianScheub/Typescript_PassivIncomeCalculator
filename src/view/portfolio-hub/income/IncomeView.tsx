import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "../../../ui/common/Card";
import { ViewHeader } from "../../../ui/layout/ViewHeader";
import { MotivationalEmptyState } from "../../../ui/feedback/EnhancedEmptyState";
import { Modal } from "../../../ui/common/Modal";
import { MaterialIncomeForm } from "../../../container/forms/MaterialIncomeForm";
import FloatingBtn, { ButtonAlignment } from "../../../ui/layout/floatingBtn";
import { SwipeableCard } from "../../../ui/common/SwipeableCard";
import { CreditCard } from "lucide-react";
import { Add } from "@mui/icons-material";
import formatService from "@service/infrastructure/formatService";
import { Income } from '../../../types/domains/financial';
import { LoadingSpinner } from "../../../ui/feedback/LoadingSpinner";

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
  onBack?: () => void;
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
  onDeleteIncome,
  onBack
}) => {
  const { t } = useTranslation();

  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <ViewHeader
        title={t('income.title')}
        onBack={onBack}
      />

      {/* Summary Card - keeping existing structure */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 dark:from-emerald-800 dark:to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-white bg-opacity-20 p-3 rounded-full">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{t('income.summary')}</h2>
            <p className="text-sm opacity-90">{t('common.across', { count: items.length })}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-2xl font-bold">{formatService.formatCurrency(totalMonthlyIncome)}</p>
            <p className="text-sm opacity-90">{t('pages.totalMonthlyIncome')}</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{formatService.formatCurrency(annualIncome)}</p>
            <p className="text-sm opacity-90">{t('pages.totalAnnualIncome')}</p>
          </div>
        </div>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(income => {
            const monthlyAmount = calculateMonthlyAmount(income);
            
            return (
              <SwipeableCard
                key={income.id}
                onEdit={() => onSetEditingIncome(income)}
                onDelete={() => onDeleteIncome(income.id)}
                className="hover:shadow-md transition-shadow"
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">{income.name}</h3>
                        <span className="text-sm text-gray-500">
                          {formatService.formatCurrency(monthlyAmount)}/Monat
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{getIncomeTypeLabel(income.type)}</span>
                        {income.isPassive && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                            Passiv
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </SwipeableCard>
            );
          })}
        </div>
      ) : (
        <MotivationalEmptyState
          icon={<CreditCard className="h-8 w-8" />}
          title={t('emptyStates.income.title')}
          description={t('emptyStates.income.description')}
          motivationalText={t('emptyStates.income.motivationalText')}
          primaryAction={{
            label: t('emptyStates.income.primaryAction'),
            onClick: () => onSetIsAddingIncome(true),
            variant: 'primary'
          }}
          tips={t('emptyStates.income.tips', { returnObjects: true }) as string[]}
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
          onSubmit={(data) => {
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

      {/* FloatingBtn nur anzeigen wenn kein Modal geöffnet ist */}
      {!isAddingIncome && !editingIncome && (
        <FloatingBtn
          alignment={ButtonAlignment.RIGHT}
          icon={Add}
          onClick={() => onSetIsAddingIncome(true)}
          backgroundColor="#10B981"
          hoverBackgroundColor="#059669"
        />
      )}
    </div>
  );
};

export default IncomeView;
