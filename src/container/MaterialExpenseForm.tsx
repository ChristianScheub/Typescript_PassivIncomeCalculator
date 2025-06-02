import { Expense, ExpenseCategory, PaymentFrequency } from '../types';
import { usePaymentSchedule } from '../hooks/usePaymentSchedule';
import { useSharedForm } from '../hooks/useSharedForm';
import { createValidationSchema, createPaymentScheduleSchema } from '../utils/validationSchemas';
import { useTranslation } from 'react-i18next';
import Logger from '../service/Logger/logger';
import { z } from 'zod';
import { MaterialExpenseFormView } from '../view/forms/MaterialExpenseFormView';

// Create expense schema using shared schema utilities
const expenseSchema = createValidationSchema({
  category: z.enum([
    'housing',
    'transportation',
    'food',
    'utilities',
    'insurance',
    'healthcare',
    'entertainment',
    'personal',
    'debt_payments',
    'education',
    'subscriptions',
    'other'
  ]),
  paymentSchedule: createPaymentScheduleSchema(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  initialData?: Expense;
  onSubmit: (data: ExpenseFormData) => void;
}

export const MaterialExpenseForm = ({ initialData, onSubmit }: ExpenseFormProps) => {
  const { t } = useTranslation();

  const getDefaultValues = (): Partial<ExpenseFormData> => {
    if (!initialData) {
      return {
        category: 'other' as ExpenseCategory,
        paymentSchedule: {
          frequency: 'monthly' as PaymentFrequency,
          amount: 0,
        },
        startDate: new Date().toISOString().split('T')[0]
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
    validationSchema: expenseSchema,
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
    <MaterialExpenseFormView
      paymentFrequency={paymentFrequency}
      errors={errors}
      watch={watch}
      setValue={setValue}
      onFormSubmit={onFormSubmit}
      paymentFields={paymentFields}
      handleMonthChange={handleMonthChange}
      title={initialData ? t('expenses.editExpense') : t('expenses.addExpense')}
    />
  );
};
