import { configureStore } from '@reduxjs/toolkit';
import type { AnyAction, ThunkAction } from '@reduxjs/toolkit';
import transactionsReducer from './slices/transactionsSlice';
import assetDefinitionsReducer, { fetchAssetDefinitions } from './slices/assetDefinitionsSlice';
import assetCategoriesReducer from './slices/assetCategoriesSlice';
import liabilitiesReducer from './slices/liabilitiesSlice';
import expensesReducer from './slices/expensesSlice';
import incomeReducer from './slices/incomeSlice';
import forecastReducer from './slices/forecastSlice';
import apiConfigReducer, { StockAPIProvider } from './slices/apiConfigSlice';
import dividendApiConfigReducer from './slices/dividendApiConfigSlice';
import customAnalyticsReducer from './slices/customAnalyticsSlice';
import snackbarReducer from './slices/snackbarSlice';
import dashboardSettingsReducer from './slices/dashboardSettingsSlice';
import calculatedDataReducer, { markStoreHydrated, validateCacheOnStartup } from './slices/calculatedDataSlice';
import portfolioIntradayReducer from './slices/portfolioIntradaySlice';
import aiConfigReducer from './slices/aiConfigSlice';
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
      // assetDefinitions NICHT mehr aus dem Storage laden, sondern leer initialisieren
      assetDefinitions: {
        items: [],
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
        assetFocusData: state.calculatedData?.assetFocusData || null,
        financialSummary: state.calculatedData?.financialSummary || null,
        status: 'idle',
        error: null,
        cacheValidityDuration: state.calculatedData?.cacheValidityDuration || 5 * 60 * 1000,
        enableConditionalLogging: state.calculatedData?.enableConditionalLogging ?? true,
        isHydrated: false // Will be set to true after store creation
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
    forecast: forecastReducer,
    apiConfig: apiConfigReducer,
    dividendApiConfig: dividendApiConfigReducer,
    customAnalytics: customAnalyticsReducer,
    snackbar: snackbarReducer,
    dashboardSettings: dashboardSettingsReducer,
    calculatedData: calculatedDataReducer,
    portfolioIntraday: portfolioIntradayReducer,
    aiConfig: aiConfigReducer,
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
  // Dann validate cache startup nach einem Tick
  setTimeout(() => {
    store.dispatch(validateCacheOnStartup());
    // AssetDefinitions nach Store-Hydration aus der DB laden
    store.dispatch(fetchAssetDefinitions());
  }, 0);
} else {
  // If no persisted state, still mark as hydrated (empty state is also hydrated)
  Logger.infoRedux('Store created without persisted state, marking as hydrated');
  store.dispatch(markStoreHydrated());
  // AssetDefinitions nach Store-Hydration aus der DB laden
  store.dispatch(fetchAssetDefinitions());
}

// Nach dem Laden des States müssen die AssetDefinitions asynchron aus der DB geladen werden!
// Dispatch dazu nach Store-Initialisierung: store.dispatch(fetchAssetDefinitions());
// Beispiel: Im App-Root (z.B. App.tsx) nach Store-Hydration:
//   useEffect(() => { if (store.getState().calculatedData.isHydrated) dispatch(fetchAssetDefinitions()); }, [dispatch]);

// Improved localStorage handling with throttling and size management
let saveTimeout: NodeJS.Timeout | null = null;

// Enhanced store subscription with throttling
const originalSubscribe = store.subscribe;
store.subscribe = (listener) => {
  return originalSubscribe(() => {
    // Throttle localStorage saves
    if (saveTimeout) clearTimeout(saveTimeout);
    
    saveTimeout = setTimeout(() => {
      try {
        const state = store.getState();
        // Fallback: lastCalculated setzen, falls nicht vorhanden
        let assetFocusDataToSave = state.calculatedData.assetFocusData;
        if (assetFocusDataToSave && !assetFocusDataToSave.lastCalculated) {
          Logger.warn('Persist: assetFocusData.lastCalculated fehlt, setze auf jetzt!');
          assetFocusDataToSave = { ...assetFocusDataToSave, lastCalculated: new Date().toISOString() };
        }
        let financialSummaryToSave = state.calculatedData.financialSummary;
        if (financialSummaryToSave && !financialSummaryToSave.lastCalculated) {
          Logger.warn('Persist: financialSummary.lastCalculated fehlt, setze auf jetzt!');
          financialSummaryToSave = { ...financialSummaryToSave, lastCalculated: new Date().toISOString() };
        }
        Logger.infoRedux(`Persist: Speichere calculatedData | assetFocusDataLastCalculated=${assetFocusDataToSave?.lastCalculated} | financialSummaryLastCalculated=${financialSummaryToSave?.lastCalculated}`);
        const stateToSave = {
          transactions: { 
            items: state.transactions.items,
            portfolioCache: state.transactions.portfolioCache,
            portfolioCacheValid: state.transactions.portfolioCacheValid,
            lastPortfolioCalculation: state.transactions.lastPortfolioCalculation
          },
          // assetDefinitions wird NICHT mehr gespeichert!
          assetCategories: {
            categories: state.assetCategories.categories,
            categoryOptions: state.assetCategories.categoryOptions,
            categoryAssignments: state.assetCategories.categoryAssignments
          },
          liabilities: { items: state.liabilities.items },
          expenses: { items: state.expenses.items },
          income: { items: state.income.items },
          customAnalytics: { charts: state.customAnalytics.charts },
          forecast: state.forecast,
          apiConfig: state.apiConfig,
          calculatedData: {
            assetFocusData: assetFocusDataToSave,
            financialSummary: financialSummaryToSave,
            status: 'idle',
            error: null,
            cacheValidityDuration: state.calculatedData.cacheValidityDuration,
            enableConditionalLogging: state.calculatedData.enableConditionalLogging
          }
        };
        
        // Check if data is empty
        const isEmpty = state.transactions.items.length === 0 && 
                       state.assetDefinitions.items.length === 0;
        
        if (isEmpty) {
          localStorage.removeItem('passiveIncomeCalculator');
        } else {
          const serialized = JSON.stringify(stateToSave);
          localStorage.setItem('passiveIncomeCalculator', serialized);
        }
      } catch (err) {
        console.error('Error saving state:', err);
      }
    }, 1000); // 1 second throttle
    
    listener();
  });
};

// Helper to get the store instance for use outside React
export const getStore = () => store;

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

// Make store available globally for debugging in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).__REDUX_STORE__ = store;
}