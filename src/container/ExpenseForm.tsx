import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
import { FormField } from '../ui/FormField';
import { Expense } from '../types';

const expenseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.enum([
    'housing',
    'transportation',
    'food',
    'utilities',
    'insurance',
    'healthcare',
    'entertainment',
    'personal',
    'debt_payments',
    'education',
    'subscriptions',
    'other'
  ]),
  paymentFrequency: z.enum(['monthly', 'quarterly', 'annually', 'custom']),
  paymentAmount: z.number().min(0, 'Payment amount must be positive'),
  customPaymentMonths: z.array(z.number().min(1).max(12)).optional(),
  customPaymentAmounts: z.record(z.number()).optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  notes: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  initialData?: Expense;
  onSubmit: (data: any) => void; // Changed to any to match the transformed data
  onCancel: () => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const { t } = useTranslation();
  
  const categoryOptions = [
    { value: 'housing', label: t('expenses.categories.housing') },
    { value: 'transportation', label: t('expenses.categories.transportation') },
    { value: 'food', label: t('expenses.categories.food') },
    { value: 'utilities', label: t('expenses.categories.utilities') },
    { value: 'insurance', label: t('expenses.categories.insurance') },
    { value: 'healthcare', label: t('expenses.categories.healthcare') },
    { value: 'entertainment', label: t('expenses.categories.entertainment') },
    { value: 'personal', label: t('expenses.categories.personal') },
    { value: 'debt_payments', label: t('expenses.categories.debt_payments') },
    { value: 'education', label: t('expenses.categories.education') },
    { value: 'subscriptions', label: t('expenses.categories.subscriptions') },
    { value: 'other', label: t('expenses.categories.other') }
  ];

  const frequencyOptions = [
    { value: 'monthly', label: t('frequency.monthly') },
    { value: 'quarterly', label: t('frequency.quarterly') },
    { value: 'annually', label: t('frequency.annually') },
    { value: 'custom', label: t('frequency.custom') }
  ];
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      category: initialData.category as ExpenseFormData['category'],
      paymentFrequency: initialData.paymentSchedule.frequency as ExpenseFormData['paymentFrequency'],
      paymentAmount: initialData.paymentSchedule.amount,
      customPaymentMonths: initialData.paymentSchedule.months,
      customPaymentAmounts: initialData.paymentSchedule.customAmounts,
      startDate: initialData.startDate,
      endDate: initialData.endDate,
      notes: initialData.notes
    } : {
      category: 'other' as ExpenseFormData['category'],
      paymentFrequency: 'monthly' as ExpenseFormData['paymentFrequency'],
      paymentAmount: 0,
      startDate: new Date().toISOString().split('T')[0]
    }
  });

  const paymentFrequency = watch('paymentFrequency');

  const handleFormSubmit = (data: ExpenseFormData) => {
    // Transform the form data to match the Expense type
    const transformedData = {
      name: data.name,
      category: data.category,
      startDate: data.startDate,
      endDate: data.endDate,
      notes: data.notes,
      paymentSchedule: {
        frequency: data.paymentFrequency,
        amount: data.paymentAmount,
        months: data.customPaymentMonths,
        customAmounts: data.customPaymentAmounts,
      },
    };

    onSubmit(transformedData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit as any)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label={t('common.name')}
          name="name"
          register={register}
          error={errors.name?.message && t('expenses.form.nameRequired')}
          required
        />

        <FormField
          label={t('expenses.form.category')}
          name="category"
          register={register}
          type="select"
          options={categoryOptions}
          required
        />

        <FormField
          label={t('expenses.form.paymentFrequency')}
          name="paymentFrequency"
          register={register}
          type="select"
          options={frequencyOptions}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('expenses.form.paymentAmount')} *
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            {...register('paymentAmount', { 
              valueAsNumber: true,
              setValueAs: (value) => {
                if (value === '' || value === null || value === undefined) return 0;
                const num = Number(value);
                return isNaN(num) ? 0 : num;
              }
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="0.00"
          />
          {errors.paymentAmount && (
            <p className="mt-1 text-sm text-red-600">{t('expenses.form.paymentAmountPositive')}</p>
          )}
        </div>

        {paymentFrequency === 'custom' && (
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('expenses.form.paymentMonths')}
            </label>
            <div className="grid grid-cols-4 gap-2 mt-1">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <label key={month} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    value={month}
                    {...register('customPaymentMonths')}
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
          label={`${t('common.endDate')} (${t('common.optional')})`}
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
          {initialData ? t('common.update') : t('common.add')} {t('expenses.title')}
        </Button>
      </div>
    </form>
  );
};