/**
 * UI Slices Index
 * Export all UI/UX related slices
 */

export { default as snackbarReducer } from './snackbarSlice';
export { default as customAnalyticsReducer } from './customAnalyticsSlice';
export { default as setupWizardReducer } from './setupWizardSlice';

// Re-export all actions and selectors from UI slices
export * from './snackbarSlice';
export * from './customAnalyticsSlice';
export * from './setupWizardSlice';
