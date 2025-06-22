import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PaymentSchedule } from '@/types/shared/base/payments';
import { PaymentScheduleFields } from '@/types/shared/hooks/payment-schedule';
import { createPaymentScheduleSchema } from '../utils/validationSchemas';
import Logger from '@/service/shared/logging/Logger/logger';

export function usePaymentSchedule(initialData?: PaymentSchedule): {
  fields: PaymentScheduleFields;
  handleMonthChange: (month: number, checked: boolean) => void;
  handleCustomAmountChange: (month: number, amount: number) => void;
  form: UseFormReturn<PaymentScheduleFields>;
} {
  const form = useForm<PaymentScheduleFields>({
    resolver: zodResolver(createPaymentScheduleSchema()),
    defaultValues: {
      frequency: initialData?.frequency || 'monthly',
      amount: initialData?.amount || 0,
      months: initialData?.months || [],
      customAmounts: initialData?.customAmounts || {},
      paymentMonths: initialData?.paymentMonths || [],
    },
  });

  const { watch, setValue, getValues, formState: { errors } } = form;
  const fields = watch();

  // Log validation errors in development
  if (process.env.NODE_ENV === 'development' && Object.keys(errors).length > 0) {
    Logger.error(`Payment schedule validation errors: ${JSON.stringify(errors)}`);
  }

  const handleMonthChange = (month: number, checked: boolean) => {
    const currentMonths = getValues('months') || [];
    let newMonths: number[];
    
    if (checked) {
      newMonths = [...currentMonths, month].sort((a, b) => a - b);
    } else {
      newMonths = currentMonths.filter(m => m !== month);
    }
    
    Logger.info(`Updating payment months: ${JSON.stringify(newMonths)}`);
    setValue('months', newMonths, { shouldValidate: true });
  };

  const handleCustomAmountChange = (month: number, amount: number) => {
    const currentAmounts = getValues('customAmounts') || {};
    Logger.info(`Updating custom amount for month ${month}: ${amount}`);
    setValue('customAmounts', {
      ...currentAmounts,
      [month]: amount
    }, { shouldValidate: true });
  };

  return {
    fields,
    handleMonthChange,
    handleCustomAmountChange,
    form,
  };
}
