import { 
  Liability
} from '@/types/domains/financial/';

export interface ILiabilityCalculatorService {
  // Liability calculations
  calculateTotalDebt: (liabilities: Liability[]) => number;
  calculateTotalMonthlyLiabilityPayments: (liabilities: Liability[]) => number;
  calculateLiabilityMonthlyPayment: (liability: Liability) => number;
}
