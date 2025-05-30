import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Liability, LiabilityType, PaymentFrequency } from '../types';
import { Button } from '../ui/Button';

const liabilitySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['mortgage', 'personal_loan', 'credit_card', 'student_loan', 'auto_loan', 'other']),
  principalAmount: z.number().min(0, 'Principal amount must be positive'),
  currentBalance: z.number().min(0, 'Current balance must be positive'),
  interestRate: z.number().min(0, 'Interest rate must be positive'),
  paymentSchedule: z.object({
    frequency: z.enum(['monthly', 'quarterly', 'annually', 'custom', 'none']),
    amount: z.number().min(0, 'Payment amount must be positive'),
    months: z.array(z.number().min(1).max(12)).optional(),
    customAmounts: z.record(z.number()).optional(),
  }),
  startDate: z.string(),
  endDate: z.string().optional(),
  notes: z.string().optional(),
});

type LiabilityFormData = z.infer<typeof liabilitySchema>;

interface LiabilityFormProps {
  initialData?: Liability;
  onSubmit: (data: LiabilityFormData) => void;
  onCancel: () => void;
}

export const LiabilityForm: React.FC<LiabilityFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const { t } = useTranslation();
  
  // Create dynamic options arrays with translations
  const liabilityTypeOptions = [
    { value: 'mortgage', label: t('liabilities.types.mortgage') },
    { value: 'personal_loan', label: t('liabilities.types.personal_loan') },
    { value: 'credit_card', label: t('liabilities.types.credit_card') },
    { value: 'student_loan', label: t('liabilities.types.student_loan') },
    { value: 'auto_loan', label: t('liabilities.types.auto_loan') },
    { value: 'other', label: t('liabilities.types.other') }
  ];

  const paymentFrequencyOptions = [
    { value: 'monthly', label: t('frequency.monthly') },
    { value: 'quarterly', label: t('frequency.quarterly') },
    { value: 'annually', label: t('frequency.annually') },
    { value: 'custom', label: t('frequency.custom') },
    { value: 'none', label: t('frequency.none') }
  ];

  const { register, handleSubmit, watch, formState: { errors } } = useForm<LiabilityFormData>({
    resolver: zodResolver(liabilitySchema),
    defaultValues: initialData || {
      type: 'personal_loan' as LiabilityType,
      paymentSchedule: {
        frequency: 'monthly' as PaymentFrequency,
        amount: 0,
      }
    }
  });

  const paymentFrequency = watch('paymentSchedule.frequency');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('common.name')} *
          </label>
          <input
            type="text"
            {...register('name')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('common.type')} *
          </label>
          <select
            {...register('type')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {liabilityTypeOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('liabilities.form.principalAmount')} *
          </label>
          <input
            type="number"
            step="0.01"
            {...register('principalAmount', { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.principalAmount && (
            <p className="mt-1 text-sm text-red-600">{errors.principalAmount.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('liabilities.form.currentBalance')} *
          </label>
          <input
            type="number"
            step="0.01"
            {...register('currentBalance', { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.currentBalance && (
            <p className="mt-1 text-sm text-red-600">{errors.currentBalance.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('liabilities.form.interestRate')} (%) *
          </label>
          <input
            type="number"
            step="0.01"
            {...register('interestRate', { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.interestRate && (
            <p className="mt-1 text-sm text-red-600">{errors.interestRate.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('liabilities.form.paymentFrequency')} *
          </label>
          <select
            {...register('paymentSchedule.frequency')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {paymentFrequencyOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {paymentFrequency !== 'none' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('liabilities.form.paymentAmount')} *
            </label>
            <input
              type="number"
              step="0.01"
              {...register('paymentSchedule.amount', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        )}

        {paymentFrequency === 'custom' && (
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('liabilities.form.paymentMonths')}
            </label>
            <div className="grid grid-cols-4 gap-2 mt-1">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <label key={month} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    value={month}
                    {...register('paymentSchedule.months')}
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

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('common.startDate')} *
          </label>
          <input
            type="date"
            {...register('startDate')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('liabilities.form.endDateOptional')}
          </label>
          <input
            type="date"
            {...register('endDate')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('common.notes')}
        </label>
        <textarea
          {...register('notes')}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit">
          {initialData ? t('liabilities.form.updateLiability') : t('liabilities.form.addLiability')}
        </Button>
      </div>
    </form>
  );
};