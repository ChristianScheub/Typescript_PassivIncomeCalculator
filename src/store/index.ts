import { configureStore } from '@reduxjs/toolkit';
import assetsReducer from './slices/assetsSlice';
import liabilitiesReducer from './slices/liabilitiesSlice';
import expensesReducer from './slices/expensesSlice';
import incomeReducer from './slices/incomeSlice';

export const store = configureStore({
  reducer: {
    assets: assetsReducer,
    liabilities: liabilitiesReducer,
    expenses: expensesReducer,
    income: incomeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // For storing Date objects in state
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;