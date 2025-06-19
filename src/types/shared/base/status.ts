/**
 * Store state types
 */

export type StoreStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

// Re-export specific status types
export type AssetCategoriesStatus = StoreStatus;
export type AssetCategorySystemFields = 'id' | 'createdAt' | 'updatedAt';
