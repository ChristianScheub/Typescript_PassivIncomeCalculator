import { DividendSchedule, PaymentSchedule } from '../../../types';

export const calculateMonthlyAmountFromFrequency = (
  amount: number,
  frequency: string,
  months?: number[]
): number => {
  switch (frequency) {
    case 'monthly':
      return amount;
    case 'quarterly':
      return amount / 3;
    case 'annually':
      return amount / 12;
    case 'custom':
      if (months) {
        const monthCount = months.length;
        return (amount * monthCount) / 12;
      }
      return 0;
    default:
      return 0;
  }
};

// Move outside to avoid lexical declaration in case block
const defaultQuarterlyMonths = [3, 6, 9, 12];

export const isPaymentMonthForFrequency = (
  monthNumber: number,
  frequency: string,
  specifiedMonths?: number[],
): boolean => {
  switch (frequency) {
    case 'monthly':
      return true;
    case 'quarterly':
      return specifiedMonths?.includes(monthNumber) ?? defaultQuarterlyMonths.includes(monthNumber);
    case 'annually':
      return specifiedMonths?.includes(monthNumber) ?? monthNumber === 12;
    case 'custom':
      return specifiedMonths?.includes(monthNumber) ?? false;
    default:
      return false;
  }
};

export const calculateAmountForPaymentMonth = (
  schedule: PaymentSchedule | DividendSchedule,
  monthNumber: number,
  quantity = 1
): number => {
  if (!schedule?.amount || schedule?.frequency === 'none') {
    return 0;
  }

  const baseAmount = schedule.amount * quantity;

  // Handle custom amounts first as they override the standard payment logic
  if (
    schedule.frequency === 'custom' &&
    'customAmounts' in schedule &&
    schedule.customAmounts?.[monthNumber]
  ) {
    return schedule.customAmounts[monthNumber] * quantity;
  }

  // Use correct months property depending on schedule type
  let months: number[] | undefined;
  if ('paymentMonths' in schedule && schedule.paymentMonths) {
    months = schedule.paymentMonths;
  } else if ('months' in schedule && schedule.months) {
    months = schedule.months;
  }

  // Check if this is a payment month for the given frequency
  return isPaymentMonthForFrequency(monthNumber, schedule.frequency, months)
    ? baseAmount
    : 0;
};
