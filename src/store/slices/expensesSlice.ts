import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Expense } from '../../types/domains/financial/';
import sqliteService from '../../service/sqlLiteService';
import { v4 as uuidv4 } from '../../utils/uuid';
import Logger from '../../service/Logger/logger';
import { hydrateStore } from '../actions/hydrateAction';

interface ExpensesState {
  items: Expense[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ExpensesState = {
  items: [],
  status: 'idle',
  error: null
};

export const fetchExpenses = createAsyncThunk(
  'expenses/fetchExpenses',
  async (_, { getState }) => {
    const state = getState() as { expenses: ExpensesState };
    
    // If we already have items (from localStorage), don't fetch from SQLite
    if (state.expenses.items.length > 0) {
      Logger.infoRedux('Using expenses from localStorage');
      return state.expenses.items;
    }

    Logger.infoRedux('Fetching all expenses from SQLite');
    return await sqliteService.getAll('expenses');
  }
);

export const addExpense = createAsyncThunk(
  'expenses/addExpense',
  async (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    Logger.infoRedux(`Adding new expense: ${JSON.stringify(expense)}`);
    const now = new Date().toISOString();
    const newExpense: Expense = {
      ...expense,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };
    await sqliteService.add('expenses', newExpense);
    Logger.infoRedux(`Expense added successfully: ${JSON.stringify(newExpense)}`);
    return newExpense;
  }
);

export const updateExpense = createAsyncThunk(
  'expenses/updateExpense',
  async (expense: Expense) => {
    Logger.infoRedux(`Updating expense: ${JSON.stringify(expense)}`);
    const updatedExpense: Expense = {
      ...expense,
      updatedAt: new Date().toISOString()
    };
    await sqliteService.update('expenses', updatedExpense);
    Logger.infoRedux('Expense updated successfully');
    return updatedExpense;
  }
);

export const deleteExpense = createAsyncThunk(
  'expenses/deleteExpense',
  async (id: string) => {
    Logger.infoRedux(`Deleting expense with ID: ${id}`);
    await sqliteService.remove('expenses', id);
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
      .addCase(fetchExpenses.pending, (state) => {
        Logger.infoRedux('Fetching expenses...');
        state.status = 'loading';
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        Logger.infoRedux(`Fetched ${action.payload.length} expenses`);
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        Logger.infoRedux(`Failed to fetch expenses: ${action.error.message}`);
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch expenses';
      })
      
      // Add expense
      .addCase(addExpense.pending, (state) => {
        Logger.infoRedux('Adding expense...');
        state.status = 'loading';
      })
      .addCase(addExpense.fulfilled, (state, action) => {
        Logger.infoRedux('Expense added successfully');
        state.status = 'succeeded';
        state.items.push(action.payload);
      })
      .addCase(addExpense.rejected, (state, action) => {
        Logger.infoRedux(`Failed to add expense: ${action.error.message}`);
        state.status = 'failed';
        state.error = action.error.message || 'Failed to add expense';
      })
      
      // Update expense
      .addCase(updateExpense.pending, (state) => {
        Logger.infoRedux('Updating expense...');
        state.status = 'loading';
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        const index = state.items.findIndex(expense => expense.id === action.payload.id);
        if (index !== -1) {
          Logger.infoRedux(`Expense ${action.payload.id} updated successfully`);
          state.items[index] = action.payload;
        }
        state.status = 'succeeded';
      })
      .addCase(updateExpense.rejected, (state, action) => {
        Logger.infoRedux(`Failed to update expense: ${action.error.message}`);
        state.status = 'failed';
        state.error = action.error.message || 'Failed to update expense';
      })
      
      // Delete expense
      .addCase(deleteExpense.pending, (state) => {
        Logger.infoRedux('Deleting expense...');
        state.status = 'loading';
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        Logger.infoRedux(`Expense ${action.payload} deleted successfully`);
        state.items = state.items.filter(expense => expense.id !== action.payload);
        state.status = 'succeeded';
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        Logger.infoRedux(`Failed to delete expense: ${action.error.message}`);
        state.status = 'failed';
        state.error = action.error.message || 'Failed to delete expense';
      });
  }
});

export const { clearAllExpenses } = expensesSlice.actions;

export default expensesSlice.reducer;