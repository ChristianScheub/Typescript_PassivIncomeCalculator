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
  calculatedDataReducer,
  portfolioIntradayReducer,
} from '../slices/cache';

import {
  customAnalyticsReducer,
  snackbarReducer,
} from '../slices/ui';

// Unified config slice
import configReducer from '../slices/configSlice';
import { middlewareConfig } from './middlewareConfig';

// Define the root reducer map
const rootReducer = combineReducers({
  transactions: transactionsReducer,
  assetDefinitions: assetDefinitionsReducer,
  assetCategories: assetCategoriesReducer,
  liabilities: liabilitiesReducer,
  expenses: expensesReducer,
  income: incomeReducer,
  forecast: forecastReducer,
  config: configReducer, // Unified configuration slice
  customAnalytics: customAnalyticsReducer,
  snackbar: snackbarReducer,
  calculatedData: calculatedDataReducer,
  portfolioIntraday: portfolioIntradayReducer,
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
    middleware: middlewareConfig,
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
      const state = store.getState();
      // Check for common state issues in development
      if (state.transactions.error) {
        console.warn('Store Error - Transactions:', state.transactions.error);
      }
      if (state.calculatedData.error) {
        console.warn('Store Error - CalculatedData:', state.calculatedData.error);
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
