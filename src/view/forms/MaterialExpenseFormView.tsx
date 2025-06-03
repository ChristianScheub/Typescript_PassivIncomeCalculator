import React from 'react';
import { Box, Typography } from '@mui/material';
import { Save, Close } from '@mui/icons-material';
import { ExpenseCategory, PaymentFrequency } from '../../types';
import { UseFormSetValue } from 'react-hook-form';
import { 
  MaterialForm, 
  SectionTitle,
  RequiredFieldsSection,
  OptionalFieldsSection
} from '../../ui/MaterialForm';
import { SharedFormField } from '../../components/SharedFormField';
import { MonthSelector } from '../../ui/MonthSelector';
import FloatingBtn, { ButtonAlignment } from '../../ui/floatingBtn';
import { useTranslation } from 'react-i18next';

// Define the ExpenseFormData interface for the form
interface ExpenseFormData {
  name: string;
  category: ExpenseCategory;
  paymentSchedule: {
    frequency: PaymentFrequency;
    amount: number;
    months?: number[];
  };
  startDate: string;
  endDate?: string;
  notes?: string;
  id?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface MaterialExpenseFormViewProps {
  // Form state props
  paymentFrequency: PaymentFrequency;
  errors: any;
  
  // Form handlers
  watch: (field: string) => any;
  setValue: UseFormSetValue<ExpenseFormData>;
  onFormSubmit: () => void;
  onCancel?: () => void;
  
  // Payment schedule props
  paymentFields: {
    months?: number[];
  };
  handleMonthChange: (month: number, checked: boolean) => void;
  
  // Title
  title: string;
}

const MaterialExpenseFormView: React.FC<MaterialExpenseFormViewProps> = ({
  paymentFrequency,
  errors,
  watch,
  setValue,
  onFormSubmit,
  onCancel,
  paymentFields,
  handleMonthChange,
  title
}) => {
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

  const paymentFrequencyOptions = [
    { value: 'monthly', label: t('frequency.monthly') },
    { value: 'quarterly', label: t('frequency.quarterly') },
    { value: 'annually', label: t('frequency.annually') },
    { value: 'custom', label: t('frequency.custom') }
  ];

  return (
    <Box sx={{ pb: 10 }}>
      <MaterialForm 
        title={title}
        onSubmit={onFormSubmit}
      >
        <RequiredFieldsSection>
          <SectionTitle>{t('common.requiredFields')}</SectionTitle>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={2}>
              <Box gridColumn={{ xs: "span 12", md: "span 6" }}>
                <SharedFormField
                  label={t('common.name')}
                  name="name"
                  required
                  error={errors.name?.message}
                  value={watch('name')}
                  onChange={(value: string) => setValue('name', value)}
                />
              </Box>
              
              <Box gridColumn={{ xs: "span 12", md: "span 6" }}>
                <SharedFormField
                  label={t('expenses.form.category')}
                  name="category"
                  type="select"
                  required
                  options={categoryOptions}
                  value={watch('category')}
                  onChange={(value: ExpenseCategory) => setValue('category', value)}
                />
              </Box>

              <Box gridColumn={{ xs: "span 12", md: "span 6" }}>
                <SharedFormField
                  label={t('expenses.form.paymentFrequency')}
                  name="paymentSchedule.frequency"
                  type="select"
                  required
                  options={paymentFrequencyOptions}
                  value={watch('paymentSchedule.frequency')}
                  onChange={(value: PaymentFrequency) => setValue('paymentSchedule.frequency', value)}
                />
              </Box>

              <Box gridColumn={{ xs: "span 12", md: "span 6" }}>
                <SharedFormField
                  label={t('expenses.form.paymentAmount')}
                  name="paymentSchedule.amount"
                  type="number"
                  required
                  error={errors.paymentSchedule?.amount?.message}
                  value={watch('paymentSchedule.amount')}
                  onChange={(value: number) => setValue('paymentSchedule.amount', value)}
                  step={0.01}
                  min={0}
                />
              </Box>

              <Box gridColumn="span 12">
                <SharedFormField
                  label={t('common.startDate')}
                  name="startDate"
                  type="date"
                  required
                  value={watch('startDate')}
                  onChange={(value: string) => setValue('startDate', value)}
                />
              </Box>

              {paymentFrequency === 'custom' && (
                <Box gridColumn="span 12" mt={2}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                    {t('expenses.form.paymentMonths')}
                  </Typography>
                  <MonthSelector
                    selectedMonths={paymentFields.months || []}
                    onChange={handleMonthChange}
                    label={t('expenses.form.paymentMonths')}
                  />
                </Box>
              )}
            </Box>
          </Box>
        </RequiredFieldsSection>

        <OptionalFieldsSection>
          <SectionTitle>{t('common.optionalFields')}</SectionTitle>
          
          <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={2}>
            <Box gridColumn={{ xs: "span 12", md: "span 6" }}>
              <SharedFormField
                label={t('common.endDate')}
                name="endDate"
                type="date"
                value={watch('endDate')}
                onChange={(value: string) => setValue('endDate', value)}
              />
            </Box>

            <Box gridColumn="span 12">
              <SharedFormField
                label={t('common.notes')}
                name="notes"
                type="textarea"
                value={watch('notes')}
                onChange={(value: string) => setValue('notes', value)}
                rows={3}
              />
            </Box>
          </Box>
        </OptionalFieldsSection>
      </MaterialForm>

      <Box sx={{ display: 'flex', gap: 2, position: 'fixed', bottom: '16px', right: '16px', zIndex: 1100 }}>
        {onCancel && (
          <FloatingBtn
            alignment={ButtonAlignment.RIGHT}
            icon={Close}
            onClick={onCancel}
            backgroundColor="error.main"
          />
        )}
        <FloatingBtn
          alignment={ButtonAlignment.RIGHT}
          icon={Save}
          onClick={onFormSubmit}
        />
      </Box>
    </Box>
  );
};

export { MaterialExpenseFormView };
