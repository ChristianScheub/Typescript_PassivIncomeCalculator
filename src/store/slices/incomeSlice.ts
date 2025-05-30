import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Income } from '../../types';
import * as storageService from '../../service/storage';
import { v4 as uuidv4 } from '../../utils/uuid';

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
  return await storageService.getAll<Income>('income');
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
    await storageService.add('income', newIncome);
    return newIncome;
  }
);

export const updateIncome = createAsyncThunk('income/updateIncome', async (income: Income) => {
  const updatedIncome: Income = {
    ...income,
    updatedAt: new Date().toISOString()
  };
  await storageService.update('income', updatedIncome);
  return updatedIncome;
});

export const deleteIncome = createAsyncThunk('income/deleteIncome', async (id: string) => {
  await storageService.remove('income', id);
  return id;
});

// Slice
const incomeSlice = createSlice({
  name: 'income',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
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

export default incomeSlice.reducer;