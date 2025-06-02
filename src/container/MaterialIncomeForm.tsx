import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Grid, 
  Box, 
  Typography,
  Chip,
  useTheme
} from '@mui/material';
import { Save } from '@mui/icons-material';
import { Income, IncomeType, PaymentFrequency } from '../types';
import { 
  MaterialForm, 
  SectionTitle,
  RequiredFieldsSection,
  OptionalFieldsSection
} from '../ui/MaterialForm';
import { MaterialFormField } from '../ui/MaterialForm';
import FloatingBtn, { ButtonAlignment } from '../ui/floatingBtn';
import { useSharedForm } from '../hooks/useSharedForm';
import { createIncomeSchema } from '../utils/validationSchemas';
import Logger from '../service/Logger/logger';
import { z } from 'zod';

const incomeSchema = createIncomeSchema();

type IncomeFormData = z.infer<typeof incomeSchema>;

interface IncomeFormProps {
  initialData?: Income;
  onSubmit: (data: IncomeFormData) => void;
  onCancel: () => void;
  assets?: Array<{ id: string; name: string }>;
}

export const MaterialIncomeForm: React.FC<IncomeFormProps> = ({ initialData, onSubmit }) => {
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
        type: 'salary' as IncomeType,
        paymentSchedule: {
          frequency: 'monthly' as PaymentFrequency,
          amount: 0
        },
        isPassive: false,
        startDate: today
      };
    }

    return {
      ...initialData,
      paymentSchedule: {
        frequency: initialData.paymentSchedule.frequency,
        amount: initialData.paymentSchedule.amount,
        months: initialData.paymentSchedule.months,
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
        const transformedData: Income = {
          id: initialData?.id || Date.now().toString(),
          name: data.name,
          type: data.type,
          createdAt: initialData?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isPassive: data.isPassive,
          startDate: data.startDate,
          endDate: data.endDate,
          notes: data.notes,
          paymentSchedule: {
            ...data.paymentSchedule
          }
        };

        onSubmit(transformedData);
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
    <Box sx={{ pb: 10 }}>
      <MaterialForm 
        title={initialData ? t('income.editIncome') : t('income.addIncome')}
        onSubmit={onFormSubmit}
      >
        <RequiredFieldsSection>
          <SectionTitle>{t('common.requiredFields')}</SectionTitle>
          
          <Grid container spacing={3}>
            <Grid component="div" sx={{ gridColumn: { xs: "span 12", md: "span 6" } }}>
              <MaterialFormField
                label={t('common.name')}
                name="name"
                required
                error={errors.name?.message}
                value={watch('name')}
                onChange={(value: string) => setValue('name', value)}
              />
            </Grid>

            <Grid component="div" sx={{ gridColumn: { xs: "span 12", md: "span 6" } }}>
              <MaterialFormField
                label={t('income.form.type')}
                name="type"
                type="select"
                required
                options={typeOptions}
                value={watch('type')}
                onChange={(value: IncomeType) => setValue('type', value)}
              />
            </Grid>

            <Grid component="div" sx={{ gridColumn: { xs: "span 12", md: "span 6" } }}>
              <MaterialFormField
                label={t('income.form.paymentFrequency')}
                name="paymentSchedule.frequency"
                type="select"
                required
                options={frequencyOptions}
                value={watch('paymentSchedule.frequency')}
                onChange={(value: PaymentFrequency) => setValue('paymentSchedule.frequency', value)}
              />
            </Grid>

            <Grid component="div" sx={{ gridColumn: { xs: "span 12", md: "span 6" } }}>
              <MaterialFormField
                label={t('income.form.amount')}
                name="paymentSchedule.amount"
                type="number"
                required
                error={errors.paymentSchedule?.amount?.message}
                value={watch('paymentSchedule.amount')}
                onChange={(value: number) => setValue('paymentSchedule.amount', value)}
                step={0.01}
                min={0}
              />
            </Grid>

            <Grid component="div" sx={{ gridColumn: { xs: "span 12", md: "span 6" } }}>
              <MaterialFormField
                label={t('common.startDate')}
                name="startDate"
                type="date"
                required
                value={watch('startDate')}
                onChange={(value: string) => setValue('startDate', value)}
              />
            </Grid>

            <Grid component="div" sx={{ gridColumn: { xs: "span 12", md: "span 6" } }}>
              <MaterialFormField
                label={t('income.form.passiveIncome')}
                name="isPassive"
                type="checkbox"
                value={watch('isPassive')}
                onChange={(value: boolean) => setValue('isPassive', value)}
              />
            </Grid>
          </Grid>

          {/* Custom Payment Months for Custom Frequency */}
          {watch('paymentSchedule.frequency') === 'custom' && (
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid component="div" sx={{ gridColumn: "span 12" }}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  {t('income.form.paymentMonths')}
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
                        onClick={() => handleCustomScheduleChange(month, !isChecked)}
                        sx={{
                          borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                        }}
                      />
                    );
                  })}
                </Box>
              </Grid>
            </Grid>
          )}
        </RequiredFieldsSection>

        <OptionalFieldsSection>
          <SectionTitle>{t('common.optionalFields')}</SectionTitle>
          
          <Grid container spacing={3}>
            <Grid component="div" sx={{ gridColumn: { xs: "span 12", md: "span 6" } }}>
              <MaterialFormField
                label={t('common.endDate')}
                name="endDate"
                type="date"
                value={watch('endDate')}
                onChange={(value: string) => setValue('endDate', value)}
              />
            </Grid>

            <Grid component="div" sx={{ gridColumn: "span 12" }}>
              <MaterialFormField
                label={t('common.notes')}
                name="notes"
                type="textarea"
                value={watch('notes')}
                onChange={(value: string) => setValue('notes', value)}
                rows={3}
              />
            </Grid>
          </Grid>
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
