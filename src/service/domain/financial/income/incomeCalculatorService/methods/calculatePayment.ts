import { PaymentSchedule } from '@/types/shared/base/payments';
import { PaymentFrequency } from '@/types/shared/base/enums';
import { PaymentResult } from '@/types/domains/financial/calculations';
import Logger from "@/service/shared/logging/Logger/logger";
import {
  calculateMonthlyAmountFromFrequency,
  calculateAmountForPaymentMonth,
} from './paymentHelpers';



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
  schedule: PaymentSchedule,
  quantity: number
): { monthlyAmount: number; annualAmount: number; monthlyBreakdown: Record<number, number> } => {
  Logger.infoService(
    `calculateDividendSchedule - frequency: ${schedule?.frequency}, amount: ${schedule?.amount}, quantity: ${quantity}`
  );
  
  if (!schedule?.amount || !isFinite(schedule.amount) || !isFinite(quantity) || schedule.frequency === 'none') {
    return { monthlyAmount: 0, annualAmount: 0, monthlyBreakdown: {} };
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
    annualAmount: isFinite(baseResult.annualAmount) ? baseResult.annualAmount : 0,
    monthlyBreakdown: {} // Placeholder for monthly breakdown logic
  };
};

export const calculateDividendForMonth = (
  schedule: PaymentSchedule,
  quantity: number,
  month: number
): number => {
  if (!schedule?.amount || schedule?.frequency === 'none' || !quantity) {
    return 0;
  }

  return calculateAmountForPaymentMonth(schedule, month, quantity);
};
