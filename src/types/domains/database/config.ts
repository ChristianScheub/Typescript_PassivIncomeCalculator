/**
 * Database and Infrastructure types
 */

export type StoreNames = 'transactions' | 'assetDefinitions' | 'assetCategories' | 'assetCategoryOptions' | 'assetCategoryAssignments' | 'liabilities' | 'expenses' | 'income' | 'exchangeRates';

export interface DatabaseConfig {
  version: number;
  name: string;
  stores: StoreNames[];
}

export interface DatabaseMigration {
  version: number;
  up: () => Promise<void>;
  down?: () => Promise<void>;
}

/**
 * Database Schema Interface - moved from infrastructure layer
 */
export interface FinanceDBSchema {
  transactions: {
    key: string;
    value: unknown; // Will be Asset
    indexes: { 'by-type': string };
  };
  assetDefinitions: {
    key: string;
    value: unknown; // Will be AssetDefinition
    indexes: { 'by-type': string };
  };
  assetCategories: {
    key: string;
    value: unknown; // Will be AssetCategory
    indexes: { 'by-name': string };
  };
  assetCategoryOptions: {
    key: string;
    value: unknown; // Will be AssetCategoryOption
    indexes: { 'by-category': string, 'by-name': string };
  };
  assetCategoryAssignments: {
    key: string;
    value: unknown; // Will be AssetCategoryAssignment
    indexes: { 'by-asset': string, 'by-category': string };
  };
  liabilities: {
    key: string;
    value: unknown; // Will be Liability
  };
  expenses: {
    key: string;
    value: unknown; // Will be Expense
    indexes: { 'by-category': string };
  };
  income: {
    key: string;
    value: unknown; // Will be Income
  };
  exchangeRates: {
    key: string;
    value: unknown; // Will be ExchangeRate
    indexes: { 'by-date': string };
  };
}
