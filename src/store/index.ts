import { configureStore } from '@reduxjs/toolkit';
import assetsReducer from './slices/assetsSlice';
import liabilitiesReducer from './slices/liabilitiesSlice';
import expensesReducer from './slices/expensesSlice';
import incomeReducer from './slices/incomeSlice';
import dashboardReducer from './slices/dashboardSlice';
import forecastReducer from './slices/forecastSlice';
import dataChangeMiddleware from './middleware/dataChangeMiddleware';
import Logger from '../service/Logger/logger';

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
    return {
      assets: { 
        items: state.assets?.items || [],
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
      dashboard: state.dashboard || {},
      forecast: state.forecast || {}
    };
  } catch (err) {
    Logger.error('Error loading state from localStorage:'+ JSON.stringify(err));
    return undefined;
  }
};

const persistedState = loadState();

export const store = configureStore({
  reducer: {
    assets: assetsReducer,
    liabilities: liabilitiesReducer,
    expenses: expensesReducer,
    income: incomeReducer,
    dashboard: dashboardReducer,
    forecast: forecastReducer,
  },
  preloadedState: persistedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // For storing Date objects in state
    }).concat(dataChangeMiddleware)
});

// Subscribe to store changes and save to localStorage
store.subscribe(() => {
  const state = store.getState();
  try {
    const stateToSave = {
      assets: { 
        items: state.assets.items
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
      dashboard: state.dashboard,
      forecast: state.forecast
    };
    localStorage.setItem('passiveIncomeCalculator', JSON.stringify(stateToSave));
  } catch (err) {
    console.error('Error saving state:', err);
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;