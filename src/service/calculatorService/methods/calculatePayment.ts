import { DividendSchedule, PaymentSchedule } from '../../../types';
import Logger from '../../Logger/logger';

export interface PaymentResult {
  monthlyAmount: number;
  annualAmount: number;
}

export const calculatePaymentSchedule = (schedule: PaymentSchedule): PaymentResult => {
  Logger.info(`calculatePaymentSchedule - frequency: ${schedule.frequency}, amount: ${schedule.amount}`);
  
  if (!schedule || !schedule.amount || schedule.frequency === 'none') {
    return { monthlyAmount: 0, annualAmount: 0 };
  }

  let monthlyAmount = 0;
  
  switch (schedule.frequency) {
    case 'monthly':
      monthlyAmount = schedule.amount;
      break;
    case 'quarterly':
      monthlyAmount = schedule.amount / 3;
      break;
    case 'annually':
      monthlyAmount = schedule.amount / 12;
      break;
    case 'custom':
      if (schedule.months) {
        const monthCount = schedule.months.length;
        monthlyAmount = (schedule.amount * monthCount) / 12;
      }
      break;
    default:
      monthlyAmount = 0;
  }

  const annualAmount = monthlyAmount * 12;
  Logger.info(`Payment calculation result - monthly: ${monthlyAmount}, annual: ${annualAmount}`);
  
  return { monthlyAmount, annualAmount };
};

export const calculateDividendSchedule = (schedule: DividendSchedule, quantity: number): PaymentResult => {
  Logger.info(`calculateDividendSchedule - amount: ${schedule?.amount}, frequency: ${schedule?.frequency}, quantity: ${quantity}`);
  
  if (!schedule || !schedule.amount || schedule.frequency === 'none') {
    return { monthlyAmount: 0, annualAmount: 0 };
  }

  const totalAmount = schedule.amount * quantity;
  let monthlyAmount = 0;

  switch (schedule.frequency) {
    case 'monthly':
      monthlyAmount = totalAmount;
      break;
    case 'quarterly':
      monthlyAmount = totalAmount / 3;
      break;
    case 'annually':
      monthlyAmount = totalAmount / 12;
      break;
    case 'custom':
      if (schedule.months) {
        const monthCount = schedule.months.length;
        monthlyAmount = (totalAmount * monthCount) / 12;
      }
      break;
    default:
      monthlyAmount = 0;
  }

  const annualAmount = monthlyAmount * 12;
  Logger.info(`Dividend calculation result - monthly: ${monthlyAmount}, annual: ${annualAmount}`);

  return { monthlyAmount, annualAmount };
};
