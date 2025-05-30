import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Income, IncomeFormData } from '../types';
import { Button } from '../ui/Button';
import { FormField } from '../ui/FormField';

const incomeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['salary', 'rental', 'dividend', 'interest', 'side_hustle', 'other']),
  paymentFrequency: z.enum(['monthly', 'quarterly', 'annually', 'custom']),
  amount: z.number().min(0, 'Amount must be positive'),
  isPassive: z.boolean(),
  customSchedule: z.array(z.number()).optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  notes: z.string().optional(),
});

interface IncomeFormProps {
  initialData?: Income;
  onSubmit: (data: IncomeFormData) => void;
  onCancel: () => void;
  assets?: Array<{ id: string; name: string }>;
}

export const IncomeForm: React.FC<IncomeFormProps> = ({ initialData, onSubmit, onCancel, assets = [] }) => {
  const { t } = useTranslation();
  const today = new Date().toISOString().split('T')[0];
  
  const typeOptions = [
    { value: 'salary', label: t('income.types.salary') },
    { value: 'rental', label: t('income.types.rental') },
    { value: 'dividend', label: t('income.types.dividend') },
    { value: 'interest', label: t('income.types.interest') },
    { value: 'side_hustle', label: t('income.types.side_hustle') },
    { value: 'other', label: t('income.types.other') }
  ];

  const frequencyOptions = [
    { value: 'monthly', label: t('frequency.monthly') },
    { value: 'quarterly', label: t('frequency.quarterly') },
    { value: 'annually', label: t('frequency.annually') },
    { value: 'custom', label: t('frequency.custom') }
  ];

  const { register, handleSubmit, watch, formState: { errors } } = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      type: initialData.type,
      paymentFrequency: initialData.paymentSchedule.frequency === 'none' 
        ? 'monthly' 
        : initialData.paymentSchedule.frequency as 'monthly' | 'quarterly' | 'annually' | 'custom',
      amount: initialData.paymentSchedule.amount,
      customSchedule: initialData.paymentSchedule.months,
      isPassive: initialData.isPassive,
      startDate: initialData.startDate,
      endDate: initialData.endDate,
      notes: initialData.notes,
    } : {
      name: '',
      type: 'salary',
      paymentFrequency: 'monthly',
      amount: 0,
      isPassive: false,
      startDate: today,
      notes: '',
    }
  });

  const paymentFrequency = watch('paymentFrequency');
  const incomeType = watch('type');

  const handleFormSubmit: SubmitHandler<IncomeFormData> = (data) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label={t('common.name')}
          name="name"
          register={register}
          error={errors.name?.message}
          required
        />

        <FormField
          label={t('income.form.type')}
          name="type"
          register={register}
          type="select"
          options={typeOptions}
          required
        />

        <FormField
          label={t('income.form.paymentFrequency')}
          name="paymentFrequency"
          register={register}
          type="select"
          options={frequencyOptions}
          required
        />

        <FormField
          label={t('income.form.amount')}
          name="amount"
          register={register}
          type="number"
          step={0.01}
          error={errors.amount?.message}
          required
        />

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              {...register('isPassive')}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('income.form.passiveIncome')}
            </span>
          </label>
        </div>

        {paymentFrequency === 'custom' && (
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('income.form.paymentMonths')}
            </label>
            <div className="grid grid-cols-4 gap-2 mt-1">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <label key={month} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    value={month}
                    {...register('customSchedule')}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {new Date(2024, month - 1).toLocaleString('default', { month: 'short' })}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        <FormField
          label={t('common.startDate')}
          name="startDate"
          register={register}
          type="date"
          required
        />

        <FormField
          label={t('common.endDate')}
          name="endDate"
          register={register}
          type="date"
        />

        <div className="col-span-2">
          <FormField
            label={t('common.notes')}
            name="notes"
            register={register}
            type="textarea"
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit">
          {initialData ? t('common.update') : t('common.add')} {t('income.form.income')}
        </Button>
      </div>
    </form>
  );
};