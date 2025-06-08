import React from 'react';
import { LiabilityType, PaymentFrequency } from '../../types';
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
    <StandardFormWrapper
      title={title}
      onSubmit={onFormSubmit}
      backgroundColor="linear-gradient(135deg, rgba(255, 152, 0, 0.03) 0%, rgba(255, 193, 7, 0.03) 100%)"
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
            placeholder={t('liabilities.form.enterLiabilityName')}
          />

          <StandardFormField
            label={t('liabilities.form.type')}
            name="type"
            type="select"
            required
            options={liabilityTypeOptions}
            error={errors.type?.message}
            value={watch('type')}
            onChange={(value) => setValue('type', value)}
            placeholder={t('liabilities.form.selectType')}
          />

          <StandardFormField
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
          />

          <StandardFormField
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
          />

          <StandardFormField
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
          />

          <StandardFormField
            label={t('liabilities.form.paymentFrequency')}
            name="paymentSchedule.frequency"
            type="select"
            required
            options={paymentFrequencyOptions}
            error={errors.paymentSchedule?.frequency?.message}
            value={watch('paymentSchedule.frequency')}
            onChange={(value) => setValue('paymentSchedule.frequency', value)}
            placeholder={t('liabilities.form.selectFrequency')}
          />

          <StandardFormField
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
        title={t('liabilities.form.paymentMonths')}
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

export { MaterialLiabilityFormView };
