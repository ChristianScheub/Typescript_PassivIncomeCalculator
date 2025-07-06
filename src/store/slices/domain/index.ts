/**
 * Domain Slices Index
 * Export all domain-related slices (CRUD entities)
 */

export { default as transactionsReducer } from './transactionsSlice';
export { default as incomeReducer } from './incomeSlice';
export { default as expensesReducer } from './expensesSlice';
export { default as liabilitiesReducer } from './liabilitiesSlice';
export { default as assetDefinitionsReducer } from './assetDefinitionsSlice';
export { default as assetCategoriesReducer } from './assetCategoriesSlice';

// Re-export all actions and selectors from domain slices
export * from './transactionsSlice';
export * from './incomeSlice';
export * from './expensesSlice';
export * from './liabilitiesSlice';
export * from './assetDefinitionsSlice';
export * from './assetCategoriesSlice';
