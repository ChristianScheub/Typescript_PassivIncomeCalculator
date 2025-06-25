import React, { useState, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { addIncome, updateIncome, deleteIncome } from '@/store/slices/incomeSlice';
import { Income } from '@/types/domains/financial';
import { useTranslation } from 'react-i18next';
import calculatorService from '@/service/domain/financial/calculations/compositeCalculatorService';
import IncomeView from '@/view/portfolio-hub/income/IncomeView';
import { sortIncome, SortOrder } from '../../utils/sortingUtils';
import { useAsyncOperation } from '../../utils/containerUtils';

const IncomeContainer: React.FC<{ onBack?: () => void; initialAction?: string }> = ({ onBack, initialAction }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { executeAsyncOperation } = useAsyncOperation();
  const { items: incomeItems, status } = useAppSelector(state => state.income);
  const [isAddingIncome, setIsAddingIncome] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);

  // Handle initial action to open forms directly
  useEffect(() => {
    if (initialAction === 'addIncome') {
      setIsAddingIncome(true);
    }
  }, [initialAction]);

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
    await executeAsyncOperation(
      'add income',
      () => dispatch(addIncome(data)),
      () => setIsAddingIncome(false)
    );
  };

  const handleUpdateIncome = async (data: Income) => {
    await executeAsyncOperation(
      'update income',
      () => dispatch(updateIncome(data)),
      () => setEditingIncome(null)
    );
  };

  const handleDeleteIncome = (id: string) => {
    if (window.confirm(t('common.deleteConfirmation'))) {
      executeAsyncOperation(
        'delete income',
        () => dispatch(deleteIncome(id))
      );
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
