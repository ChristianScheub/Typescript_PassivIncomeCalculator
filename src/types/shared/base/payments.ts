/**
 * Payment and Schedule Types - Generic Payment Infrastructure
 */

import { PaymentFrequency } from './enums';

export interface RecurringPayment {
  id: string;
  name: string;
  amount: number;
  frequency: PaymentFrequency;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  category?: string;
  description?: string;
  tags?: string[];
  nextPaymentDate?: string;
  lastPaymentDate?: string;
  totalPaid?: number;
  paymentsRemaining?: number;
}

export interface PaymentReminder {
  id: string;
  paymentId: string;
  reminderDate: string;
  reminderType: 'email' | 'notification' | 'sms';
  message: string;
  isActive: boolean;
  isSent: boolean;
}

export interface PaymentSchedule {
  frequency: PaymentFrequency;
  amount: number;
  months?: number[];
  customAmounts?: Record<number, number>;
  paymentMonths?: number[];
}
