import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Income } from '../../types';
import sqliteService from '../../service/sqlLiteService';
import { v4 as uuidv4 } from '../../utils/uuid';
import { hydrateStore } from '../actions/hydrateAction';
import { RootState } from '..';

interface IncomeState {
  items: Income[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: IncomeState = {
  items: [],
  status: 'idle',
  error: null
};

// Async Thunks
export const fetchIncome = createAsyncThunk('income/fetchIncome', async () => {
  return await sqliteService.getAll('income');
});

export const addIncome = createAsyncThunk(
  'income/addIncome', 
  async (income: Omit<Income, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newIncome: Income = {
      ...income,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };
    await sqliteService.add('income', newIncome);
    return newIncome;
  }
);

export const updateIncome = createAsyncThunk('income/updateIncome', async (income: Income) => {
  const updatedIncome: Income = {
    ...income,
    updatedAt: new Date().toISOString()
  };
  await sqliteService.update('income', updatedIncome);
  return updatedIncome;
});

export const deleteIncome = createAsyncThunk('income/deleteIncome', async (id: string) => {
  await sqliteService.remove('income', id);
  return id;
});

// Slice
const incomeSlice = createSlice({
  name: 'income',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(hydrateStore, (state, action) => {
        if (action.payload.income) {
          return {
            ...state,
            ...action.payload.income,
            status: 'idle',
            error: null
          };
        }
        return state;
      })
      // Fetch income
      .addCase(fetchIncome.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchIncome.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchIncome.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch income';
      })
      
      // Add income
      .addCase(addIncome.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      
      // Update income
      .addCase(updateIncome.fulfilled, (state, action) => {
        const index = state.items.findIndex(income => income.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      
      // Delete income
      .addCase(deleteIncome.fulfilled, (state, action) => {
        state.items = state.items.filter(income => income.id !== action.payload);
      });
  }
});

const incomeReducer = incomeSlice.reducer;
export default incomeReducer;