import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Expense } from '@/types/domains/financial/';
import sqliteService from '@service/infrastructure/sqlLiteService';
import { v4 as uuidv4 } from '@/utils/uuid';
import Logger from '@service/shared/logging/Logger/logger';
import { hydrateStore } from '../../actions/hydrateAction';
import { StandardCrudState, createSliceLogger, standardReducerPatterns } from '../../common/slicePatterns';

// Using standardized CRUD state interface
type ExpensesState = StandardCrudState<Expense>;

// Create logger for this slice
const logger = createSliceLogger('Expenses');

const initialState: ExpensesState = {
  items: [],
  status: 'idle',
  error: null
};

export const fetchExpenses = createAsyncThunk(
  'expenses/fetchExpenses',
  async (_, { getState }) => {
    Logger.infoRedux(logger.startOperation('fetch'));
    const state = getState() as { expenses: ExpensesState };
    
    // If we already have items (from localStorage), don't fetch from SQLite
    if (state.expenses.items.length > 0) {
      Logger.infoRedux(logger.cacheHit('fetch') + ` - ${state.expenses.items.length} entries from localStorage`);
      return state.expenses.items;
    }

    const result = await sqliteService.getAll('expenses');
    Logger.infoRedux(logger.completeOperation('fetch', `${result.length} entries retrieved`));
    return result;
  }
);

export const addExpense = createAsyncThunk(
  'expenses/addExpense',
  async (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    Logger.infoRedux(logger.startOperation('add'));
    const now = new Date().toISOString();
    const newExpense: Expense = {
      ...expense,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };
    await sqliteService.add('expenses', newExpense);
    Logger.infoRedux(logger.completeOperation('add', `ID: ${newExpense.id}`));
    return newExpense;
  }
);

export const updateExpense = createAsyncThunk(
  'expenses/updateExpense',
  async (expense: Expense) => {
    Logger.infoRedux(logger.startOperation('update', `for ID: ${expense.id}`));
    const updatedExpense: Expense = {
      ...expense,
      updatedAt: new Date().toISOString()
    };
    await sqliteService.update('expenses', updatedExpense);
    Logger.infoRedux(logger.completeOperation('update', `ID: ${expense.id}`));
    return updatedExpense;
  }
);

export const deleteExpense = createAsyncThunk(
  'expenses/deleteExpense',
  async (id: string) => {
    Logger.infoRedux(logger.startOperation('delete', `for ID: ${id}`));
    await sqliteService.remove('expenses', id);
    Logger.infoRedux(logger.completeOperation('delete', `ID: ${id}`));
    return id;
  }
);

const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    // Clear all expenses action
    clearAllExpenses: (state) => {
      state.items = [];
      state.status = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Hydration
      .addCase(hydrateStore, (state, action) => {
        if (action.payload.expenses) {
          return {
            ...state,
            ...action.payload.expenses,
            status: 'idle',
            error: null
          };
        }
        return state;
      })
      // Fetch expenses
      .addCase(fetchExpenses.pending, standardReducerPatterns.pending)
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        standardReducerPatterns.fulfilled(state);
        state.items = action.payload;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        const errorMsg = action.error.message || 'Failed to fetch expenses';
        Logger.infoRedux(logger.failOperation('fetch', errorMsg));
        standardReducerPatterns.rejected(state, errorMsg);
      })
      
      // Add expense
      .addCase(addExpense.pending, standardReducerPatterns.pending)
      .addCase(addExpense.fulfilled, (state, action) => {
        standardReducerPatterns.fulfilled(state);
        state.items.push(action.payload);
      })
      .addCase(addExpense.rejected, (state, action) => {
        const errorMsg = action.error.message || 'Failed to add expense';
        Logger.infoRedux(logger.failOperation('add', errorMsg));
        standardReducerPatterns.rejected(state, errorMsg);
      })
      
      // Update expense
      .addCase(updateExpense.pending, standardReducerPatterns.pending)
      .addCase(updateExpense.fulfilled, (state, action) => {
        const index = state.items.findIndex(expense => expense.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        standardReducerPatterns.fulfilled(state);
      })
      .addCase(updateExpense.rejected, (state, action) => {
        const errorMsg = action.error.message || 'Failed to update expense';
        Logger.infoRedux(logger.failOperation('update', errorMsg));
        standardReducerPatterns.rejected(state, errorMsg);
      })
      
      // Delete expense
      .addCase(deleteExpense.pending, standardReducerPatterns.pending)
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.items = state.items.filter(expense => expense.id !== action.payload);
        standardReducerPatterns.fulfilled(state);
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        const errorMsg = action.error.message || 'Failed to delete expense';
        Logger.infoRedux(logger.failOperation('delete', errorMsg));
        standardReducerPatterns.rejected(state, errorMsg);
      });
  }
});

export const { clearAllExpenses } = expensesSlice.actions;

export default expensesSlice.reducer;