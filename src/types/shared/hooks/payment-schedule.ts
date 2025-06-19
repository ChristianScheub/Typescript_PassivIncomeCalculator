/**
 * Payment schedule hook types
 */

import { PaymentFrequency } from '../base/enums';

export interface PaymentScheduleFields {
  frequency: PaymentFrequency;
  amount: number;
  months?: number[];
  customAmounts?: Record<number, number>;
  paymentMonths?: number[];
}
