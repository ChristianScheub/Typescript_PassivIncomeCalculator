import { Liability, LiabilityType, PaymentFrequency } from '@/types/shared/base';
import { usePaymentSchedule } from '../../hooks/usePaymentSchedule';
import { useSharedForm } from '../../hooks/useSharedForm';
import { createValidationSchema, createPaymentScheduleSchema } from '../../utils/validationSchemas';
import { useTranslation } from 'react-i18next';
import Logger from '../../service/shared/logging/Logger/logger';
import { z } from 'zod';
import { MaterialLiabilityFormView } from '../../view/shared/forms/MaterialLiabilityFormView';

// Create liability schema using shared schema utilities
const liabilitySchema = createValidationSchema({
  type: z.enum(['mortgage', 'personal_loan', 'credit_card', 'student_loan', 'auto_loan', 'other']),
  initialBalance: z.number().min(0, 'Initial balance must be positive'),
  currentBalance: z.number().min(0, 'Current balance must be positive'),
  interestRate: z.number().min(0, 'Interest rate must be positive'),
  paymentSchedule: createPaymentScheduleSchema(),
});

type LiabilityFormData = z.infer<typeof liabilitySchema>;

interface LiabilityFormProps {
  initialData?: Liability;
  onSubmit: (data: LiabilityFormData) => void;
}

export const MaterialLiabilityForm = ({ initialData, onSubmit }: LiabilityFormProps) => {
  const { t } = useTranslation();

  const getDefaultValues = (): Partial<LiabilityFormData> => {
    if (!initialData) {
      return {
        type: 'personal_loan' as LiabilityType,
        paymentSchedule: {
          frequency: 'monthly' as PaymentFrequency,
          amount: 0,
        }
      };
    }
    return initialData;
  };
  
  const { fields: paymentFields, handleMonthChange } = usePaymentSchedule(initialData?.paymentSchedule);
  
  const {
    watch,
    setValue,
    formState: { errors },
    onFormSubmit
  } = useSharedForm({
    validationSchema: liabilitySchema,
    defaultValues: getDefaultValues(),
    onSubmit: (data) => {
      try {
        onSubmit(data);
      } catch (error) {
        Logger.error(`Form submission error: ${JSON.stringify(error)}`);
      }
    }
  });

  const paymentFrequency = watch('paymentSchedule.frequency');

  return (
    <MaterialLiabilityFormView
      paymentFrequency={paymentFrequency}
      errors={errors}
      watch={watch}
      setValue={setValue}
      onFormSubmit={onFormSubmit}
      paymentFields={paymentFields}
      handleMonthChange={handleMonthChange}
      title={initialData ? t('liabilities.editLiability') : t('liabilities.addLiability')}
    />
  );
};
