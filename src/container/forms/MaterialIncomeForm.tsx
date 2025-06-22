import React from 'react';
import { useTranslation } from 'react-i18next';
import { Income } from '@/types/domains/financial';
import { IncomeType } from '@/types/shared/base';
import { useSharedForm } from '../../hooks/useSharedForm';
import { createIncomeSchema } from '../../utils/validationSchemas';
import Logger from '@/service/shared/logging/Logger/logger';
import { z } from 'zod';
import { MaterialIncomeFormView } from '@/view/shared/forms/MaterialIncomeFormView';

const incomeSchema = createIncomeSchema();

type IncomeFormData = z.infer<typeof incomeSchema>;

interface IncomeFormProps {
  initialData?: Income;
  onSubmit: (data: IncomeFormData) => void;
}

export const MaterialIncomeForm: React.FC<IncomeFormProps> = ({ initialData, onSubmit }) => {
  const { t } = useTranslation();
  const today = new Date().toISOString().split('T')[0];

  const getDefaultValues = (): Partial<IncomeFormData> => {
    if (!initialData) {
      return {
        type: 'salary' as IncomeType,
        paymentSchedule: {
          frequency: 'monthly',
          amount: 0,
          dayOfMonth: 1 // Standard: erster Tag des Monats
        },
        isPassive: false,
        startDate: today
      };
    }

    return {
      ...initialData,
      paymentSchedule: {
        frequency: (initialData.paymentSchedule.frequency === 'none' ? 'monthly' : initialData.paymentSchedule.frequency) as 'monthly' | 'quarterly' | 'annually' | 'custom',
        amount: initialData.paymentSchedule.amount,
        months: initialData.paymentSchedule.months,
        dayOfMonth: initialData.paymentSchedule.dayOfMonth || 1
      },
      isPassive: initialData.isPassive,
      startDate: initialData.startDate,
      endDate: initialData.endDate,
      notes: initialData.notes,
    };
  };

  const {
    watch,
    setValue,
    formState: { errors },
    onFormSubmit
  } = useSharedForm({
    validationSchema: incomeSchema,
    defaultValues: getDefaultValues(),
    onSubmit: (data: IncomeFormData) => {
      Logger.info(`MaterialIncomeForm submit: ${JSON.stringify(data)}`);
      try {
        onSubmit(data);
      } catch (error) {
        Logger.error(`Form submission error: ${JSON.stringify(error)}`);
      }
    }
  });

  // Watched payment schedule fields
  const watchedPaymentMonths = watch('paymentSchedule.months') || [];

  const handleCustomScheduleChange = (month: number, checked: boolean) => {
    const currentMonths = [...watchedPaymentMonths];
    
    let newMonths: number[];
    if (checked) {
      newMonths = [...currentMonths, month].sort((a, b) => a - b);
    } else {
      newMonths = currentMonths.filter((m: number) => m !== month);
    }
    
    setValue('paymentSchedule.months', newMonths, { shouldValidate: true });
  };

  return (
    <MaterialIncomeFormView
      errors={errors}
      watchedPaymentMonths={watchedPaymentMonths}
      watch={watch}
      setValue={setValue}
      onFormSubmit={onFormSubmit}
      handleCustomScheduleChange={handleCustomScheduleChange}
      title={initialData ? t('income.editIncome') : t('income.addIncome')}
    />
  );
};
