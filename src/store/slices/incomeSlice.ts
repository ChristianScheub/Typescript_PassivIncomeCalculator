import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Income } from '../../types/domains/financial/';
import sqliteService from '../../service/sqlLiteService';
import { v4 as uuidv4 } from '../../utils/uuid';
import Logger from '../../service/Logger/logger';
import { hydrateStore } from '../actions/hydrateAction';

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
export const fetchIncome = createAsyncThunk('income/fetchIncome', async (_, { getState }) => {
  const state = getState() as { income: IncomeState };
  
  // If we already have items (from localStorage), don't fetch from SQLite
  if (state.income.items.length > 0) {
    Logger.infoRedux('Using income entries from localStorage');
    return state.income.items;
  }

  Logger.infoRedux('Fetching all income entries from SQLite');
  return await sqliteService.getAll('income');
});

export const addIncome = createAsyncThunk(
  'income/addIncome', 
  async (income: Omit<Income, 'id' | 'createdAt' | 'updatedAt'>) => {
    Logger.infoRedux(`Adding new income entry: ${JSON.stringify(income)}`);
    const now = new Date().toISOString();
    const newIncome: Income = {
      ...income,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };
    await sqliteService.add('income', newIncome);
    Logger.infoRedux(`Income entry added successfully: ${JSON.stringify(newIncome)}`);
    return newIncome;
  }
);

export const updateIncome = createAsyncThunk('income/updateIncome', async (income: Income) => {
  Logger.infoRedux(`Updating income entry: ${JSON.stringify(income)}`);
  const updatedIncome: Income = {
    ...income,
    updatedAt: new Date().toISOString()
  };
  await sqliteService.update('income', updatedIncome);
  Logger.infoRedux('Income entry updated successfully');
  return updatedIncome;
});

export const deleteIncome = createAsyncThunk('income/deleteIncome', async (id: string) => {
  Logger.infoRedux(`Deleting income entry with ID: ${id}`);
  await sqliteService.remove('income', id);
  return id;
});

// Slice
const incomeSlice = createSlice({
  name: 'income',
  initialState,
  reducers: {
    // Clear all income action
    clearAllIncome: (state) => {
      state.items = [];
      state.status = 'idle';
      state.error = null;
    }
  },
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
        Logger.infoRedux('Fetching income entries...');
        state.status = 'loading';
      })
      .addCase(fetchIncome.fulfilled, (state, action) => {
        Logger.infoRedux(`Fetched ${action.payload.length} income entries`);
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchIncome.rejected, (state, action) => {
        Logger.infoRedux(`Failed to fetch income entries: ${action.error.message}`);
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch income';
      })
      
      // Add income
      .addCase(addIncome.pending, (state) => {
        Logger.infoRedux('Adding income entry...');
        state.status = 'loading';
      })
      .addCase(addIncome.fulfilled, (state, action) => {
        Logger.infoRedux('Income entry added successfully');
        state.status = 'succeeded';
        state.items.push(action.payload);
      })
      .addCase(addIncome.rejected, (state, action) => {
        Logger.infoRedux(`Failed to add income entry: ${action.error.message}`);
        state.status = 'failed';
        state.error = action.error.message || 'Failed to add income';
      })
      
      // Update income
      .addCase(updateIncome.pending, (state) => {
        Logger.infoRedux('Updating income entry...');
        state.status = 'loading';
      })
      .addCase(updateIncome.fulfilled, (state, action) => {
        const index = state.items.findIndex(income => income.id === action.payload.id);
        if (index !== -1) {
          Logger.infoRedux(`Income entry ${action.payload.id} updated successfully`);
          state.items[index] = action.payload;
        }
        state.status = 'succeeded';
      })
      .addCase(updateIncome.rejected, (state, action) => {
        Logger.infoRedux(`Failed to update income entry: ${action.error.message}`);
        state.status = 'failed';
        state.error = action.error.message || 'Failed to update income';
      })
      
      // Delete income
      .addCase(deleteIncome.pending, (state) => {
        Logger.infoRedux('Deleting income entry...');
        state.status = 'loading';
      })
      .addCase(deleteIncome.fulfilled, (state, action) => {
        Logger.infoRedux(`Income entry ${action.payload} deleted successfully`);
        state.items = state.items.filter(income => income.id !== action.payload);
        state.status = 'succeeded';
      })
      .addCase(deleteIncome.rejected, (state, action) => {
        Logger.infoRedux(`Failed to delete income entry: ${action.error.message}`);
        state.status = 'failed';
        state.error = action.error.message || 'Failed to delete income';
      });
  }
});

export const { clearAllIncome } = incomeSlice.actions;

const incomeReducer = incomeSlice.reducer;
export default incomeReducer;