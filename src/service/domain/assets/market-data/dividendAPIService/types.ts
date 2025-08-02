export interface DividendData {
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'annually';
  paymentMonths?: number[];
  lastDividendDate?: string;
}