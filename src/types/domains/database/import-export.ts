/**
 * Types for database import/export operations
 */

// Base export data structure - flexible to handle both structured and unstructured data
export interface ExportData {
  version?: string;
  timestamp?: string;
  transactions: unknown[];
  assets?: unknown[]; // Legacy support
  liabilities: unknown[];
  expenses: unknown[];
  income: unknown[];
  assetDefinitions?: unknown[];
  assetCategories?: unknown[];
  assetCategoryOptions?: unknown[];
  assetCategoryAssignments?: unknown[];
  exchangeRates?: unknown[];
  [key: string]: unknown;
}

// Import data validation flags
export interface ImportDataFlags {
  isV2Format: boolean;
  hasAssetDefinitions: boolean;
  hasAssetCategories: boolean;
  hasAssetCategoryOptions: boolean;
  hasAssetCategoryAssignments: boolean;
  hasExchangeRates: boolean;
}

// Import validation result
export interface ImportValidationResult {
  isValid: boolean;
  flags: ImportDataFlags;
  message: string;
  errors?: string[];
}

// Database clear options
export interface ClearDatabaseOptions {
  preserveSettings?: boolean;
  clearCache?: boolean;
}
