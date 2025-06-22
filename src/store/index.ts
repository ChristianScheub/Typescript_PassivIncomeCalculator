import { configureStore } from '@reduxjs/toolkit';
import type { AnyAction, ThunkAction } from '@reduxjs/toolkit';
import transactionsReducer from './slices/transactionsSlice';
import assetDefinitionsReducer from './slices/assetDefinitionsSlice';
import assetCategoriesReducer from './slices/assetCategoriesSlice';
import liabilitiesReducer from './slices/liabilitiesSlice';
import expensesReducer from './slices/expensesSlice';
import incomeReducer from './slices/incomeSlice';
import dashboardReducer from './slices/dashboardSlice';
import forecastReducer from './slices/forecastSlice';
import apiConfigReducer, { StockAPIProvider } from './slices/apiConfigSlice';
import customAnalyticsReducer from './slices/customAnalyticsSlice';
import portfolioHistoryReducer from './slices/portfolioHistorySlice';
import snackbarReducer from './slices/snackbarSlice';
import dashboardSettingsReducer from './slices/dashboardSettingsSlice';
import calculatedDataReducer, { markStoreHydrated, validateCacheOnStartup } from './slices/calculatedDataSlice';
import intradayDataReducer from './slices/intradayDataSlice';
import dataChangeMiddleware from './middleware/dataChangeMiddleware';
import portfolioCacheMiddleware from './middleware/portfolioCacheMiddleware';
import calculatedDataCacheMiddleware from './middleware/calculatedDataCacheMiddleware';
import assetCalculationCacheMiddleware from './middleware/assetCalculationCacheMiddleware';
import Logger from '@service/shared/logging/Logger/logger';
import { validatePortfolioCache } from '../utils/portfolioCacheUtils';

// Define types for our application state
type Status = 'idle' | 'loading' | 'succeeded' | 'failed';

// Versuche den gespeicherten State zu laden
const loadState = () => {
  try {
    Logger.infoRedux('Loading state from localStorage');
    const serializedState = localStorage.getItem('passiveIncomeCalculator');
    if (serializedState === null) {
      return undefined;
    }
    const state = JSON.parse(serializedState);
    
    // Validate portfolio cache from localStorage
    // Use the transactions data
    const transactionsData = state.transactions;
    const cacheValid = validatePortfolioCache(
      transactionsData?.portfolioCache, 
      transactionsData?.portfolioCacheValid
    );
    
    Logger.cache(`Loading state from localStorage - portfolio cache ${cacheValid ? 'valid' : 'invalid/missing'}`);
    
    return {
      transactions: { 
        items: transactionsData?.items || [],
        status: 'idle' as Status,
        error: null,
        // Restore portfolio cache from localStorage if valid
        portfolioCache: cacheValid ? transactionsData?.portfolioCache : undefined,
        portfolioCacheValid: cacheValid,
        lastPortfolioCalculation: cacheValid ? transactionsData?.lastPortfolioCalculation : undefined,
        calculationMetadata: {
          lastCalculated: '',
          totalValue: 0,
          totalInvestment: 0,
          totalReturn: 0,
          totalReturnPercentage: 0,
          assetDefinitions: [],
          categories: [],
          categoryOptions: [],
          categoryAssignments: []
        }
      },
      assetDefinitions: {
        items: state.assetDefinitions?.items || [],
        status: 'idle' as Status,
        error: null
      },
      assetCategories: {
        categories: state.assetCategories?.categories || [],
        categoryOptions: state.assetCategories?.categoryOptions || [],
        categoryAssignments: state.assetCategories?.categoryAssignments || [],
        status: 'idle' as Status,
        error: null
      },
      liabilities: {
        items: state.liabilities?.items || [],
        status: 'idle' as Status,
        error: null
      },
      expenses: {
        items: state.expenses?.items || [],
        status: 'idle' as Status,
        error: null
      },
      income: {
        items: state.income?.items || [],
        status: 'idle' as Status,
        error: null
      },
      customAnalytics: {
        charts: state.customAnalytics?.charts || [],
        isConfigPanelOpen: false,
        editingChartId: null
      },
      dashboard: state.dashboard || {},
      forecast: state.forecast || {},
      apiConfig: {
        isEnabled: state.apiConfig?.isEnabled ?? (localStorage.getItem('stock_api_enabled') === 'true'),
        selectedProvider: state.apiConfig?.selectedProvider ?? ((localStorage.getItem('selected_stock_api_provider') as StockAPIProvider) || 'finnhub'),
        apiKeys: state.apiConfig?.apiKeys || {
          finnhub: localStorage.getItem('finnhub_api_key') || undefined,
          yahoo: localStorage.getItem('yahoo_api_key') || undefined,
          alpha_vantage: localStorage.getItem('alpha_vantage_api_key') || undefined,
        }
      },
      dashboardSettings: {
        mode: (localStorage.getItem('dashboard_mode') as any) || 'smartSummary',
        assetFocus: {
          timeRange: (localStorage.getItem('asset_focus_time_range') as any) || '1W'
        }
      },
      calculatedData: {
        portfolioHistory: state.calculatedData?.portfolioHistory || {},
        assetFocusData: state.calculatedData?.assetFocusData || null,
        financialSummary: state.calculatedData?.financialSummary || null,
        status: 'idle',
        error: null,
        cacheValidityDuration: state.calculatedData?.cacheValidityDuration || 5 * 60 * 1000,
        enableConditionalLogging: state.calculatedData?.enableConditionalLogging ?? true,
        isHydrated: false // Will be set to true after store creation
      },
      intradayData: {
        intradayEntries: state.intradayData?.intradayEntries || [],
        intradayEntriesStatus: 'idle',
        intradayEntriesError: null,
        intradayEntriesCacheKey: state.intradayData?.intradayEntriesCacheKey || null,
        intradayEntriesLastUpdated: state.intradayData?.intradayEntriesLastUpdated || null,
        
        portfolioIntradayData: state.intradayData?.portfolioIntradayData || [],
        portfolioIntradayStatus: 'idle',
        portfolioIntradayError: null,
        portfolioIntradayCacheKey: state.intradayData?.portfolioIntradayCacheKey || null,
        portfolioIntradayLastUpdated: state.intradayData?.portfolioIntradayLastUpdated || null,
        
        assetDataMap: state.intradayData?.assetDataMap || {},
        assetDataMapCacheKey: state.intradayData?.assetDataMapCacheKey || null,
      }
    };
  } catch (err) {
    Logger.error('Error loading state from localStorage:'+ JSON.stringify(err));
    return undefined;
  }
};

