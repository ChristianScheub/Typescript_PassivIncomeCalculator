import { DividendSchedule, PaymentSchedule } from '../../../types';
import Logger from '../../Logger/logger';

export interface PaymentResult {
  monthlyAmount: number;
  annualAmount: number;
}

export const calculatePaymentSchedule = (schedule: PaymentSchedule): PaymentResult => {
  Logger.infoService(`calculatePaymentSchedule - frequency: ${schedule.frequency}, amount: ${schedule.amount}`);
  
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
  Logger.infoService(`Payment calculation result - monthly: ${monthlyAmount}, annual: ${annualAmount}`);
  
  return { monthlyAmount, annualAmount };
};

export const calculateDividendSchedule = (schedule: DividendSchedule, quantity: number): PaymentResult => {
  Logger.infoService(`calculateDividendSchedule - amount: ${schedule?.amount}, frequency: ${schedule?.frequency}, quantity: ${quantity}`);
  
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

  const annualAmount = monthlyAmount * 12;  Logger.infoService(`Dividend calculation result - monthly: ${monthlyAmount}, annual: ${annualAmount}`);
  
  return { monthlyAmount, annualAmount };
};

// Neue Funktion: Berechnet die Dividende für einen spezifischen Monat
export const calculateDividendForMonth = (schedule: DividendSchedule, quantity: number, monthNumber: number): number => {
  if (!schedule || !schedule.amount || schedule.frequency === 'none' || !quantity) {
    return 0;
  }

  const totalDividendPerPayment = schedule.amount * quantity;

  switch (schedule.frequency) {
    case 'monthly':
      return totalDividendPerPayment;
      
    case 'quarterly':
      // Prüfe ob dieser Monat ein Zahlungsmonat ist
      if (schedule.paymentMonths && schedule.paymentMonths.includes(monthNumber)) {
        return totalDividendPerPayment;
      }
      // Standard quartalsweise: März, Juni, September, Dezember
      const defaultQuarterlyMonths = [3, 6, 9, 12];
      return defaultQuarterlyMonths.includes(monthNumber) ? totalDividendPerPayment : 0;
      
    case 'annually':
      // Prüfe ob dieser Monat der Zahlungsmonat ist
      if (schedule.paymentMonths && schedule.paymentMonths.includes(monthNumber)) {
        return totalDividendPerPayment;
      }
      // Standard jährlich: Dezember
      return monthNumber === 12 ? totalDividendPerPayment : 0;
      
    case 'custom':
      if (schedule.months && schedule.months.includes(monthNumber)) {
        // Bei custom können unterschiedliche Beträge pro Monat definiert sein
        if (schedule.customAmounts && schedule.customAmounts[monthNumber]) {
          return schedule.customAmounts[monthNumber] * quantity;
        }
        return totalDividendPerPayment;
      }
      return 0;
      
    default:
      return 0;
  }
};
