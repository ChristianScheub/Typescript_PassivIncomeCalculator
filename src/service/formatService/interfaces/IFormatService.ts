export interface IFormatService {
  formatCurrency: (amount: number) => string;
  formatPercentage: (value: number, options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }) => string;
  formatNumber: (value: number, options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }) => string;
  formatDate: (date: string | Date) => string;
  formatMonth: (monthNumber: number, format?: 'short' | 'long') => string;
}
