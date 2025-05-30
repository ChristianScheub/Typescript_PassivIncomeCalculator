import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchIncome, addIncome, updateIncome, deleteIncome } from '../store/slices/incomeSlice';
import { Income } from '../types';
import { useTranslation } from 'react-i18next';
import Logger from '../service/Logger/logger';
import { analytics } from '../service/analytics';
import calculatorService from '../service/calculatorService';
import IncomeView from '../view/IncomeView';

const IncomeContainer: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { items: incomeItems, status } = useAppSelector(state => state.income);
  const [isAddingIncome, setIsAddingIncome] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);

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

  const getIncomeTypeLabel = (type: string): string => {
    return t(`income.types.${type}`, type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' '));
  };

  const handleAddIncome = async (data: any) => {
    try {
      Logger.info('Adding new income' + " - " + JSON.stringify(data));
      analytics.trackEvent('income_add', { type: data.type });
      await dispatch(addIncome(data));
    } catch (error) {
      Logger.error('Failed to add income' + " - " + JSON.stringify(error as Error));
    }
  };

  const handleUpdateIncome = async (data: any) => {
    try {
      Logger.info('Updating income' + " - " + JSON.stringify(data));
      analytics.trackEvent('income_update', { id: data.id });
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
        analytics.trackEvent('income_delete', { id });
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
      items={incomeItems}
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
    />
  );
};

export default IncomeContainer;
