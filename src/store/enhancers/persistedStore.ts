import { StoreEnhancer } from '@reduxjs/toolkit';

const STORAGE_KEY = 'passiveIncomeCalculator';

export const createPersistedStore: StoreEnhancer = (createStore) => 
  (reducer, preloadedState) => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        const persistedState = {
          assets: { 
            items: parsed.assets?.items || [],
            status: 'idle',
            error: null
          },
          liabilities: {
            items: parsed.liabilities?.items || [],
            status: 'idle',
            error: null
          },
          expenses: {
            items: parsed.expenses?.items || [],
            status: 'idle',
            error: null
          },
          income: {
            items: parsed.income?.items || [],
            status: 'idle',
            error: null
          },
          dashboard: parsed.dashboard || {}
        };
        // Use type assertion to allow the persisted state
        preloadedState = persistedState as any;
      }
    } catch (err) {
      console.error('Error loading state:', err);
    }

    const store = createStore(reducer, preloadedState);

    store.subscribe(() => {
      try {
        // Use type assertion for state access
        const state = store.getState() as any;
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
          dashboard: state.dashboard
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      } catch (err) {
        console.error('Error saving state:', err);
      }
    });

    return store;
  };
