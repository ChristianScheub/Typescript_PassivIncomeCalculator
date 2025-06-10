import React, { useState, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchLiabilities, addLiability, updateLiability, deleteLiability } from '../store/slices/liabilitiesSlice';
import { Liability } from '../types';
import { useTranslation } from 'react-i18next';
import Logger from '../service/Logger/logger';
import { analytics } from '../service/analytics';
import calculatorService from '../service/calculatorService';
import LiabilitiesView from '../view/liabilities/LiabilitiesView';
import { sortLiabilitiesByPayment, SortOrder } from '../utils/sortingUtils';

const LiabilitiesContainer: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { items: liabilities, status } = useAppSelector(state => state.liabilities);
  const [isAddingLiability, setIsAddingLiability] = useState(false);
  const [editingLiability, setEditingLiability] = useState<Liability | null>(null);

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
      analytics.trackEvent('liability_add', { type: data.type });
      await dispatch(addLiability(data));
      setIsAddingLiability(false);
    } catch (error) {
      Logger.error('Failed to add liability' + " - " + JSON.stringify(error as Error));
    }
  };

  const handleUpdateLiability = async (data: any) => {
    if (editingLiability) {
      try {
        Logger.info('Updating liability' + " - " + JSON.stringify({ id: editingLiability.id, data }));
        analytics.trackEvent('liability_update', { id: editingLiability.id, type: data.type });
        await dispatch(updateLiability({ ...data, id: editingLiability.id }));
        setEditingLiability(null);
      } catch (error) {
        Logger.error('Failed to update liability' + " - " + JSON.stringify(error as Error));
      }
    }
  };

  const handleDeleteLiability = async (id: string) => {
    if (window.confirm(t('common.deleteConfirm'))) {
      try {
        Logger.info('Deleting liability' + " - " + JSON.stringify({ id }));
        analytics.trackEvent('liability_delete', { id });
        await dispatch(deleteLiability(id));
      } catch (error) {
        Logger.error('Failed to delete liability' + " - " + JSON.stringify(error as Error));
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
    />
  );
};

export default LiabilitiesContainer;
