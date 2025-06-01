import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Expense } from '../../types';
import sqliteService from '../../service/sqlLiteService';
import { v4 as uuidv4 } from '../../utils/uuid';

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

// Async Thunks
export const fetchExpenses = createAsyncThunk('expenses/fetchExpenses', async () => {
  return await sqliteService.getAll('expenses');
});

export const addExpense = createAsyncThunk(
  'expenses/addExpense', 
  async (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newExpense: Expense = {
      ...expense,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };
    await sqliteService.add('expenses', newExpense);
    return newExpense;
  }
);

export const updateExpense = createAsyncThunk('expenses/updateExpense', async (expense: Expense) => {
  const updatedExpense: Expense = {
    ...expense,
    updatedAt: new Date().toISOString()
  };
  await sqliteService.update('expenses', updatedExpense);
  return updatedExpense;
});

export const deleteExpense = createAsyncThunk('expenses/deleteExpense', async (id: string) => {
  await sqliteService.remove('expenses', id);
  return id;
});

// Slice
const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch expenses
      .addCase(fetchExpenses.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch expenses';
      })
      
      // Add expense
      .addCase(addExpense.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      
      // Update expense
      .addCase(updateExpense.fulfilled, (state, action) => {
        const index = state.items.findIndex(expense => expense.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      
      // Delete expense
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.items = state.items.filter(expense => expense.id !== action.payload);
      });
  }
});

export default expensesSlice.reducer;