import React from 'react';
import { Box, Typography, Chip, useTheme } from '@mui/material';
import { Save } from '@mui/icons-material';
import { IncomeType, PaymentFrequency } from '../../types';
import { UseFormSetValue } from 'react-hook-form';
import { 
  MaterialForm, 
  SectionTitle,
  RequiredFieldsSection
} from '../../ui/MaterialForm';
import { SharedFormField } from '../../ui/SharedFormField';
import FloatingBtn, { ButtonAlignment } from '../../ui/floatingBtn';
import { useTranslation } from 'react-i18next';

// Define the IncomeFormData interface for the form
interface IncomeFormData {
  name: string;
  type: IncomeType;
  paymentSchedule: {
    frequency: PaymentFrequency;
    amount: number;
    months?: number[];
  };
  isPassive: boolean;
  startDate: string;
  endDate?: string;
  notes?: string;
  id?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface MaterialIncomeFormViewProps {
  // Form state props
  errors: any;
  watchedPaymentMonths: number[];
  
  // Form handlers
  watch: (field: string) => any;
  setValue: UseFormSetValue<IncomeFormData>;
  onFormSubmit: () => void;
  handleCustomScheduleChange: (month: number, checked: boolean) => void;
  
  // Title
  title: string;
}

export const MaterialIncomeFormView: React.FC<MaterialIncomeFormViewProps> = ({
  errors,
  watchedPaymentMonths,
  watch,
  setValue,
  onFormSubmit,
  handleCustomScheduleChange,
  title
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  // Type options for manual income entry (excludes auto-generated asset income)
  const typeOptions = [
    { value: 'salary', label: t('income.types.salary') },
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

  return (
    <Box sx={{ 
      pb: { xs: 12, sm: 10 },
      pt: { xs: 3, sm: 4 },
      px: { xs: 1, sm: 2 },
      minHeight: '100vh',
      background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.03) 0%, rgba(139, 195, 74, 0.03) 100%)'
    }}>
      <MaterialForm 
        title={title}
        onSubmit={onFormSubmit}
      >
        <RequiredFieldsSection>
          <SectionTitle sx={{ 
            fontSize: { xs: '1rem', sm: '1.1rem' }, 
            mb: { xs: 2, sm: 3 },
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            '&::before': {
              content: '"*"',
              color: 'error.main',
              fontWeight: 'bold',
              fontSize: '1.2em'
            }
          }}>
            {t('common.requiredFields')}
          </SectionTitle>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
            gap: { xs: 2.5, sm: 3 },
            mb: 2
          }}>
            <SharedFormField
              label={t('common.name')}
              name="name"
              required
              error={errors.name?.message}
              value={watch('name')}
              onChange={(value) => setValue('name', value)}
              placeholder={t('income.form.enterIncomeName')}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  minHeight: { xs: '56px', sm: '48px' }
                }
              }}
            />

            <SharedFormField
              label={t('income.form.type')}
              name="type"
              type="select"
              required
              options={typeOptions}
              value={watch('type')}
              onChange={(value) => setValue('type', value)}
              placeholder={t('income.form.selectIncomeType')}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  minHeight: { xs: '56px', sm: '48px' }
                }
              }}
            />

            <SharedFormField
              label={t('income.form.paymentFrequency')}
              name="paymentSchedule.frequency"
              type="select"
              required
              options={frequencyOptions}
              error={errors.paymentSchedule?.frequency?.message}
              value={watch('paymentSchedule.frequency')}
              onChange={(value) => setValue('paymentSchedule.frequency', value)}
              placeholder={t('income.form.selectFrequency')}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  minHeight: { xs: '56px', sm: '48px' }
                }
              }}
            />

            <SharedFormField
              label={t('income.form.amount')}
              name="paymentSchedule.amount"
              type="number"
              required
              error={errors.paymentSchedule?.amount?.message}
              value={watch('paymentSchedule.amount')}
              onChange={(value) => setValue('paymentSchedule.amount', value)}
              placeholder="0"
              step={0.01}
              min={0}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  minHeight: { xs: '56px', sm: '48px' }
                }
              }}
            />

            <SharedFormField
              label={t('common.startDate')}
              name="startDate"
              type="date"
              required
              value={watch('startDate')}
              onChange={(value) => setValue('startDate', value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  minHeight: { xs: '56px', sm: '48px' }
                }
              }}
            />

            <SharedFormField
              label={t('income.form.passiveIncome')}
              name="isPassive"
              type="checkbox"
              value={watch('isPassive')}
              onChange={(value) => setValue('isPassive', value)}
              sx={{
                '& .MuiFormControlLabel-root': {
                  height: { xs: '56px', sm: '48px' },
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center'
                }
              }}
            />
          </Box>

          {/* Custom Payment Months for Custom Frequency */}
          {watch('paymentSchedule.frequency') === 'custom' && (
            <Box sx={{ 
              mt: { xs: 3, sm: 4 },
              p: { xs: 2, sm: 3 },
              borderRadius: 2,
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <Typography variant="subtitle2" sx={{ 
                mb: { xs: 2, sm: 3 }, 
                fontWeight: 600,
                fontSize: { xs: '0.95rem', sm: '1rem' },
                color: 'primary.main'
              }}>
                {t('income.form.paymentMonths')}
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: { xs: 1, sm: 1.5 }
              }}>
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
                        minHeight: { xs: '40px', sm: '36px' },
                        fontSize: { xs: '0.875rem', sm: '0.8125rem' },
                        borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                        '&:hover': {
                          backgroundColor: isChecked ? 'primary.dark' : 'action.hover'
                        }
                      }}
                    />
                  );
                })}
              </Box>
            </Box>
          )}
        </RequiredFieldsSection>

        <Box sx={{ 
          mb: { xs: 3, sm: 4 },
          p: { xs: 2, sm: 3 },
          borderRadius: 2,
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider'
        }}>
          <SectionTitle sx={{ 
            fontSize: { xs: '1rem', sm: '1.1rem' }, 
            mb: { xs: 2, sm: 3 },
            color: 'primary.main',
            fontWeight: 600
          }}>
            {t('common.optionalFields')}
          </SectionTitle>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
            gap: { xs: 2.5, sm: 3 }
          }}>
            <SharedFormField
              label={t('common.endDate')}
              name="endDate"
              type="date"
              value={watch('endDate')}
              onChange={(value) => setValue('endDate', value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  minHeight: { xs: '56px', sm: '48px' }
                }
              }}
            />

            <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
              <SharedFormField
                label={t('common.notes')}
                name="notes"
                type="textarea"
                value={watch('notes')}
                onChange={(value) => setValue('notes', value)}
                rows={3}
                placeholder={t('common.enterNotes')}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </Box>
          </Box>
        </Box>
      </MaterialForm>

      <FloatingBtn
        alignment={ButtonAlignment.RIGHT}
        icon={Save}
        onClick={onFormSubmit}
      />
    </Box>
  );
};
