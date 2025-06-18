import React, { useState, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchLiabilities, addLiability, updateLiability, deleteLiability } from '../../store/slices/liabilitiesSlice';
import { Liability } from '@/types/domains/financial';
import { useTranslation } from 'react-i18next';
import Logger from '../../service/Logger/logger';
import calculatorService from '../../service/calculatorService';
import LiabilitiesView from '../../view/portfolio-hub/liabilities/LiabilitiesView';
import { sortLiabilitiesByPayment, SortOrder } from '../../utils/sortingUtils';

const LiabilitiesContainer: React.FC<{ onBack?: () => void; initialAction?: string }> = ({ onBack, initialAction }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { items: liabilities, status } = useAppSelector(state => state.liabilities);
  const [isAddingLiability, setIsAddingLiability] = useState(false);
  const [editingLiability, setEditingLiability] = useState<Liability | null>(null);

  // Handle initial action to open forms directly
  useEffect(() => {
    if (initialAction === 'addDebt') {
      setIsAddingLiability(true);
    }
  }, [initialAction]);

  useEffect(() => {
    if (status === 'idle') {
      Logger.info('Fetching liabilities');
      dispatch(fetchLiabilities());
    }
  }, [dispatch, status]);

  const totalDebt = calculatorService.calculateTotalDebt(liabilities);
  const totalMonthlyPayment = calculatorService.calculateTotalMonthlyLiabilityPayments(liabilities);

  // Sort liabilities by monthly payment (highest to lowest)
  const sortedLiabilities = useMemo(() => {
    return sortLiabilitiesByPayment(liabilities, SortOrder.DESC);
  }, [liabilities]);

  const handleAddLiability = async (data: any) => {
    try {
      Logger.info('Adding new liability' + " - " + JSON.stringify(data));
      await dispatch(addLiability(data));
      setIsAddingLiability(false);
    } catch (error) {
      Logger.error('Failed to add liability' + " - " + JSON.stringify(error as Error));
    }
  };

  const handleUpdateLiability = async (data: any) => {
    if (editingLiability) {
      try {
        Logger.info('Updating liability: ' + JSON.stringify({ id: editingLiability.id, data }));
        await dispatch(updateLiability({ ...data, id: editingLiability.id }));
        setEditingLiability(null);
      } catch (error) {
        Logger.error('Failed to update liability: ' + JSON.stringify(error as Error));
      }
    }
  };

  const handleDeleteLiability = async (id: string) => {
    if (window.confirm(t('common.deleteConfirm'))) {
      try {
        Logger.info('Deleting liability: ' + JSON.stringify({ id }));
        await dispatch(deleteLiability(id));
      } catch (error) {
        Logger.error('Failed to delete liability: ' + JSON.stringify(error as Error));
      }
    }
  };

  return (
    <LiabilitiesView
      liabilities={sortedLiabilities}
      status={status}
      totalDebt={totalDebt}
      totalMonthlyPayment={totalMonthlyPayment}
      isAddingLiability={isAddingLiability}
      editingLiability={editingLiability}
      onAddLiability={handleAddLiability}
      onUpdateLiability={handleUpdateLiability}
      onDeleteLiability={handleDeleteLiability}
      onSetIsAddingLiability={setIsAddingLiability}
      onSetEditingLiability={setEditingLiability}
      onBack={onBack}
    />
  );
};

export default LiabilitiesContainer;
