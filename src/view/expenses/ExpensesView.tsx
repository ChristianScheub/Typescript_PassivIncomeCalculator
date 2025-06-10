import React from 'react';
import { Card, CardContent } from '../../ui/common/Card';
import { Button } from '../../ui/common/Button';
import { SummaryCard } from '../../ui/common/SummaryCard';
import { Plus, Trash2, Edit, ReceiptText } from 'lucide-react';
import { Expense } from '../../types';
import { MaterialExpenseForm } from '../../container/forms/MaterialExpenseForm';
import { useTranslation } from 'react-i18next';
import formatService from '../../service/formatService';
import { useDeviceCheck } from '../../service/helper/useDeviceCheck';
import { Modal } from '../../ui/common/Modal';

interface ExpensesViewProps {
  expenses: Expense[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  totalMonthlyExpenses: number;
  isAddingExpense: boolean;
  editingExpense: Expense | null;
  calculateMonthlyAmount: (expense: Expense) => number;
  onAddExpense: (data: any) => void;
  onUpdateExpense: (data: any) => void;
  onDeleteExpense: (id: string) => void;
  onSetIsAddingExpense: (isAdding: boolean) => void;
  onSetEditingExpense: (expense: Expense | null) => void;
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
  onSetEditingExpense
}) => {
  const { t } = useTranslation();
  const isDesktop = useDeviceCheck();

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('expenses.title')}</h1>
        <Button onClick={() => onSetIsAddingExpense(true)}>
          <Plus size={16} className="mr-2" />
          {isDesktop && t('expenses.addExpense')}
        </Button>
      </div>

      {/* Summary Card */}
      <SummaryCard
        title={t('expenses.summary')}
        subtitle={t('common.across', { count: expenses.length })}
        value={formatService.formatCurrency(totalMonthlyExpenses)}
        valueDescription="Monthly expenses"
        icon={ReceiptText}
        gradientFrom="from-red-600"
        gradientTo="to-red-400"
        darkGradientFrom="from-red-800"
        darkGradientTo="to-red-600"
        accentColor="red-100/80"
      />

      {/* Expenses List */}
      {expenses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {expenses.map(expense => {
            const monthlyAmount = calculateMonthlyAmount(expense);
            
            return (
              <Card key={expense.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <div className="bg-amber-100 dark:bg-amber-900 p-2 rounded-full">
                        <ReceiptText className="w-4 h-4 text-amber-600 dark:text-amber-300" />
                      </div>
                      <div className="ml-3">
                        <h3 className="font-medium">{expense.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t(`expenses.categories.${expense.category}`)} • 
                          {t(`frequency.${expense.paymentSchedule.frequency}`)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-red-500 dark:text-red-400">
                        {formatService.formatCurrency(monthlyAmount)}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t(`frequency.${expense.paymentSchedule.frequency}`)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-4 space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onSetEditingExpense(expense)}
                      className="text-gray-600 dark:text-gray-300"
                    >
                      <Edit size={14} className="mr-1" />
                      {t('common.edit')}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                      onClick={() => onDeleteExpense(expense.id)}
                    >
                      <Trash2 size={14} className="mr-1" />
                      {t('common.delete')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="bg-white dark:bg-gray-800 border-dashed">
          <CardContent className="p-8 flex flex-col items-center justify-center text-center">
            <div className="bg-amber-100 dark:bg-amber-900/50 p-3 rounded-full mb-3">
              <ReceiptText className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-lg font-medium mb-1">{t('expenses.noExpenses')}</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-md">
              {t('expenses.noExpensesDesc')}
            </p>
            <Button onClick={() => onSetIsAddingExpense(true)}>
              <Plus size={16} className="mr-2" />
              {t('expenses.addExpense')}
            </Button>
          </CardContent>
        </Card>
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
    </div>
  );
};

export default ExpensesView;
