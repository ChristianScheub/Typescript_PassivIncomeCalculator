import React, { useState, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchExpenses, addExpense, updateExpense, deleteExpense } from '../store/slices/expensesSlice';
import { Expense } from '../types';
import { useTranslation } from 'react-i18next';
import Logger from '../service/Logger/logger';
import { analytics } from '../service/analytics';
import calculatorService from '../service/calculatorService';
import ExpensesView from '../view/expenses/ExpensesView';
import { sortExpenses, SortOrder } from '../utils/sortingUtils';

const ExpensesContainer: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { items: expenses, status } = useAppSelector(state => state.expenses);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

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

  const handleAddExpense = async (data: any) => {
    try {
      Logger.info('Adding new expense' + " - " + JSON.stringify(data));
      analytics.trackEvent('expense_add', { category: data.category });
      await dispatch(addExpense(data));
      setIsAddingExpense(false);
    } catch (error) {
      Logger.error('Failed to add expense' + " - " + JSON.stringify(error as Error));
    }
  };

  const handleUpdateExpense = async (data: any) => {
    if (editingExpense) {
      try {
        Logger.info('Updating expense' + " - " + JSON.stringify({ id: editingExpense.id, data }));
        analytics.trackEvent('expense_update', { id: editingExpense.id, category: data.category });
        await dispatch(updateExpense({ ...data, id: editingExpense.id }));
        setEditingExpense(null);
      } catch (error) {
        Logger.error('Failed to update expense' + " - " + JSON.stringify(error as Error));
      }
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (window.confirm(t('common.deleteConfirm'))) {
      try {
        Logger.info('Deleting expense' + " - " + JSON.stringify({ id }));
        analytics.trackEvent('expense_delete', { id });
        await dispatch(deleteExpense(id));
      } catch (error) {
        Logger.error('Failed to delete expense' + " - " + JSON.stringify(error as Error));
      }
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
    />
  );
};

export default ExpensesContainer;
