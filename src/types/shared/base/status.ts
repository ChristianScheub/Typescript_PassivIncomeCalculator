/**
 * Store state types
 */

export type StoreStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

/**
 * Common operation status types for UI components
 */
export type OperationStatus = 'idle' | 'loading' | 'success' | 'error';
export type ApiKeyStatus = 'idle' | 'saving' | 'success' | 'error';
export type CurrencyType = 'EUR' | 'USD';
export type DeveloperActivationStatus = 'idle' | 'loading' | 'success' | 'error';

// Asset category system fields
export type AssetCategorySystemFields = 'id' | 'createdAt' | 'updatedAt';
