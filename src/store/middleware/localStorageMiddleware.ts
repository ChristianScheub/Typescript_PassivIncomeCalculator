import { Middleware } from '@reduxjs/toolkit';
import { RootState } from '..';
import { HYDRATE } from '../actions/hydrateAction';

const STORAGE_KEY = 'passiveIncomeCalculator';

// Aktionen, die wir nicht persistieren wollen
const BLACKLISTED_ACTIONS = [
  'assets/updateAssetDividendCache',
  'assets/invalidateAssetDividendCache',
  'assets/invalidateAllDividendCaches',
  HYDRATE
];

export const localStorageMiddleware: Middleware = store => next => (action: any) => {
  const result = next(action);

  // Speichere den State nur, wenn die Aktion nicht blacklisted ist
  if (!BLACKLISTED_ACTIONS.includes(action.type)) {
    const state = store.getState() as RootState;
    try {
      const stateToSave = {
        assets: { 
          items: state.assets.items,
          status: 'idle',
          error: null
        },
        liabilities: {
          items: state.liabilities.items,
          status: 'idle',
          error: null
        },
        expenses: {
          items: state.expenses.items,
          status: 'idle',
          error: null
        },
        income: {
          items: state.income.items,
          status: 'idle',
          error: null
        },
        dashboard: state.dashboard
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (err) {
      console.error('Error saving state to localStorage:', err);
    }
  }

  return result;
};
