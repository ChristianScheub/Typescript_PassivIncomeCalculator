import React from 'react';
import { Grid } from '@mui/material';
import { Expense } from '../types';
import { 
  MaterialForm, 
  MaterialFormField, 
  RequiredFieldsSection,
  OptionalFieldsSection,
  SectionTitle 
} from '../ui/MaterialForm';
import { MonthSelector } from '../ui/MonthSelector';
import { usePaymentSchedule } from '../hooks/usePaymentSchedule';
import { useFormConfig } from '../hooks/useFormConfig';
import { createValidationSchema, createPaymentScheduleSchema } from '../utils/validationSchemas';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';

const expenseSchema = createValidationSchema({
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
  paymentSchedule: createPaymentScheduleSchema(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  initialData?: Expense;
  onSubmit: (data: ExpenseFormData) => void;
}

export const MaterialExpenseForm: React.FC<ExpenseFormProps> = ({ initialData, onSubmit }) => {
  const { t } = useTranslation();

  const frequencyOptions = [
    { value: 'monthly', label: t('frequency.monthly') },
    { value: 'quarterly', label: t('frequency.quarterly') },
    { value: 'annually', label: t('frequency.annually') },
    { value: 'custom', label: t('frequency.custom') }
  ];
  
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

  const { fields: paymentFields, handleMonthChange } = usePaymentSchedule(initialData?.paymentSchedule);
  const formConfig = useFormConfig({
    onSubmit,
    validationSchema: expenseSchema,
    defaultValues: initialData || {
      category: 'other',
      paymentSchedule: {
        frequency: 'monthly',
        amount: 0,
      },
      startDate: new Date().toISOString().split('T')[0]
    }
  });

  const { watch, setValue, formState: { errors } } = formConfig;
  const paymentFrequency = watch('paymentSchedule.frequency');

  return (
    <MaterialForm 
      title={initialData ? t('expenses.editExpense') : t('expenses.addExpense')}
      onSubmit={formConfig.onFormSubmit}
    >
      <RequiredFieldsSection>
        <SectionTitle>{t('common.requiredFields')}</SectionTitle>
        
        <Grid container spacing={3}>
          <Grid component="div" sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
            <MaterialFormField
              label={t('common.name')}
              name="name"
              required
              error={errors.name?.message}
              value={watch('name')}
              onChange={(value) => setValue('name', value)}
            />
          </Grid>

          <Grid component="div" sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
            <MaterialFormField
              label={t('expenses.form.category')}
              name="category"
              type="select"
              required
              options={categoryOptions}
              value={watch('category')}
              onChange={(value) => setValue('category', value)}
            />
          </Grid>

          <Grid component="div" sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
            <MaterialFormField
              label={t('expenses.form.paymentFrequency')}
              name="paymentSchedule.frequency"
              type="select"
              required
              options={frequencyOptions}
              value={watch('paymentSchedule.frequency')}
              onChange={(value) => setValue('paymentSchedule.frequency', value)}
            />
          </Grid>

          <Grid component="div" sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
            <MaterialFormField
              label={t('expenses.form.paymentAmount')}
              name="paymentSchedule.amount"
              type="number"
              required
              error={errors.paymentSchedule?.amount?.message}
              value={watch('paymentSchedule.amount')}
              onChange={(value) => setValue('paymentSchedule.amount', value)}
              step={0.01}
              min={0}
            />
          </Grid>

          <Grid component="div" sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
            <MaterialFormField
              label={t('common.startDate')}
              name="startDate"
              type="date"
              required
              value={watch('startDate')}
              onChange={(value) => setValue('startDate', value)}
            />
          </Grid>

          {paymentFrequency === 'custom' && (
            <Grid component="div" sx={{ gridColumn: 'span 12' }}>
              <MonthSelector
                selectedMonths={paymentFields.months || []}
                onChange={handleMonthChange}
                label={t('expenses.form.paymentMonths')}
              />
            </Grid>
          )}
        </Grid>
      </RequiredFieldsSection>

      <OptionalFieldsSection>
        <SectionTitle>{t('common.optionalFields')}</SectionTitle>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MaterialFormField
            label={t('common.endDate')}
            name="endDate"
            type="date"
            value={watch('endDate')}
            onChange={(value) => setValue('endDate', value)}
          />

          <div className="md:col-span-2">
            <MaterialFormField
              label={t('common.notes')}
              name="notes"
              type="textarea"
              value={watch('notes')}
              onChange={(value) => setValue('notes', value)}
              rows={3}
            />
          </div>
        </div>
      </OptionalFieldsSection>
    </MaterialForm>
  );
};
