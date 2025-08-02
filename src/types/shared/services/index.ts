/**
 * Service layer types
 */


export interface LoggerMethods {
  info: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string, error?: Error) => void;
  debug: (message: string) => void;
  infoAPI: (message: string, requestData?: unknown, responseData?: unknown) => void;
}

// Stock API service types
export interface StockSearchResult {
  symbol: string;
  name: string;
  exchange?: string;
  currency?: string;
}

export interface StockPriceData {
  symbol: string;
  price: number;
  currency?: string;
  timestamp: string;
}

// Yahoo API specific types
export interface YahooSearchItem {
  symbol: string;
  name: string;
  exch?: string;
  type?: string;
  exchDisp?: string;
  typeDisp?: string;
}

export interface YahooAPIResponse {
  quotes: YahooSearchItem[];
}

// Database operation types
export type DatabaseStoreName = 'transactions' | 'expenses' | 'income' | 'liabilities' | 'assets';

export interface DatabaseOperation<T = unknown> {
  update: (storeName: DatabaseStoreName, item: T) => Promise<void>;
  delete: (storeName: DatabaseStoreName, id: string) => Promise<void>;
  getAll: (storeName: DatabaseStoreName) => Promise<T[]>;
}

// Import/Export operation types
export interface ImportExportData {
  assets?: unknown[];
  expenses?: unknown[];
  income?: unknown[];
  liabilities?: unknown[];
  transactions?: unknown[];
  [key: string]: unknown[] | undefined;
}

// Calculator service types  
export interface DividendInfo {
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'annually';
  nextPaymentDate?: string;
}

export interface DividendScheduleResult {
  totalAnnualDividend: number;
  monthlySchedule: Array<{
    month: number;
    amount: number;
  }>;
}

// Portfolio calculation types
export interface ProjectedIncomeCalculation {
  assetName: string;
  projectedAnnualIncome: number;
  monthlySchedule: DividendScheduleResult['monthlySchedule'];
}
