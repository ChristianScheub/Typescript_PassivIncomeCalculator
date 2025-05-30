// Common
export interface BaseEntity {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Asset Types
export type AssetType = 'stock' | 'bond' | 'real_estate' | 'crypto' | 'cash' | 'other';

export type DividendFrequency = 'monthly' | 'quarterly' | 'annually' | 'custom' | 'none';

export interface DividendSchedule {
  frequency: DividendFrequency;
  amount: number;
  months?: number[]; // For custom frequency, array of months (1-12)
  customAmounts?: Record<number, number>; // For custom amounts per month
  
  // For quarterly and annually - specify which months payments occur
  paymentMonths?: number[]; // e.g., [3, 6, 9, 12] for quarterly, [12] for annually
  
  lastIncrease?: {
    date: string;
    previousAmount: number;
    newAmount: number;
  };
}

export interface Asset extends BaseEntity {
  type: AssetType;
  value: number;
  notes?: string;
  country?: string;
  continent?: string;
  sector?: string;
  
  // Stock specific
  ticker?: string;
  quantity?: number;
  purchasePrice?: number;
  currentPrice?: number;
  dividendInfo?: DividendSchedule;
  lastPriceUpdate?: string;
  
  // Bond specific
  interestRate?: number;
  maturityDate?: string;
  nominalValue?: number;
  
  // Real Estate specific
  propertyValue?: number; // Changed from purchasePrice to avoid duplicate
  mortgageBalance?: number;
  estimatedValue?: number;
  rentalIncome?: {
    amount: number;
  };
  
  // Crypto specific
  symbol?: string;
  acquisitionCost?: number;
}

// Payment Types
export type PaymentFrequency = 'monthly' | 'quarterly' | 'annually' | 'custom' | 'none';

export interface PaymentSchedule {
  frequency: PaymentFrequency;
  amount: number;
  months?: number[]; // For custom frequency
  customAmounts?: Record<number, number>; // For custom amounts per month
  
  // For quarterly and annually - specify which months payments occur
  paymentMonths?: number[]; // e.g., [3, 6, 9, 12] for quarterly, [12] for annually
}

// Liability Types
export type LiabilityType = 'mortgage' | 'personal_loan' | 'credit_card' | 'student_loan' | 'auto_loan' | 'other';

export interface Liability extends BaseEntity {
  type: LiabilityType;
  principalAmount: number;
  currentBalance: number;
  interestRate: number;
  paymentSchedule: PaymentSchedule;
  startDate: string;
  endDate?: string;
  notes?: string;
}

// Expense Types
export type ExpenseCategory = 
  | 'housing' 
  | 'transportation' 
  | 'food' 
  | 'utilities' 
  | 'insurance' 
  | 'healthcare' 
  | 'entertainment' 
  | 'personal' 
  | 'debt_payments' 
  | 'education' 
  | 'subscriptions' 
  | 'other';

export interface Expense extends BaseEntity {
  category: ExpenseCategory;
  paymentSchedule: PaymentSchedule;
  amount: number;
  startDate: string;
  endDate?: string;
  notes?: string;
}

// Income Types
export type IncomeType = 'salary' | 'rental' | 'dividend' | 'interest' | 'side_hustle' | 'other';

export interface Income extends BaseEntity {
  type: IncomeType;
  paymentSchedule: PaymentSchedule;
  isPassive: boolean;
  sourceId?: string; // Reference to an asset if the income is from an asset
  startDate: string;
  endDate?: string;
  notes?: string;
}

export interface IncomeFormData {
  name: string;
  type: 'salary' | 'rental' | 'dividend' | 'interest' | 'side_hustle' | 'other';
  paymentFrequency: 'monthly' | 'quarterly' | 'annually' | 'custom';
  amount: number;
  isPassive: boolean;
  customSchedule?: number[];
  startDate: string;
  endDate?: string;
  notes?: string;
}

// Dashboard Types
export interface NetWorthHistory {
  date: string;
  assets: number;
  liabilities: number;
  netWorth: number;
}

export interface MonthlyProjection {
  month: string;
  incomeTotal: number;
  expenseTotal: number;
  netCashFlow: number;
  passiveIncomeCoverage: number;
}

export interface AssetAllocation {
  type: string;
  name: string;
  value: number;
  percentage: number;
}

export interface IncomeAllocation {
  type: IncomeType;
  amount: number;
  percentage: number;
}

export interface ExpenseBreakdown {
  category: ExpenseCategory;
  amount: number;
  percentage: number;
}

export interface IncomeAllocation {
  type: IncomeType;
  amount: number;
  percentage: number;
}