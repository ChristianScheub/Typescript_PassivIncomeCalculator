import React from 'react';
import { LiabilityType, PaymentFrequency } from '@/types/shared/base/enums';
import { UseFormSetValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { getPaymentFrequencyOptions, getLiabilityTypeOptions } from '../../../constants';
import { CustomScheduleSection, OptionalFieldsSection,StandardFormWrapper,
  RequiredSection,
  FormGrid } from '@/ui/portfolioHub';
import { StandardFormField } from '@/ui/portfolioHub/forms';

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: any; // Complex form with nested types, keeping flexible for now
  
  // Form handlers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  watch: (field: string) => any; // Complex form interface, using any for compatibility
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
  const formRef = React.useRef<HTMLFormElement>(null);

  const liabilityTypeOptions = getLiabilityTypeOptions(t);
  const paymentFrequencyOptions = getPaymentFrequencyOptions(t);

  return (
    <StandardFormWrapper
      title={title}
      onSubmit={onFormSubmit}
      backgroundColor="linear-gradient(135deg, rgba(255, 152, 0, 0.03) 0%, rgba(255, 193, 7, 0.03) 100%)"
      formRef={formRef}
    >
      <RequiredSection>
        <FormGrid>
          <StandardFormField
            label={t('common.name')}
            name="name"
            required
            error={errors.name?.message}
            value={watch('name')}
            onChange={(value) => setValue('name', value as string)}
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
            onChange={(value) => setValue('type', value as LiabilityType)}
            placeholder={t('liabilities.form.selectType')}
          />

          <StandardFormField
            label={t('liabilities.form.initialBalance')}
            name="initialBalance"
            type="number"
            required
            error={errors.initialBalance?.message}
            value={watch('initialBalance')}
            onChange={(value) => setValue('initialBalance', Number(value))}
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
            onChange={(value) => setValue('currentBalance', Number(value))}
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
            onChange={(value) => setValue('interestRate', Number(value))}
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
            onChange={(value) => setValue('paymentSchedule.frequency', value as PaymentFrequency)}
            placeholder={t('liabilities.form.selectFrequency')}
          />

          <StandardFormField
            label={t('liabilities.form.paymentAmount')}
            name="paymentSchedule.amount"
            type="number"
            required
            error={errors.paymentSchedule?.amount?.message}
            value={watch('paymentSchedule.amount')}
            onChange={(value) => setValue('paymentSchedule.amount', Number(value))}
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
            onChange={(value) => setValue('startDate', value as string)}
          />
        </FormGrid>
      </RequiredSection>

      <CustomScheduleSection
        frequency={paymentFrequency}
        selectedMonths={paymentFields.months || []}
        onMonthChange={handleMonthChange}
        title={t('liabilities.form.paymentMonths')}
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

export { MaterialLiabilityFormView };
