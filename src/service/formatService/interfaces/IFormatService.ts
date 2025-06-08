export interface IFormatService {
  formatCurrency: (amount: number) => string;
  formatPercentage: (value: number, options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }) => string;
}
