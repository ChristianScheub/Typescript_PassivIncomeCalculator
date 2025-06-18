import { DividendSchedule, PaymentSchedule, PaymentFrequency } from '@/types/shared/base';
import Logger from '../../../Logger/logger';
import {
  calculateMonthlyAmountFromFrequency,
  calculateAmountForPaymentMonth,
} from './paymentHelpers';

export interface PaymentResult {
  monthlyAmount: number;
  annualAmount: number;
}

export const calculatePaymentSchedule = (schedule: PaymentSchedule): PaymentResult => {
  Logger.infoService(`calculatePaymentSchedule - frequency: ${schedule?.frequency}, amount: ${schedule?.amount}`);
  
  if (!schedule?.amount || !isFinite(schedule.amount)) {
    return { monthlyAmount: 0, annualAmount: 0 };
  }

  const monthlyAmount = calculateMonthlyAmountFromFrequency(
    schedule.amount,
    schedule.frequency,
    schedule.months
  );
  
  const annualAmount = monthlyAmount * 12;
  Logger.infoService(`Payment calculation result - monthly: ${monthlyAmount}, annual: ${annualAmount}`);
  
  return { 
    monthlyAmount: isFinite(monthlyAmount) ? monthlyAmount : 0, 
    annualAmount: isFinite(annualAmount) ? annualAmount : 0 
  };
};

export const calculateDividendSchedule = (
  schedule: DividendSchedule,
  quantity: number
): PaymentResult => {
  Logger.infoService(
    `calculateDividendSchedule - frequency: ${schedule?.frequency}, amount: ${schedule?.amount}, quantity: ${quantity}`
  );
  
  if (!schedule?.amount || !isFinite(schedule.amount) || !isFinite(quantity) || schedule.frequency === 'none') {
    return { monthlyAmount: 0, annualAmount: 0 };
  }

  // Convert DividendSchedule to PaymentSchedule
  const paymentSchedule: PaymentSchedule = {
    frequency: schedule.frequency as PaymentFrequency, // Safe because we checked for 'none' above
    amount: schedule.amount * quantity,
    months: schedule.months,
  };

  const baseResult = calculatePaymentSchedule(paymentSchedule);

  Logger.infoService(
    `Dividend calculation result - monthly: ${baseResult.monthlyAmount}, annual: ${baseResult.annualAmount}`
  );
  
  return { 
    monthlyAmount: isFinite(baseResult.monthlyAmount) ? baseResult.monthlyAmount : 0,
    annualAmount: isFinite(baseResult.annualAmount) ? baseResult.annualAmount : 0
  };
};

export const calculateDividendForMonth = (
  schedule: DividendSchedule,
  quantity: number,
  monthNumber: number
): number => {
  if (!schedule?.amount || schedule?.frequency === 'none' || !quantity) {
    return 0;
  }

  return calculateAmountForPaymentMonth(schedule, monthNumber, quantity);
};
