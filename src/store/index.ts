import { configureStore, UnknownAction } from '@reduxjs/toolkit';
import type { Middleware, ThunkAction } from '@reduxjs/toolkit';
import assetsReducer from './slices/assetsSlice';
import assetDefinitionsReducer from './slices/assetDefinitionsSlice';
import assetCategoriesReducer from './slices/assetCategoriesSlice';
import liabilitiesReducer from './slices/liabilitiesSlice';
import expensesReducer from './slices/expensesSlice';
import incomeReducer from './slices/incomeSlice';
import dashboardReducer from './slices/dashboardSlice';
import forecastReducer from './slices/forecastSlice';
import apiConfigReducer from './slices/apiConfigSlice';
import customAnalyticsReducer from './slices/customAnalyticsSlice';
import portfolioHistoryReducer from './slices/portfolioHistorySlice';
import dataChangeMiddleware from './middleware/dataChangeMiddleware';
import portfolioCacheMiddleware from './middleware/portfolioCacheMiddleware';
import Logger from '../service/Logger/logger';
import { validatePortfolioCache } from '../utils/portfolioCacheUtils';

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
    const cacheValid = validatePortfolioCache(
      state.assets?.portfolioCache, 
      state.assets?.portfolioCacheValid
    );
    
    Logger.infoRedux(`Loading state from localStorage - portfolio cache ${cacheValid ? 'valid' : 'invalid/missing'}`);
    
    return {
      assets: { 
        items: state.assets?.items || [],
        status: 'idle' as Status,
        error: null,
        // Restore portfolio cache from localStorage if valid
        portfolioCache: cacheValid ? state.assets?.portfolioCache : undefined,
        portfolioCacheValid: cacheValid,
        lastPortfolioCalculation: cacheValid ? state.assets?.lastPortfolioCalculation : undefined
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
      }
    };
  } catch (err) {
    Logger.error('Error loading state from localStorage:'+ JSON.stringify(err));
    return undefined;
  }
};

const persistedState = loadState();

// Define root reducer type
const rootReducer = {
  assets: assetsReducer,
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
};

export const store = configureStore({
  reducer: rootReducer,
  preloadedState: persistedState,
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      serializableCheck: false, // For storing Date objects in state
    }).concat(dataChangeMiddleware as Middleware, portfolioCacheMiddleware as Middleware);
  },
});

// Subscribe to store changes and save to localStorage
let isClearing = false;

store.subscribe(() => {
  // Don't save to localStorage during clearing operations
  if (isClearing) return;
  
  const state = store.getState();
  try {
    const stateToSave = {
      assets: { 
        items: state.assets.items,
        // Save portfolio cache to localStorage
        portfolioCache: state.assets.portfolioCache,
        portfolioCacheValid: state.assets.portfolioCacheValid,
        lastPortfolioCalculation: state.assets.lastPortfolioCalculation
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
      apiConfig: state.apiConfig
    };
    
    // Check if we're clearing data (all arrays are empty)
    const isEmpty = state.assets.items.length === 0 && 
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

// Type definitions
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  UnknownAction
>;