/**
 * Service layer types
 */

// Logger service types
export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LoggerMethods {
  info: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string, error?: Error) => void;
  debug: (message: string) => void;
  infoAPI: (message: string, requestData?: any, responseData?: any) => void;
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

export interface DatabaseOperation<T = any> {
  update: (storeName: DatabaseStoreName, item: T) => Promise<void>;
  delete: (storeName: DatabaseStoreName, id: string) => Promise<void>;
  getAll: (storeName: DatabaseStoreName) => Promise<T[]>;
}

// Import/Export operation types
export interface ImportExportData {
  assets?: any[];
  expenses?: any[];
  income?: any[];
  liabilities?: any[];
  transactions?: any[];
  [key: string]: any[] | undefined;
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
