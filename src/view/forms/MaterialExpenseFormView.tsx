import React from 'react';
import { Box, Typography } from '@mui/material';
import { Save, Close } from '@mui/icons-material';
import { ExpenseCategory, PaymentFrequency } from '../../types';
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
    <Box sx={{ 
      pb: { xs: 12, sm: 10 },
      pt: { xs: 3, sm: 4 },
      px: { xs: 1, sm: 2 },
      minHeight: '100vh',
      background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.03) 0%, rgba(255, 87, 34, 0.03) 100%)'
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
              placeholder={t('expenses.form.enterExpenseName')}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  minHeight: { xs: '56px', sm: '48px' }
                }
              }}
            />
            
            <SharedFormField
              label={t('expenses.form.category')}
              name="category"
              type="select"
              required
              options={categoryOptions}
              value={watch('category')}
              onChange={(value) => setValue('category', value)}
              placeholder={t('expenses.form.selectCategory')}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  minHeight: { xs: '56px', sm: '48px' }
                }
              }}
            />

            <SharedFormField
              label={t('expenses.form.paymentFrequency')}
              name="paymentSchedule.frequency"
              type="select"
              required
              options={paymentFrequencyOptions}
              value={watch('paymentSchedule.frequency')}
              onChange={(value) => setValue('paymentSchedule.frequency', value)}
              placeholder={t('expenses.form.selectFrequency')}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  minHeight: { xs: '56px', sm: '48px' }
                }
              }}
            />

            <SharedFormField
              label={t('expenses.form.paymentAmount')}
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

      <Box sx={{ 
        display: 'flex', 
        gap: { xs: 1.5, sm: 2 }, 
        position: 'fixed', 
        bottom: { xs: '16px', sm: '20px' }, 
        right: { xs: '16px', sm: '20px' }, 
        zIndex: 1100 
      }}>
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
