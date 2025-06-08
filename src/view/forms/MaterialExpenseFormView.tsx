import React from 'react';
import { ExpenseCategory, PaymentFrequency } from '../../types';
import { UseFormSetValue } from 'react-hook-form';
import { 
  StandardFormWrapper,
  RequiredSection,
  OptionalSection,
  FormGrid,
  StandardFormField,
  CustomScheduleSection
} from '../../ui/StandardFormWrapper';
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
    <StandardFormWrapper
      title={title}
      onSubmit={onFormSubmit}
      backgroundColor="linear-gradient(135deg, rgba(244, 67, 54, 0.03) 0%, rgba(255, 87, 34, 0.03) 100%)"
    >
      <RequiredSection>
        <FormGrid>
          <StandardFormField
            label={t('common.name')}
            name="name"
            required
            error={errors.name?.message}
            value={watch('name')}
            onChange={(value) => setValue('name', value)}
            placeholder={t('expenses.form.enterExpenseName')}
          />

          <StandardFormField
            label={t('expenses.form.category')}
            name="category"
            type="select"
            required
            options={categoryOptions}
            error={errors.category?.message}
            value={watch('category')}
            onChange={(value) => setValue('category', value)}
            placeholder={t('expenses.form.selectCategory')}
          />

          <StandardFormField
            label={t('expenses.form.paymentFrequency')}
            name="paymentSchedule.frequency"
            type="select"
            required
            options={paymentFrequencyOptions}
            error={errors.paymentSchedule?.frequency?.message}
            value={watch('paymentSchedule.frequency')}
            onChange={(value) => setValue('paymentSchedule.frequency', value)}
            placeholder={t('expenses.form.selectFrequency')}
          />

          <StandardFormField
            label={t('expenses.form.amount')}
            name="paymentSchedule.amount"
            type="number"
            required
            error={errors.paymentSchedule?.amount?.message}
            value={watch('paymentSchedule.amount')}
            onChange={(value) => setValue('paymentSchedule.amount', value)}
            placeholder="0"
            step={0.01}
            min={0}
          />

          <StandardFormField
            label={t('common.startDate')}
            name="startDate"
            type="date"
            required
            error={errors.startDate?.message}
            value={watch('startDate')}
            onChange={(value) => setValue('startDate', value)}
          />
        </FormGrid>
      </RequiredSection>

      <CustomScheduleSection
        frequency={paymentFrequency}
        selectedMonths={paymentFields.months || []}
        onMonthChange={handleMonthChange}
        title={t('expenses.form.paymentMonths')}
      />

      <OptionalSection title={t('common.optionalFields')}>
        <FormGrid>
          <StandardFormField
            label={t('common.endDate')}
            name="endDate"
            type="date"
            value={watch('endDate')}
            onChange={(value) => setValue('endDate', value)}
          />
          
          <StandardFormField
            label={t('common.notes')}
            name="notes"
            value={watch('notes')}
            onChange={(value) => setValue('notes', value)}
            placeholder={t('common.notesPlaceholder')}
            gridColumn="1 / -1"
          />
        </FormGrid>
      </OptionalSection>
    </StandardFormWrapper>
  );
};

export { MaterialExpenseFormView };
