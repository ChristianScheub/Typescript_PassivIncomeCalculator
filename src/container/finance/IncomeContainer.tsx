import React, { useState, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchIncome, addIncome, updateIncome, deleteIncome } from '../../store/slices/incomeSlice';
import { Income } from '@/types/domains/financial';
import { useTranslation } from 'react-i18next';
import Logger from '../../service/Logger/logger';
import calculatorService from '../../service/calculatorService';
import IncomeView from '../../view/portfolio-hub/income/IncomeView';
import { sortIncome, SortOrder } from '../../utils/sortingUtils';

const IncomeContainer: React.FC<{ onBack?: () => void; initialAction?: string }> = ({ onBack, initialAction }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { items: incomeItems, status } = useAppSelector(state => state.income);
  const [isAddingIncome, setIsAddingIncome] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);

  // Handle initial action to open forms directly
  useEffect(() => {
    if (initialAction === 'addIncome') {
      setIsAddingIncome(true);
    }
  }, [initialAction]);

  useEffect(() => {
    if (status === 'idle') {
      Logger.info('Fetching income items');
      dispatch(fetchIncome());
    }
  }, [dispatch, status]);

  const calculateMonthlyAmountFromIncome = (income: Income): number => {
    return calculatorService.calculateMonthlyIncome(income);
  };

  const totalMonthlyIncome = calculatorService.calculateTotalMonthlyIncome(incomeItems);

  // Sort income items by monthly amount (highest to lowest)
  const sortedIncomeItems = useMemo(() => {
    return sortIncome(incomeItems, SortOrder.DESC);
  }, [incomeItems]);

  const getIncomeTypeLabel = (type: string): string => {
    return t(`income.types.${type}`, type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' '));
  };

  const handleAddIncome = async (data: Omit<Income, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      Logger.info('Adding new income' + " - " + JSON.stringify(data));
      await dispatch(addIncome(data));
      setIsAddingIncome(false); // Close the form after successful addition
    } catch (error) {
      Logger.error('Failed to add income' + " - " + JSON.stringify(error as Error));
    }
  };

  const handleUpdateIncome = async (data: Income) => {
    try {
      Logger.info('Updating income' + " - " + JSON.stringify(data));
      await dispatch(updateIncome(data));
      setEditingIncome(null);
    } catch (error) {
      Logger.error('Failed to update income' + " - " + JSON.stringify(error as Error));
    }
  };

  const handleDeleteIncome = async (id: string) => {
    if (window.confirm(t('common.deleteConfirmation'))) {
      try {
        Logger.info('Deleting income' + " - " + id);
        await dispatch(deleteIncome(id));
      } catch (error) {
        Logger.error('Failed to delete income' + " - " + JSON.stringify(error as Error));
      }
    }
  };

  // Calculate annual income
  const annualIncome = totalMonthlyIncome * 12;

  return (
    <IncomeView
      items={sortedIncomeItems}
      status={status}
      totalMonthlyIncome={totalMonthlyIncome}
      annualIncome={annualIncome}
      isAddingIncome={isAddingIncome}
      editingIncome={editingIncome}
      calculateMonthlyAmount={calculateMonthlyAmountFromIncome}
      getIncomeTypeLabel={getIncomeTypeLabel}
      onAddIncome={handleAddIncome}
      onUpdateIncome={handleUpdateIncome}
      onDeleteIncome={handleDeleteIncome}
      onSetIsAddingIncome={setIsAddingIncome}
      onSetEditingIncome={setEditingIncome}
      onBack={onBack}
    />
  );
};

export default IncomeContainer;
