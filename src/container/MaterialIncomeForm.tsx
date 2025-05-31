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
  useTheme
} from '@mui/material';
import { Save } from '@mui/icons-material';
import { Income, IncomeFormData } from '../types';
import { 
  MaterialForm, 
  MaterialFormField, 
  FormSection,
  SectionTitle,
  RequiredFieldsSection,
  OptionalFieldsSection
} from '../ui/MaterialForm';
import FloatingBtn, { ButtonAlignment } from '../ui/floatingBtn';

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

export const MaterialIncomeForm: React.FC<IncomeFormProps> = ({ initialData, onSubmit, onCancel, assets = [] }) => {
  const { t } = useTranslation();
  const theme = useTheme();
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

  const getDefaultValues = (): Partial<IncomeFormData> => {
    if (!initialData) {
      return {
        name: '',
        type: 'salary',
        paymentFrequency: 'monthly',
        amount: 0,
        isPassive: false,
        startDate: today,
        notes: '',
      };
    }

    return {
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
    };
  };

  const { handleSubmit, watch, formState: { errors }, setValue, getValues } = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: getDefaultValues()
  });

  const paymentFrequency = watch('paymentFrequency');
  const watchedCustomSchedule = watch('customSchedule');

  const onFormSubmit = (data: IncomeFormData) => {
    onSubmit(data);
  };

  const handleCustomScheduleChange = (month: number, checked: boolean) => {
    const currentMonths = getValues('customSchedule') || [];
    
    let newMonths: number[];
    if (checked) {
      newMonths = [...currentMonths, month].sort((a, b) => a - b);
    } else {
      newMonths = currentMonths.filter(m => m !== month);
    }
    
    setValue('customSchedule', newMonths, { shouldValidate: true });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    return handleSubmit(onFormSubmit)(e);
  };

  return (
    <Box sx={{ pb: 10 }}>
      <MaterialForm 
        title={initialData ? t('income.editIncome') : t('income.addIncome')}
        onSubmit={handleFormSubmit}
      >
        {/* Required Fields Section */}
        <RequiredFieldsSection>
          <SectionTitle>{t('common.requiredFields')}</SectionTitle>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <MaterialFormField
                label={t('common.name')}
                name="name"
                required
                error={errors.name?.message}
                value={watch('name')}
                onChange={(value) => setValue('name', value)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <MaterialFormField
                label={t('income.form.type')}
                name="type"
                type="select"
                required
                options={typeOptions}
                value={watch('type')}
                onChange={(value) => setValue('type', value)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <MaterialFormField
                label={t('income.form.paymentFrequency')}
                name="paymentFrequency"
                type="select"
                required
                options={frequencyOptions}
                value={watch('paymentFrequency')}
                onChange={(value) => setValue('paymentFrequency', value)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <MaterialFormField
                label={t('income.form.amount')}
                name="amount"
                type="number"
                required
                error={errors.amount?.message}
                value={watch('amount')}
                onChange={(value) => setValue('amount', value)}
                step={0.01}
                min={0}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <MaterialFormField
                label={t('common.startDate')}
                name="startDate"
                type="date"
                required
                value={watch('startDate')}
                onChange={(value) => setValue('startDate', value)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <MaterialFormField
                label={t('income.form.passiveIncome')}
                name="isPassive"
                type="checkbox"
                value={watch('isPassive')}
                onChange={(value) => setValue('isPassive', value)}
              />
            </Grid>
          </Grid>

          {/* Custom Payment Months for Custom Frequency */}
          {paymentFrequency === 'custom' && (
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  {t('income.form.paymentMonths')}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
                    const isChecked = watchedCustomSchedule?.includes(month) || false;
                    
                    return (
                      <Chip
                        key={month}
                        label={new Date(2024, month - 1).toLocaleString('default', { month: 'short' })}
                        clickable
                        color={isChecked ? 'primary' : 'default'}
                        variant={isChecked ? 'filled' : 'outlined'}
                        onClick={() => handleCustomScheduleChange(month, !isChecked)}
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
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <MaterialFormField
                label={t('common.endDate')}
                name="endDate"
                type="date"
                value={watch('endDate')}
                onChange={(value) => setValue('endDate', value)}
              />
            </Grid>

            <Grid item xs={12}>
              <MaterialFormField
                label={t('common.notes')}
                name="notes"
                type="textarea"
                value={watch('notes')}
                onChange={(value) => setValue('notes', value)}
                rows={3}
              />
            </Grid>
          </Grid>
        </OptionalFieldsSection>
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