const persistedState = loadState();

// Create the store
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const store = configureStore({
  reducer: {
    transactions: transactionsReducer,
    assetDefinitions: assetDefinitionsReducer,
    assetCategories: assetCategoriesReducer,
    liabilities: liabilitiesReducer,
    expenses: expensesReducer,
    income: incomeReducer,
    dashboard: dashboardReducer,
    forecast: forecastReducer,
    apiConfig: apiConfigReducer,
    customAnalytics: customAnalyticsReducer,
    portfolioHistory: portfolioHistoryReducer,
    snackbar: snackbarReducer,
    dashboardSettings: dashboardSettingsReducer,
    calculatedData: calculatedDataReducer,
    intradayData: intradayDataReducer,
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  preloadedState: persistedState as any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  middleware: (getDefaultMiddleware: any) => 
    getDefaultMiddleware({
      serializableCheck: false, // For storing Date objects in state
    }).concat(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      dataChangeMiddleware as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      portfolioCacheMiddleware as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      calculatedDataCacheMiddleware as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      assetCalculationCacheMiddleware as any
    ),
} as any);

// Mark store as hydrated and validate cache if we loaded persisted state
if (persistedState) {
  Logger.cache('Store created with persisted state, marking as hydrated');
  
  // Mark hydrated first
  store.dispatch(markStoreHydrated());
  
  // Then validate cache startup after a tick to ensure store is fully initialized
  setTimeout(() => {
    store.dispatch(validateCacheOnStartup());
  }, 0);
} else {
  // If no persisted state, still mark as hydrated (empty state is also hydrated)
  Logger.infoRedux('Store created without persisted state, marking as hydrated');
  store.dispatch(markStoreHydrated());
}

// Subscribe to store changes and save to localStorage
let isClearing = false;

store.subscribe(() => {
  // Don't save to localStorage during clearing operations
  if (isClearing) return;
  
  const state = store.getState();
  try {
    const stateToSave = {
      transactions: { 
        items: state.transactions.items,
        // Save portfolio cache to localStorage
        portfolioCache: state.transactions.portfolioCache,
        portfolioCacheValid: state.transactions.portfolioCacheValid,
        lastPortfolioCalculation: state.transactions.lastPortfolioCalculation
      },
      assetDefinitions: {
        items: state.assetDefinitions.items
      },
      assetCategories: {
        categories: state.assetCategories.categories,
        categoryOptions: state.assetCategories.categoryOptions,
        categoryAssignments: state.assetCategories.categoryAssignments
      },
      liabilities: {
        items: state.liabilities.items
      },
      expenses: {
        items: state.expenses.items
      },
      income: {
        items: state.income.items
      },
      customAnalytics: {
        charts: state.customAnalytics.charts
      },
      dashboard: state.dashboard,
      forecast: state.forecast,
      apiConfig: state.apiConfig,
      calculatedData: {
        portfolioHistory: state.calculatedData.portfolioHistory,
        assetFocusData: state.calculatedData.assetFocusData,
        financialSummary: state.calculatedData.financialSummary,
        // Don't persist status, error, or settings
        status: 'idle',
        error: null,
        cacheValidityDuration: state.calculatedData.cacheValidityDuration,
        enableConditionalLogging: state.calculatedData.enableConditionalLogging
      }
    };
    
    // Check if we're clearing data (all arrays are empty)
    const isEmpty = state.transactions.items.length === 0 && 
                   state.assetDefinitions.items.length === 0 &&
                   state.assetCategories.categories.length === 0 &&
                   state.assetCategories.categoryOptions.length === 0 &&
                   state.assetCategories.categoryAssignments.length === 0 &&
                   state.liabilities.items.length === 0 && 
                   state.expenses.items.length === 0 && 
                   state.income.items.length === 0 &&
                   state.customAnalytics.charts.length === 0;
    
    if (isEmpty) {
      isClearing = true;
      // Clear localStorage when all data is empty
      localStorage.removeItem('passiveIncomeCalculator');
      setTimeout(() => { isClearing = false; }, 100);
    } else {
      localStorage.setItem('passiveIncomeCalculator', JSON.stringify(stateToSave));
    }
  } catch (err) {
    console.error('Error saving state:', err);
  }
});

// Export types derived from the store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export StoreState as an alias for RootState for compatibility
export type StoreState = RootState;

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  AnyAction
>;