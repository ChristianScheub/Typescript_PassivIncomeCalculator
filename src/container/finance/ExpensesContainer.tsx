import React, { useState, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchExpenses, addExpense, updateExpense, deleteExpense } from '../../store/slices/expensesSlice';
import { Expense } from '@/types/domains/financial';
import { ExpenseFormData } from '@/types/domains/forms/form-data';
import { useTranslation } from 'react-i18next';
import Logger from '../../service/Logger/logger';
import calculatorService from '../../service/calculatorService';
import ExpensesView from '../../view/portfolio-hub/expenses/ExpensesView';
import { sortExpenses, SortOrder } from '../../utils/sortingUtils';
import { useAsyncOperation } from '../../utils/containerUtils';

const ExpensesContainer: React.FC<{ onBack?: () => void; initialAction?: string }> = ({ onBack, initialAction }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { executeAsyncOperation } = useAsyncOperation();
  const { items: expenses, status } = useAppSelector(state => state.expenses);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Handle initial action to open forms directly
  useEffect(() => {
    if (initialAction === 'addExpense') {
      setIsAddingExpense(true);
    }
  }, [initialAction]);

  useEffect(() => {
    if (status === 'idle') {
      Logger.info('Fetching expenses');
      dispatch(fetchExpenses());
    }
  }, [dispatch, status]);

  const totalMonthlyExpenses = calculatorService.calculateTotalMonthlyExpenses(expenses);

  // Sort expenses by monthly amount (highest to lowest)
  const sortedExpenses = useMemo(() => {
    return sortExpenses(expenses, SortOrder.DESC);
  }, [expenses]);

  const handleAddExpense = (data: ExpenseFormData) => {
    // Convert ExpenseFormData to Expense format
    const expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'> = {
      name: data.name,
      amount: data.paymentSchedule.amount, // Extract amount from paymentSchedule
      category: data.category,
      startDate: data.startDate,
      endDate: data.endDate,
      notes: data.notes,
      paymentSchedule: data.paymentSchedule
    };

    executeAsyncOperation(
      'add expense',
      () => dispatch(addExpense(expenseData)),
      () => setIsAddingExpense(false)
    );
  };

  const handleUpdateExpense = (data: ExpenseFormData) => {
    if (editingExpense) {
      // Convert ExpenseFormData to Expense format
      const expenseData: Expense = {
        ...editingExpense,
        name: data.name,
        amount: data.paymentSchedule.amount, // Extract amount from paymentSchedule
        category: data.category,
        startDate: data.startDate,
        endDate: data.endDate,
        notes: data.notes,
        paymentSchedule: data.paymentSchedule
      };

      executeAsyncOperation(
        'update expense',
        () => dispatch(updateExpense(expenseData)),
        () => setEditingExpense(null)
      );
    }
  };

  const handleDeleteExpense = (id: string) => {
    if (window.confirm(t('common.deleteConfirm'))) {
      executeAsyncOperation(
        'delete expense',
        () => dispatch(deleteExpense(id))
      );
    }
  };

  return (
    <ExpensesView
      expenses={sortedExpenses}
      status={status}
      totalMonthlyExpenses={totalMonthlyExpenses}
      isAddingExpense={isAddingExpense}
      editingExpense={editingExpense}
      calculateMonthlyAmount={calculatorService.calculateMonthlyExpense}
      onAddExpense={handleAddExpense}
      onUpdateExpense={handleUpdateExpense}
      onDeleteExpense={handleDeleteExpense}
      onSetIsAddingExpense={setIsAddingExpense}
      onSetEditingExpense={setEditingExpense}
      onBack={onBack}
    />
  );
};

export default ExpensesContainer;
