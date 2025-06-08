import React from 'react';
import { ExpenseCategory, PaymentFrequency } from '../../types';
import { UseFormSetValue } from 'react-hook-form';
import { 
  StandardFormWrapper,
  RequiredSection,
  FormGrid,
  StandardFormField,
  CustomScheduleSection
} from '../../ui/forms/StandardFormWrapper';
import { OptionalFieldsSection } from '../../ui/forms';
import { useTranslation } from 'react-i18next';
import { getPaymentFrequencyOptions, getExpenseCategoryOptions } from '../../constants';

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

  const categoryOptions = getExpenseCategoryOptions(t);
  const paymentFrequencyOptions = getPaymentFrequencyOptions(t);

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

      <OptionalFieldsSection
        endDateValue={watch('endDate')}
        notesValue={watch('notes')}
        onEndDateChange={(value) => setValue('endDate', value)}
        onNotesChange={(value) => setValue('notes', value)}
      />
    </StandardFormWrapper>
  );
};

export { MaterialExpenseFormView };
