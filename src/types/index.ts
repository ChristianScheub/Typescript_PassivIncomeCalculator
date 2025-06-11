// Common
export interface BaseEntity {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Milestone Types
export interface DebtEntry {
  name: string;
  type: LiabilityType;
  initialAmount: number;
  currentAmount: number;
  progress: number;
}

export interface DebtWithCoverage {
  name: string;
  type: string;
  monthlyPayment: number;
  coverage: number;
}

// Asset Types
export type AssetType = 'stock' | 'bond' | 'real_estate' | 'crypto' | 'cash' | 'other';
export type TransactionType = 'buy' | 'sell';

export type DividendFrequency = 'monthly' | 'quarterly' | 'annually' | 'custom' | 'none';
export type PaymentFrequency = 'monthly' | 'quarterly' | 'annually' | 'custom';

export interface PaymentSchedule {
  frequency: PaymentFrequency;
  amount: number;
  months?: number[];
  customAmounts?: Record<number, number>;
}

export interface DividendSchedule {
  frequency: DividendFrequency;
  amount: number;
  months?: number[];
  paymentMonths?: number[];
  customAmounts?: Record<number, number>;
}

export interface CachedDividends {
  monthlyAmount: number;
  annualAmount: number;
  monthlyBreakdown: Record<number, number>;
  lastCalculated: string;
  calculationHash: string;
}

// Historical price data interface
export interface PriceHistoryEntry {
  date: string;
  price: number;
  source?: string; // 'manual' | 'api' | 'import'
}

// Asset Definition Types (Stammdaten)
export interface AssetDefinition extends BaseEntity {
  ticker?: string;
  fullName: string;
  type: AssetType;
  country?: string;
  continent?: string;
  sector?: string;
  currency?: string;
  exchange?: string;
  isin?: string;
  wkn?: string;
  
  // Current market data
  currentPrice?: number;
  lastPriceUpdate?: string;
  autoUpdatePrice?: boolean; // Whether to auto-update price via API (only for stocks)
  
  // Historical price data
  priceHistory?: PriceHistoryEntry[];
  
  // Dividend/Income Information
  dividendInfo?: {
    frequency: DividendFrequency;
    amount: number;
    currency?: string;
    months?: number[];
    paymentMonths?: number[];
    customAmounts?: Record<number, number>;
    lastDividendDate?: string;
    nextDividendDate?: string;
    dividendGrowthRate?: number; // Jährliche Steigerung in %
  };
  
  // Real Estate specific
  rentalInfo?: {
    baseRent: number;
    currency?: string;
    rentGrowthRate?: number; // Jährliche Mietsteigerung in %
    frequency: PaymentFrequency;
    months?: number[];
    customAmounts?: Record<number, number>;
  };
  
  // Bond specific
  bondInfo?: {
    interestRate: number;
    maturityDate?: string;
    nominalValue?: number;
    currency?: string;
  };
  
  // Additional metadata
  description?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  isActive?: boolean;
}

// Transaction Type für Asset-Transaktionen
export interface Transaction extends BaseEntity {
  type: AssetType;
  value: number;
  
  // Reference to Asset Definition
  assetDefinitionId?: string;
  assetDefinition?: AssetDefinition; // Populated reference
  
  // Transaction type (buy/sell)
  transactionType: TransactionType;
  
  // Transaction specific data
  purchaseDate: string;
  purchasePrice: number;
  purchaseQuantity?: number;
  transactionCosts?: number;
  
  // Sale-specific fields (only for sell transactions)
  saleDate?: string;
  salePrice?: number;
  saleQuantity?: number;
  
  // Calculated fields (derived values - not stored)
  // currentQuantity = purchaseQuantity (can change due to splits, etc.)
  // currentValue = assetDefinition.currentPrice * currentQuantity
  totalReturn?: number;
  totalReturnPercentage?: number;
  
  notes?: string;
  cachedDividends?: CachedDividends;
}

// Alias für Rückwärtskompatibilität während der Migration
export type Asset = Transaction;

// Asset Category Types
export interface AssetCategory extends BaseEntity {
  name: string;
  description?: string;
  isActive: boolean;
  sortOrder?: number;
}

export interface AssetCategoryOption extends BaseEntity {
  categoryId: string;
  name: string;
  isActive: boolean;
  sortOrder?: number;
}

export interface AssetCategoryAssignment extends BaseEntity {
  assetDefinitionId: string;
  categoryId: string;
  categoryOptionId: string;
}

// Enhanced AssetDefinition with categories
export interface EnhancedAssetDefinition extends AssetDefinition {
  categoryAssignments?: AssetCategoryAssignment[];
}

// Liability Types
export type LiabilityType = 'mortgage' | 'personal_loan' | 'credit_card' | 'student_loan' | 'auto_loan' | 'other';

export interface Liability extends BaseEntity {
  type: LiabilityType;
  initialBalance: number;
  currentBalance: number;
  interestRate?: number;
  paymentSchedule?: PaymentSchedule;
  startDate?: string;
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
export type IncomeType = 'salary' | 'interest' | 'dividend' | 'rental' | 'side_hustle' | 'other';

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
  type: 'salary' | 'interest' | 'side_hustle' | 'other';
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
  // Detaillierte Aufschlüsselung für Charts
  activeIncome: number;
  passiveIncome: number;
  assetIncome: number;
  liabilityPayments: number;
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