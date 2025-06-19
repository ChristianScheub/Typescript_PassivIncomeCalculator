import React from 'react';
import { UseFormSetValue, FieldErrors } from 'react-hook-form';
import { ExpenseFormData } from '../../../types/domains/forms';
import { FormFieldValue } from '../../../types/shared/ui/specialized';
import { ExpenseCategory } from '../../../types/shared/base/enums';
import { 
  StandardFormWrapper,
  RequiredSection,
  FormGrid,
  StandardFormField,
  CustomScheduleSection
} from '../../../ui/forms/StandardFormWrapper';
import { OptionalFieldsSection } from '../../../ui/forms';
import { useTranslation } from 'react-i18next';
import { getPaymentFrequencyOptions, getExpenseCategoryOptions } from '../../../constants';

type PaymentFrequency = 'monthly' | 'quarterly' | 'annually' | 'custom';

interface MaterialExpenseFormViewProps {
  // Form state props
  paymentFrequency: PaymentFrequency;
  errors: FieldErrors<ExpenseFormData>;
  
  // Form handlers
  watch: <K extends keyof ExpenseFormData>(field: K) => ExpenseFormData[K];
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
  
  // Type-safe onChange handlers
  const handleNameChange = (value: FormFieldValue) => {
    setValue('name', String(value));
  };
  
  const handleCategoryChange = (value: FormFieldValue) => {
    setValue('category', String(value) as ExpenseCategory);
  };
  
  const handleFrequencyChange = (value: FormFieldValue) => {
    setValue('paymentSchedule.frequency', String(value) as PaymentFrequency);
  };
  
  const handleAmountChange = (value: FormFieldValue) => {
    setValue('paymentSchedule.amount', Number(value));
  };
  
  const handleDayOfMonthChange = (value: FormFieldValue) => {
    setValue('paymentSchedule.dayOfMonth', Number(value));
  };
  
  const handleStartDateChange = (value: FormFieldValue) => {
    setValue('startDate', String(value));
  };

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
            onChange={handleNameChange}
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
            onChange={handleCategoryChange}
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
            onChange={handleFrequencyChange}
            placeholder={t('expenses.form.selectFrequency')}
          />

          <StandardFormField
            label={t('expenses.form.amount')}
            name="paymentSchedule.amount"
            type="number"
            required
            error={errors.paymentSchedule?.amount?.message}
            value={watch('paymentSchedule.amount')}
            onChange={handleAmountChange}
            placeholder="0"
            step={0.01}
            min={0}
          />

          <StandardFormField
            label={t('expenses.form.dayOfMonth')}
            name="paymentSchedule.dayOfMonth"
            type="number"
            error={errors.paymentSchedule?.dayOfMonth?.message}
            value={watch('paymentSchedule.dayOfMonth')}
            onChange={handleDayOfMonthChange}
            placeholder={t('expenses.form.dayOfMonthPlaceholder')}
            step={1}
            min={1}
            max={31}
          />

          <StandardFormField
            label={t('common.startDate')}
            name="startDate"
            type="date"
            required
            error={errors.startDate?.message}
            value={watch('startDate')}
            onChange={handleStartDateChange}
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
