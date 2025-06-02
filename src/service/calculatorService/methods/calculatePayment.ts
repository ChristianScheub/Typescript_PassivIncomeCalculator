import { DividendSchedule, PaymentSchedule } from '../../../types';
import Logger from '../../Logger/logger';
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
  
  if (!schedule?.amount || schedule?.frequency === 'none') {
    return { monthlyAmount: 0, annualAmount: 0 };
  }

  const monthlyAmount = calculateMonthlyAmountFromFrequency(
    schedule.amount,
    schedule.frequency,
    schedule.months
  );
  
  const annualAmount = monthlyAmount * 12;
  Logger.infoService(`Payment calculation result - monthly: ${monthlyAmount}, annual: ${annualAmount}`);
  
  return { monthlyAmount, annualAmount };
};

export const calculateDividendSchedule = (
  schedule: DividendSchedule,
  quantity: number
): PaymentResult => {
  Logger.infoService(
    `calculateDividendSchedule - amount: ${schedule?.amount}, frequency: ${schedule?.frequency}, quantity: ${quantity}`
  );

  if (!schedule?.amount || schedule?.frequency === 'none' || !quantity) {
    return { monthlyAmount: 0, annualAmount: 0 };
  }

  const monthlyAmount = calculateMonthlyAmountFromFrequency(
    schedule.amount * quantity,
    schedule.frequency,
    schedule.months
  );

  const annualAmount = monthlyAmount * 12;
  Logger.infoService(`Dividend calculation result - monthly: ${monthlyAmount}, annual: ${annualAmount}`);

  return { monthlyAmount, annualAmount };
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
