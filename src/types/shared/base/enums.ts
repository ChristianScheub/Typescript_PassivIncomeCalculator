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

// UI-related enums
export type Theme = 'light' | 'dark' | 'auto';

// API Provider enums
export enum StockAPIProvider {
  FINNHUB = 'finnhub',
  YAHOO = 'yahoo',
  ALPHA_VANTAGE = 'alpha_vantage',
  IEX_CLOUD = 'iex_cloud',
  TWELVE_DATA = 'twelve_data',
  QUANDL = 'quandl',
  EOD_HISTORICAL_DATA = 'eod_historical_data',
  POLYGON_IO = 'polygon_io'
}

export type DividendApiProvider = 'yahoo' | 'finnhub';

// Setup Wizard related enums
export enum WizardStep {
  WELCOME = 'welcome',
  ASSET_DEFINITIONS = 'asset_definitions',
  TRANSACTIONS = 'transactions',
  LIABILITIES = 'liabilities',
  INCOME = 'income',
  COMPLETION = 'completion'
}
