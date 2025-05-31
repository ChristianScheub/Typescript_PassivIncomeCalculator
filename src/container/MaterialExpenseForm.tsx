import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { 
  Box, 
  Typography,
  Chip
} from '@mui/material';
import { Save } from '@mui/icons-material';
import { Expense } from '../types';
import { 
  MaterialForm, 
  MaterialFormField, 
  SectionTitle,
  RequiredFieldsSection,
  OptionalFieldsSection
} from '../ui/MaterialForm';
import FloatingBtn, { ButtonAlignment } from '../ui/floatingBtn';

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
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const MaterialExpenseForm: React.FC<ExpenseFormProps> = ({ initialData, onSubmit, onCancel }) => {
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

  const getDefaultValues = (): Partial<ExpenseFormData> => {
    if (!initialData) {
      return {
        category: 'other',
        paymentFrequency: 'monthly',
        paymentAmount: 0,
        startDate: new Date().toISOString().split('T')[0]
      };
    }

    return {
      name: initialData.name,
      category: initialData.category as ExpenseFormData['category'],
      paymentFrequency: initialData.paymentSchedule.frequency as ExpenseFormData['paymentFrequency'],
      paymentAmount: initialData.paymentSchedule.amount,
      customPaymentMonths: initialData.paymentSchedule.months,
      customPaymentAmounts: initialData.paymentSchedule.customAmounts,
      startDate: initialData.startDate,
      endDate: initialData.endDate,
      notes: initialData.notes
    };
  };

  const { handleSubmit, watch, formState: { errors }, setValue, getValues } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: getDefaultValues()
  });

  const paymentFrequency = watch('paymentFrequency');
  const watchedCustomPaymentMonths = watch('customPaymentMonths');

  const onFormSubmit = (data: ExpenseFormData) => {
    const transformedData = {
      name: data.name,
      category: data.category,
      amount: data.paymentAmount,
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

  const handleCustomPaymentMonthChange = (month: number, checked: boolean) => {
    const currentMonths = getValues('customPaymentMonths') || [];
    
    let newMonths: number[];
    if (checked) {
      newMonths = [...currentMonths, month].sort((a, b) => a - b);
    } else {
      newMonths = currentMonths.filter(m => m !== month);
    }
    
    setValue('customPaymentMonths', newMonths, { shouldValidate: true });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    return handleSubmit(onFormSubmit)(e);
  };

  return (
    <Box sx={{ pb: 10, position: 'relative' }}>
      {/* Overlay for closing the form */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-10"
        onClick={onCancel}
      ></div>

      <Box sx={{ position: 'relative', zIndex: 20 }}>
        <MaterialForm 
          title={initialData ? t('expenses.editExpense') : t('expenses.addExpense')}
          onSubmit={handleFormSubmit}
        >
          {/* Required Fields Section */}
          <RequiredFieldsSection>
            <SectionTitle>{t('common.requiredFields')}</SectionTitle>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MaterialFormField
                label={t('common.name')}
                name="name"
                required
                error={errors.name?.message}
                value={watch('name')}
                onChange={(value) => setValue('name', value)}
              />

              <MaterialFormField
                label={t('expenses.form.category')}
                name="category"
                type="select"
                required
                options={categoryOptions}
                value={watch('category')}
                onChange={(value) => setValue('category', value)}
              />

              <MaterialFormField
                label={t('expenses.form.paymentFrequency')}
                name="paymentFrequency"
                type="select"
                required
                options={frequencyOptions}
                value={watch('paymentFrequency')}
                onChange={(value) => setValue('paymentFrequency', value)}
              />

              <MaterialFormField
                label={t('expenses.form.paymentAmount')}
                name="paymentAmount"
                type="number"
                required
                error={errors.paymentAmount?.message}
                value={watch('paymentAmount')}
                onChange={(value) => setValue('paymentAmount', value)}
                step={0.01}
                min={0}
              />

              <MaterialFormField
                label={t('common.startDate')}
                name="startDate"
                type="date"
                required
                value={watch('startDate')}
                onChange={(value) => setValue('startDate', value)}
              />
            </div>

            {/* Custom Payment Months for Custom Frequency */}
            {paymentFrequency === 'custom' && (
              <div className="mt-6">
                <div className="w-full">
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                    {t('expenses.form.paymentMonths')}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
                      const isChecked = watchedCustomPaymentMonths?.includes(month) || false;
                      
                      return (
                        <Chip
                          key={month}
                          label={new Date(2024, month - 1).toLocaleString('default', { month: 'short' })}
                          clickable
                          color={isChecked ? 'primary' : 'default'}
                          variant={isChecked ? 'filled' : 'outlined'}
                          onClick={() => handleCustomPaymentMonthChange(month, !isChecked)}
                        />
                      );
                    })}
                  </Box>
                </div>
              </div>
            )}
          </RequiredFieldsSection>

          {/* Optional Fields Section */}
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
      </Box>

      {/* Floating Save Button */}
      <FloatingBtn
        alignment={ButtonAlignment.RIGHT}
        icon={Save}
        onClick={() => handleSubmit(onFormSubmit)()}
      />
    </Box>
  );
};
