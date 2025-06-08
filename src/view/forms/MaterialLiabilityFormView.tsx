import React from 'react';
import { Box, Typography } from '@mui/material';
import { Save } from '@mui/icons-material';
import { LiabilityType, PaymentFrequency } from '../../types';
import { UseFormSetValue } from 'react-hook-form';
import { 
  MaterialForm, 
  SectionTitle,
  RequiredFieldsSection
} from '../../ui/MaterialForm';
import { SharedFormField } from '../../ui/SharedFormField';
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
    <Box sx={{ 
      pb: { xs: 12, sm: 10 },
      pt: { xs: 3, sm: 4 },
      px: { xs: 1, sm: 2 },
      minHeight: '100vh',
      background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.03) 0%, rgba(255, 193, 7, 0.03) 100%)'
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
              placeholder={t('liabilities.form.enterLiabilityName')}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  minHeight: { xs: '56px', sm: '48px' }
                }
              }}
            />
            
            <SharedFormField
              label={t('liabilities.form.type')}
              name="type"
              type="select"
              required
              options={liabilityTypeOptions}
              value={watch('type')}
              onChange={(value) => setValue('type', value)}
              placeholder={t('liabilities.form.selectLiabilityType')}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  minHeight: { xs: '56px', sm: '48px' }
                }
              }}
            />

            <SharedFormField
              label={t('liabilities.form.initialBalance')}
              name="initialBalance"
              type="number"
              required
              error={errors.initialBalance?.message}
              value={watch('initialBalance')}
              onChange={(value) => setValue('initialBalance', value)}
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
              label={t('liabilities.form.currentBalance')}
              name="currentBalance"
              type="number"
              required
              error={errors.currentBalance?.message}
              value={watch('currentBalance')}
              onChange={(value) => setValue('currentBalance', value)}
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
              label={t('liabilities.form.interestRate')}
              name="interestRate"
              type="number"
              required
              error={errors.interestRate?.message}
              value={watch('interestRate')}
              onChange={(value) => setValue('interestRate', value)}
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
              label={t('liabilities.form.paymentFrequency')}
              name="paymentSchedule.frequency"
              type="select"
              required
              options={paymentFrequencyOptions}
              value={watch('paymentSchedule.frequency')}
              onChange={(value) => setValue('paymentSchedule.frequency', value)}
              placeholder={t('liabilities.form.selectFrequency')}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  minHeight: { xs: '56px', sm: '48px' }
                }
              }}
            />

            <SharedFormField
              label={t('liabilities.form.paymentAmount')}
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
                gridColumn: { xs: '1', sm: 'span 1' },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  minHeight: { xs: '56px', sm: '48px' }
                }
              }}
            />

            <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
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
            </Box>

            {paymentFrequency === 'custom' && (
              <Box sx={{ 
                gridColumn: { xs: '1', sm: '1 / -1' }, 
                mt: { xs: 2, sm: 3 },
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

export { MaterialLiabilityFormView };
