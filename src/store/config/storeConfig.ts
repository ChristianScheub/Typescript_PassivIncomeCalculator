import { configureStore, combineReducers } from '@reduxjs/toolkit';
import type { AnyAction, ThunkAction } from '@reduxjs/toolkit';

// Import organized reducers
import {
  transactionsReducer,
  assetDefinitionsReducer,
  assetCategoriesReducer,
  liabilitiesReducer,
  expensesReducer,
  incomeReducer,
} from '../slices/domain';

import {
  forecastReducer,
  // calculatedDataReducer, // REMOVED - consolidated into transactionsSlice
  // portfolioIntradayReducer, // REMOVED - consolidated into transactionsSlice
} from '../slices/cache';

import {
  customAnalyticsReducer,
  snackbarReducer,
  setupWizardReducer,
} from '../slices/ui';

// Unified config slice
import configReducer from '../slices/configSlice';
import { middlewareConfig } from './middlewareConfig';

// Define the consolidated root reducer map
const rootReducer = combineReducers({
  // Domain slices - core entities
  transactions: transactionsReducer, // NOW INCLUDES: portfolio cache, history, asset focus, financial summary, intraday data
  assetDefinitions: assetDefinitionsReducer,
  assetCategories: assetCategoriesReducer,
  liabilities: liabilitiesReducer,
  expenses: expensesReducer,
  income: incomeReducer,
  
  // Cache slices - simplified
  forecast: forecastReducer, // Still separate, but will use consolidated portfolio cache
  
  // Config slice - unified
  config: configReducer, // Unified configuration slice
  
  // UI slices
  customAnalytics: customAnalyticsReducer,
  snackbar: snackbarReducer,
  setupWizard: setupWizardReducer,
  
  // REMOVED REDUNDANT SLICES:
  // calculatedData: calculatedDataReducer, // Moved to transactions.cache.history/.assetFocusData/.financialSummary
  // portfolioIntraday: portfolioIntradayReducer, // Moved to transactions.cache.intradayData
});

// First, define the root state type
export type RootState = ReturnType<typeof rootReducer>;

/**
 * Centralized store configuration
 * Separated from store creation for better maintainability
 * Includes performance optimizations and enhanced error handling
 */
export const createStoreConfig = (preloadedState?: Partial<RootState>) => {
  const store = configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['register', 'rehydrate'],
      },
      immutableCheck: {
        warnAfter: 128,
      },
    }).concat(...middlewareConfig()),
    devTools: process.env.NODE_ENV === 'development' ? {
      // Enhanced DevTools configuration
      maxAge: 100, // Limit action history
      trace: false, // Disable stack traces for performance
      serialize: {
        options: {
          undefined: true,
          function: true,
          symbol: true,
        },
      },
    } : false,
  });

  // Add global error handler for store
  if (process.env.NODE_ENV === 'development') {
    store.subscribe(() => {
      const state = store.getState() as RootState;
      // Check for common state issues in development
      if (state.transactions.error) {
        console.warn('Store Error - Transactions (Consolidated Cache):', state.transactions.error);
      }
      if (state.config.error) {
        console.warn('Store Error - Config:', state.config.error);
      }
      if (state.assetDefinitions.error) {
        console.warn('Store Error - Asset Definitions:', state.assetDefinitions.error);
      }
    });
  }

  return store;
};

// Export derived types after function definition
export type AppStore = ReturnType<typeof createStoreConfig>;
export type AppDispatch = AppStore['dispatch'];
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  AnyAction
>;
