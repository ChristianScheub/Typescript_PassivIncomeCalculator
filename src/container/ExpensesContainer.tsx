import React, { useState, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchExpenses, addExpense, updateExpense, deleteExpense } from '../store/slices/expensesSlice';
import { Expense } from '../types';
import { useTranslation } from 'react-i18next';
import Logger from '../service/Logger/logger';
import calculatorService from '../service/calculatorService';
import ExpensesView from '../view/expenses/ExpensesView';
import ExpenseAnalyticsContainer from './ExpenseAnalyticsContainer';
import { sortExpenses, SortOrder } from '../utils/sortingUtils';

const ExpensesContainer: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { items: expenses, status } = useAppSelector(state => state.expenses);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isShowingAnalytics, setIsShowingAnalytics] = useState(false);

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
      await dispatch(addExpense(data));
      setIsAddingExpense(false);
    } catch (error) {
      Logger.error('Failed to add expense' + " - " + JSON.stringify(error as Error));
    }
  };

  const handleUpdateExpense = async (data: any) => {
    if (editingExpense) {
      try {
        Logger.info('Updating expense: ' + JSON.stringify({ id: editingExpense.id, data }));
        await dispatch(updateExpense({ ...data, id: editingExpense.id }));
        setEditingExpense(null);
      } catch (error) {
        Logger.error('Failed to update expense: ' + JSON.stringify(error as Error));
      }
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (window.confirm(t('common.deleteConfirm'))) {
      try {
        Logger.info('Deleting expense: ' + JSON.stringify({ id }));
        await dispatch(deleteExpense(id));
      } catch (error) {
        Logger.error('Failed to delete expense: ' + JSON.stringify(error as Error));
      }
    }
  };

  const handleNavigateToAnalytics = () => {
    Logger.info('Navigating to expense analytics');
    setIsShowingAnalytics(true);
  };

  const handleBackToExpenses = () => {
    Logger.info('Returning to expenses from analytics');
    setIsShowingAnalytics(false);
  };

  // If showing analytics, render the analytics container instead
  if (isShowingAnalytics) {
    return (
      <ExpenseAnalyticsContainer 
        onBack={handleBackToExpenses}
      />
    );
  }

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
      onNavigateToAnalytics={handleNavigateToAnalytics}
    />
  );
};

export default ExpensesContainer;
