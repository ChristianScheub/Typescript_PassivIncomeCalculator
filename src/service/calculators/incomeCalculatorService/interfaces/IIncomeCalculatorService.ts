import { Transaction as Asset } from '../../../../types/domains/assets/';
import { 
  Income, 
  PaymentSchedule, 
  DividendSchedule
} from '../../../../types/domains/financial/';
import { 
  IncomeAllocation
} from '../../../../types/domains/portfolio/';

export interface IIncomeCalculatorService {
  // Payment Schedule calculations
  calculatePaymentSchedule: (schedule: PaymentSchedule) => { monthlyAmount: number; annualAmount: number };
  calculateDividendSchedule: (schedule: DividendSchedule, quantity: number) => { monthlyAmount: number; annualAmount: number };
  calculateDividendForMonth: (schedule: DividendSchedule, quantity: number, monthNumber: number) => number;
  
  // Income calculations
  calculateMonthlyIncome: (income: Income) => number;
  calculateTotalMonthlyIncome: (incomes: Income[]) => number;
  calculatePassiveIncome: (incomes: Income[], assets?: Asset[]) => number;
  calculatePassiveIncomeRatio: (monthlyIncome: number, passiveIncome: number) => number;
  calculateAnnualIncome: (monthlyIncome: number) => number;
  
  // Income allocation analysis
  calculateIncomeAllocation: (income: Income[], assets: Asset[]) => IncomeAllocation[];
}
