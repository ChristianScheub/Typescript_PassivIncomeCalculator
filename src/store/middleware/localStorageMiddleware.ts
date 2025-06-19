import { Middleware, AnyAction } from '@reduxjs/toolkit';
import { StoreState } from '..';
import { HYDRATE } from '../actions/hydrateAction';

const STORAGE_KEY = 'passiveIncomeCalculator';

// Type guard to check if action has a type property
function isActionWithType(action: unknown): action is AnyAction {
  return typeof action === 'object' && action !== null && 'type' in action;
}

// Aktionen, die wir nicht persistieren wollen
const BLACKLISTED_ACTIONS = [
  'assets/updateAssetDividendCache',
  'assets/invalidateAssetDividendCache',
  'assets/invalidateAllDividendCaches',
  HYDRATE
];

export const localStorageMiddleware: Middleware<object, StoreState> = store => next => (action: unknown) => {
  const result = next(action);

  // Check if action has type property
  if (!isActionWithType(action)) {
    return result;
  }

  // Speichere den State nur, wenn die Aktion nicht blacklisted ist
  if (!BLACKLISTED_ACTIONS.includes(action.type)) {
    const state = store.getState() as StoreState;
    try {
      const stateToSave = {
        assets: { 
          items: state.transactions.items,
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
