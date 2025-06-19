import React from "react";
import { useTranslation } from "react-i18next";
import { ExpenseFormData } from "../../../types/domains/forms/form-data";
import { Card, CardContent } from "../../../ui/common/Card";
import { ViewHeader } from "../../../ui/layout/ViewHeader";
import { MotivationalEmptyState } from "../../../ui/feedback/EnhancedEmptyState";
import { Modal } from "../../../ui/common/Modal";
import { MaterialExpenseForm } from "../../../container/forms/MaterialExpenseForm";
import FloatingBtn, { ButtonAlignment } from "../../../ui/layout/floatingBtn";
import { SwipeableCard } from "../../../ui/common/SwipeableCard";
import { ReceiptText } from "lucide-react";
import formatService from '../../../service/formatService';
import { Expense } from "../../../types/domains/financial/entities";
import { Add } from "@mui/icons-material";


interface ExpensesViewProps {
  expenses: Expense[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  totalMonthlyExpenses: number;
  isAddingExpense: boolean;
  editingExpense: Expense | null;
  calculateMonthlyAmount: (expense: Expense) => number;
  onAddExpense: (data: ExpenseFormData) => void;
  onUpdateExpense: (data: ExpenseFormData) => void;
  onDeleteExpense: (id: string) => void;
  onSetIsAddingExpense: (isAdding: boolean) => void;
  onSetEditingExpense: (expense: Expense | null) => void;
  onBack?: () => void;
}

const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  status,
  totalMonthlyExpenses,
  isAddingExpense,
  editingExpense,
  calculateMonthlyAmount,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  onSetIsAddingExpense,
  onSetEditingExpense,
  onBack
}) => {
  const { t } = useTranslation();

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-64">
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ViewHeader
        title={t('expenses.title')}
        onBack={onBack}
      />

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-red-700 to-red-500 dark:from-red-900 dark:to-red-700 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-white bg-opacity-20 p-3 rounded-full">
            <ReceiptText className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{t('expenses.summary')}</h2>
            <p className="text-sm opacity-90">{t('common.across', { count: expenses.length })}</p>
          </div>
        </div>
        <div>
          <p className="text-2xl font-bold">{formatService.formatCurrency(totalMonthlyExpenses)}</p>
          <p className="text-sm opacity-90">{t('expenses.summary')}</p>
        </div>
      </div>

      {/* Expenses List */}
      {expenses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {expenses.map(expense => {
            const monthlyAmount = calculateMonthlyAmount(expense);
            
            return (
              <SwipeableCard
                key={expense.id}
                onEdit={() => onSetEditingExpense(expense)}
                onDelete={() => onDeleteExpense(expense.id)}
                className="hover:shadow-md transition-shadow"
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">{expense.name}</h3>
                        <span className="text-sm text-gray-500">
                          {formatService.formatCurrency(monthlyAmount)}/Monat
                        </span>
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
          icon={<ReceiptText className="h-8 w-8" />}
          title={t('emptyStates.expenses.title')}
          description={t('emptyStates.expenses.description')}
          motivationalText={t('emptyStates.expenses.motivationalText')}
          primaryAction={{
            label: t('emptyStates.expenses.primaryAction'),
            onClick: () => onSetIsAddingExpense(true),
            variant: 'primary'
          }}
          tips={t('emptyStates.expenses.tips', { returnObjects: true }) as string[]}
        />
      )}

      {/* Expense Form Modal */}
      <Modal
        isOpen={isAddingExpense || editingExpense !== null}
        onClose={() => {
          onSetIsAddingExpense(false);
          onSetEditingExpense(null);
        }}
      >
        <MaterialExpenseForm
          initialData={editingExpense || undefined}
          onSubmit={editingExpense ? onUpdateExpense : onAddExpense}
        />
      </Modal>

      {/* FloatingBtn nur anzeigen wenn kein Modal geöffnet ist */}
      {!isAddingExpense && !editingExpense && (
        <FloatingBtn
          alignment={ButtonAlignment.RIGHT}
          icon={Add}
          onClick={() => onSetIsAddingExpense(true)}
          backgroundColor="#B91C1C"
          hoverBackgroundColor="#991B1B"
        />
      )}
    </div>
  );
};

export default ExpensesView;