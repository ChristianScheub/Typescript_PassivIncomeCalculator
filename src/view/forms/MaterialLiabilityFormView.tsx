import React from 'react';
import { Box, Typography } from '@mui/material';
import { Save } from '@mui/icons-material';
import { LiabilityType, PaymentFrequency } from '../../types';
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

// Define the LiabilityFormData interface for the form
interface LiabilityFormData {
  name: string;
  type: LiabilityType;
  initialBalance: number;
  currentBalance: number;
  interestRate: number;
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

interface MaterialLiabilityFormViewProps {
  // Form state props
  paymentFrequency: PaymentFrequency;
  errors: any;
  
  // Form handlers
  watch: (field: string) => any;
  setValue: UseFormSetValue<LiabilityFormData>;
  onFormSubmit: () => void;
  
  // Payment schedule props
  paymentFields: {
    months?: number[];
  };
  handleMonthChange: (month: number, checked: boolean) => void;
  
  // Title
  title: string;
}

const MaterialLiabilityFormView: React.FC<MaterialLiabilityFormViewProps> = ({
  paymentFrequency,
  errors,
  watch,
  setValue,
  onFormSubmit,
  paymentFields,
  handleMonthChange,
  title
}) => {
  const { t } = useTranslation();

  const liabilityTypeOptions = [
    { value: 'personal_loan', label: t('liabilities.types.personal_loan') },
    { value: 'mortgage', label: t('liabilities.types.mortgage') },
    { value: 'credit_card', label: t('liabilities.types.credit_card') },
    { value: 'student_loan', label: t('liabilities.types.student_loan') },
    { value: 'auto_loan', label: t('liabilities.types.auto_loan') },
    { value: 'other', label: t('liabilities.types.other') }
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
                  label={t('liabilities.form.type')}
                  name="type"
                  type="select"
                  required
                  options={liabilityTypeOptions}
                  value={watch('type')}
                  onChange={(value: LiabilityType) => setValue('type', value)}
                />
              </Box>

              <Box gridColumn={{ xs: "span 12", md: "span 6" }}>
                <SharedFormField
                  label={t('liabilities.form.initialBalance')}
                  name="initialBalance"
                  type="number"
                  required
                  error={errors.initialBalance?.message}
                  value={watch('initialBalance')}
                  onChange={(value: number) => setValue('initialBalance', value)}
                  step={0.01}
                  min={0}
                />
              </Box>

              <Box gridColumn={{ xs: "span 12", md: "span 6" }}>
                <SharedFormField
                  label={t('liabilities.form.currentBalance')}
                  name="currentBalance"
                  type="number"
                  required
                  error={errors.currentBalance?.message}
                  value={watch('currentBalance')}
                  onChange={(value: number) => setValue('currentBalance', value)}
                  step={0.01}
                  min={0}
                />
              </Box>

              <Box gridColumn={{ xs: "span 12", md: "span 6" }}>
                <SharedFormField
                  label={t('liabilities.form.interestRate')}
                  name="interestRate"
                  type="number"
                  required
                  error={errors.interestRate?.message}
                  value={watch('interestRate')}
                  onChange={(value: number) => setValue('interestRate', value)}
                  step={0.01}
                  min={0}
                />
              </Box>

              <Box gridColumn={{ xs: "span 12", md: "span 6" }}>
                <SharedFormField
                  label={t('liabilities.form.paymentFrequency')}
                  name="paymentSchedule.frequency"
                  type="select"
                  required
                  options={paymentFrequencyOptions}
                  value={watch('paymentSchedule.frequency')}
                  onChange={(value: PaymentFrequency) => setValue('paymentSchedule.frequency', value)}
                />
              </Box>

              <Box gridColumn="span 12">
                <SharedFormField
                  label={t('liabilities.form.paymentAmount')}
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
                    {t('liabilities.form.paymentMonths')}
                  </Typography>
                  <MonthSelector
                    selectedMonths={paymentFields.months || []}
                    onChange={handleMonthChange}
                    label={t('liabilities.form.paymentMonths')}
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

      <FloatingBtn
        alignment={ButtonAlignment.RIGHT}
        icon={Save}
        onClick={onFormSubmit}
      />
    </Box>
  );
};

export { MaterialLiabilityFormView };
