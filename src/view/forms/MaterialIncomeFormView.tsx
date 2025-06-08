import React from 'react';
import { IncomeType, PaymentFrequency } from '../../types';
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
    <StandardFormWrapper
      title={title}
      onSubmit={onFormSubmit}
      backgroundColor="linear-gradient(135deg, rgba(76, 175, 80, 0.03) 0%, rgba(139, 195, 74, 0.03) 100%)"
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
            placeholder={t('income.form.enterIncomeName')}
          />

          <StandardFormField
            label={t('income.form.type')}
            name="type"
            type="select"
            required
            options={typeOptions}
            value={watch('type')}
            onChange={(value) => setValue('type', value)}
            placeholder={t('income.form.selectIncomeType')}
          />

          <StandardFormField
            label={t('income.form.paymentFrequency')}
            name="paymentSchedule.frequency"
            type="select"
            required
            options={frequencyOptions}
            error={errors.paymentSchedule?.frequency?.message}
            value={watch('paymentSchedule.frequency')}
            onChange={(value) => setValue('paymentSchedule.frequency', value)}
            placeholder={t('income.form.selectFrequency')}
          />

          <StandardFormField
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
          />

          <StandardFormField
            label={t('common.startDate')}
            name="startDate"
            type="date"
            required
            value={watch('startDate')}
            onChange={(value) => setValue('startDate', value)}
          />

          <StandardFormField
            label={t('income.form.passiveIncome')}
            name="isPassive"
            type="checkbox"
            value={watch('isPassive')}
            onChange={(value) => setValue('isPassive', value)}
          />
        </FormGrid>
      </RequiredSection>

      <CustomScheduleSection
        frequency={watch('paymentSchedule.frequency')}
        selectedMonths={watchedPaymentMonths}
        onMonthChange={handleCustomScheduleChange}
        title={t('income.form.paymentMonths')}
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
