import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { 
  Grid, 
  Box, 
  Typography,
  Chip,
  Button
} from '@mui/material';
import { Save } from '@mui/icons-material';
import { Liability, LiabilityType, PaymentFrequency } from '../types';
import { 
  MaterialForm, 
  MaterialFormField, 
  SectionTitle,
  RequiredFieldsSection,
  OptionalFieldsSection
} from '../ui/MaterialForm';
import FloatingBtn, { ButtonAlignment } from '../ui/floatingBtn';

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

export const MaterialLiabilityForm: React.FC<LiabilityFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const { t } = useTranslation();
  
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

  const getDefaultValues = (): Partial<LiabilityFormData> => {
    if (!initialData) {
      return {
        type: 'personal_loan' as LiabilityType,
        paymentSchedule: {
          frequency: 'monthly' as PaymentFrequency,
          amount: 0,
        }
      };
    }

    return initialData;
  };

  const { handleSubmit, watch, formState: { errors }, setValue, getValues } = useForm<LiabilityFormData>({
    resolver: zodResolver(liabilitySchema),
    defaultValues: getDefaultValues()
  });

  const paymentFrequency = watch('paymentSchedule.frequency');
  const watchedPaymentMonths = watch('paymentSchedule.months');

  const onFormSubmit = (data: LiabilityFormData) => {
    onSubmit(data);
  };

  const handlePaymentMonthChange = (month: number, checked: boolean) => {
    const currentMonths = getValues('paymentSchedule.months') || [];
    
    let newMonths: number[];
    if (checked) {
      newMonths = [...currentMonths, month].sort((a, b) => a - b);
    } else {
      newMonths = currentMonths.filter(m => m !== month);
    }
    
    setValue('paymentSchedule.months', newMonths, { shouldValidate: true });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    return handleSubmit(onFormSubmit)(e);
  };

  return (
    <Box sx={{ pb: 10 }}>
      <MaterialForm 
        title={initialData ? t('liabilities.editLiability') : t('liabilities.addLiability')}
        onSubmit={handleFormSubmit}
      >
        {/* Required Fields Section */}
        <RequiredFieldsSection>
          <SectionTitle>{t('common.requiredFields')}</SectionTitle>
          
          <Grid container sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ flex: '1 1 calc(50% - 16px)', minWidth: '300px' }}>
              <MaterialFormField
                label={t('common.name')}
                name="name"
                required
                error={errors.name?.message}
                value={watch('name')}
                onChange={(value) => setValue('name', value)}
              />
            </Box>
            <Box sx={{ flex: '1 1 calc(50% - 16px)', minWidth: '300px' }}>
              <MaterialFormField
                label={t('common.type')}
                name="type"
                type="select"
                required
                options={liabilityTypeOptions}
                value={watch('type')}
                onChange={(value) => setValue('type', value as LiabilityType)}
              />
            </Box>
            <Box sx={{ flex: '1 1 calc(50% - 16px)', minWidth: '300px' }}>
              <MaterialFormField
                label={t('liabilities.form.principalAmount')}
                name="principalAmount"
                type="number"
                required
                error={errors.principalAmount?.message}
                value={watch('principalAmount')}
                onChange={(value) => setValue('principalAmount', value)}
                step={0.01}
                min={0}
              />
            </Box>
            <Box sx={{ flex: '1 1 calc(50% - 16px)', minWidth: '300px' }}>
              <MaterialFormField
                label={t('liabilities.form.currentBalance')}
                name="currentBalance"
                type="number"
                required
                error={errors.currentBalance?.message}
                value={watch('currentBalance')}
                onChange={(value) => setValue('currentBalance', value)}
                step={0.01}
                min={0}
              />
            </Box>
            <Box sx={{ flex: '1 1 calc(50% - 16px)', minWidth: '300px' }}>
              <MaterialFormField
                label={t('liabilities.form.interestRate')}
                name="interestRate"
                type="number"
                required
                error={errors.interestRate?.message}
                value={watch('interestRate')}
                onChange={(value) => setValue('interestRate', value)}
                step={0.01}
                min={0}
                helperText="%"
              />
            </Box>
            <Box sx={{ flex: '1 1 calc(50% - 16px)', minWidth: '300px' }}>
              <MaterialFormField
                label={t('liabilities.form.paymentFrequency')}
                name="paymentFrequency"
                type="select"
                required
                options={paymentFrequencyOptions}
                value={watch('paymentSchedule.frequency')}
                onChange={(value) => setValue('paymentSchedule.frequency', value as PaymentFrequency)}
              />
            </Box>
            {paymentFrequency !== 'none' && (
              <Box sx={{ flex: '1 1 calc(50% - 16px)', minWidth: '300px' }}>
                <MaterialFormField
                  label={t('liabilities.form.paymentAmount')}
                  name="paymentAmount"
                  type="number"
                  required
                  value={watch('paymentSchedule.amount')}
                  onChange={(value) => setValue('paymentSchedule.amount', value)}
                  step={0.01}
                  min={0}
                />
              </Box>
            )}
            <Box sx={{ flex: '1 1 calc(50% - 16px)', minWidth: '300px' }}>
              <MaterialFormField
                label={t('common.startDate')}
                name="startDate"
                type="date"
                required
                value={watch('startDate')}
                onChange={(value) => setValue('startDate', value)}
              />
            </Box>
          </Grid>

          {/* Custom Payment Months for Custom Frequency */}
          {paymentFrequency === 'custom' && (
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid sx={{ width: '100%' }}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  {t('liabilities.form.paymentMonths')}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
                    const isChecked = watchedPaymentMonths?.includes(month) || false;
                    
                    return (
                      <Chip
                        key={month}
                        label={new Date(2024, month - 1).toLocaleString('default', { month: 'short' })}
                        clickable
                        color={isChecked ? 'primary' : 'default'}
                        variant={isChecked ? 'filled' : 'outlined'}
                        onClick={() => handlePaymentMonthChange(month, !isChecked)}
                      />
                    );
                  })}
                </Box>
              </Grid>
            </Grid>
          )}
        </RequiredFieldsSection>

        {/* Optional Fields Section */}
        <OptionalFieldsSection>
          <SectionTitle>{t('common.optionalFields')}</SectionTitle>
          
          <Grid container sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ flex: '1 1 calc(50% - 16px)', minWidth: '300px' }}>
              <MaterialFormField
                label={t('liabilities.form.endDateOptional')}
                name="endDate"
                type="date"
                value={watch('endDate')}
                onChange={(value) => setValue('endDate', value)}
              />
            </Box>
            <Box sx={{ flex: '1 1 calc(50% - 16px)', minWidth: '300px' }}>
              <MaterialFormField
                label={t('common.notes')}
                name="notes"
                type="textarea"
                value={watch('notes')}
                onChange={(value) => setValue('notes', value)}
                rows={3}
              />
            </Box>
          </Grid>
        </OptionalFieldsSection>

        {/* Cancel Button */}
        <Button onClick={onCancel} variant="outlined" color="secondary">
          {t('common.cancel')}
        </Button>
      </MaterialForm>

      {/* Floating Save Button */}
      <FloatingBtn
        alignment={ButtonAlignment.RIGHT}
        icon={Save}
        onClick={() => handleSubmit(onFormSubmit)()}
      />
    </Box>
  );
};
