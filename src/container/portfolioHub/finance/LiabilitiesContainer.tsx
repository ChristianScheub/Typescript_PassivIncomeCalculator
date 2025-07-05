import React, { useState, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { addLiability, updateLiability, deleteLiability } from '@/store/slices/liabilitiesSlice';
import { Liability } from '@/types/domains/financial';
import { useTranslation } from 'react-i18next';
import calculatorService from '@/service/domain/financial/calculations/compositeCalculatorService';
import LiabilitiesView from '@/view/portfolio-hub/liabilities/LiabilitiesView';
import { sortLiabilitiesByPayment, SortOrder } from '../../../utils/sortingUtils';
import { useAsyncOperation } from '@/utils/containerUtils';

const LiabilitiesContainer: React.FC<{ onBack?: () => void; initialAction?: string }> = ({ onBack, initialAction }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { executeAsyncOperation } = useAsyncOperation();
  const { items: liabilities, status } = useAppSelector(state => state.liabilities);
  const [isAddingLiability, setIsAddingLiability] = useState(false);
  const [editingLiability, setEditingLiability] = useState<Liability | null>(null);

  // Handle initial action to open forms directly
  useEffect(() => {
    if (initialAction === 'addDebt') {
      setIsAddingLiability(true);
    }
  }, [initialAction]);

  const totalDebt = calculatorService.calculateTotalDebt(liabilities);
  const totalMonthlyPayment = calculatorService.calculateTotalMonthlyLiabilityPayments(liabilities);

  // Sort liabilities by monthly payment (highest to lowest)
  const sortedLiabilities = useMemo(() => {
    return sortLiabilitiesByPayment(liabilities, SortOrder.DESC);
  }, [liabilities]);

  const handleAddLiability = (data: Liability) => {
    executeAsyncOperation(
      'add liability',
      () => dispatch(addLiability(data)),
      () => setIsAddingLiability(false)
    );
  };

  const handleUpdateLiability = (data: Liability) => {
    if (editingLiability) {
      executeAsyncOperation(
        'update liability',
        () => dispatch(updateLiability({ ...data, id: editingLiability.id })),
        () => setEditingLiability(null)
      );
    }
  };

  const handleDeleteLiability = (id: string) => {
    if (window.confirm(t('common.deleteConfirm'))) {
      executeAsyncOperation(
        'delete liability',
        () => dispatch(deleteLiability(id))
      );
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
