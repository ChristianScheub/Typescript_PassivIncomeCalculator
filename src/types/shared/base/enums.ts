/**
 * Shared enums and union types used across domains
 */

// Asset-related enums
export type AssetType = 'stock' | 'bond' | 'real_estate' | 'crypto' | 'cash' | 'other';
export type TransactionType = 'buy' | 'sell';
export type RiskLevel = 'low' | 'medium' | 'high';

// Frequency-related enums
export type DividendFrequency = 'monthly' | 'quarterly' | 'annually' | 'custom' | 'none';
export type PaymentFrequency = 'monthly' | 'quarterly' | 'annually' | 'custom' | 'none';

// Financial-related enums
export type LiabilityType = 'mortgage' | 'personal_loan' | 'credit_card' | 'student_loan' | 'auto_loan' | 'other';
export type IncomeType = 'salary' | 'interest' | 'dividend' | 'rental' | 'side_hustle' | 'other';
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

// Data source enums
export type DataSource = 'manual' | 'api' | 'import' | 'calculated';
export type PriceSource = 'manual' | 'api' | 'import';

// Status enums
export type Status = 'active' | 'inactive' | 'pending' | 'archived';
export type ProcessingStatus = 'idle' | 'loading' | 'success' | 'error';

// UI-related enums
export type Theme = 'light' | 'dark' | 'auto';
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type Variant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

// API Provider enums
export enum StockAPIProvider {
  FINNHUB = 'finnhub',
  YAHOO = 'yahoo',
  ALPHA_VANTAGE = 'alpha_vantage'
}

export type DividendApiProvider = 'yahoo' | 'finnhub';
