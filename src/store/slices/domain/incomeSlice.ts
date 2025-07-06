import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Income } from '@/types/domains/financial/';
import sqliteService from '@service/infrastructure/sqlLiteService';
import { v4 as uuidv4 } from '@/utils/uuid';
import Logger from '@service/shared/logging/Logger/logger';
import { hydrateStore } from '../../actions/hydrateAction';
import { StandardCrudState, createSliceLogger, standardReducerPatterns } from '../../common/slicePatterns';

// Using standardized CRUD state interface
type IncomeState = StandardCrudState<Income>;

// Create logger for this slice
const logger = createSliceLogger('Income');

const initialState: IncomeState = {
  items: [],
  status: 'idle',
  error: null
};

// Async Thunks
export const fetchIncome = createAsyncThunk('income/fetchIncome', async (_, { getState }) => {
  Logger.infoRedux(logger.startOperation('fetch'));
  const state = getState() as { income: IncomeState };
  
  // If we already have items (from localStorage), don't fetch from SQLite
  if (state.income.items.length > 0) {
    Logger.infoRedux(logger.cacheHit('fetch') + ` - ${state.income.items.length} entries from localStorage`);
    return state.income.items;
  }

  const result = await sqliteService.getAll('income');
  Logger.infoRedux(logger.completeOperation('fetch', `${result.length} entries retrieved`));
  return result;
});

export const addIncome = createAsyncThunk(
  'income/addIncome', 
  async (income: Omit<Income, 'id' | 'createdAt' | 'updatedAt'>) => {
    Logger.infoRedux(logger.startOperation('add'));
    const now = new Date().toISOString();
    const newIncome: Income = {
      ...income,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };
    await sqliteService.add('income', newIncome);
    Logger.infoRedux(logger.completeOperation('add', `ID: ${newIncome.id}`));
    return newIncome;
  }
);

export const updateIncome = createAsyncThunk('income/updateIncome', async (income: Income) => {
  Logger.infoRedux(logger.startOperation('update', `for ID: ${income.id}`));
  const updatedIncome: Income = {
    ...income,
    updatedAt: new Date().toISOString()
  };
  await sqliteService.update('income', updatedIncome);
  Logger.infoRedux(logger.completeOperation('update', `ID: ${income.id}`));
  return updatedIncome;
});

export const deleteIncome = createAsyncThunk('income/deleteIncome', async (id: string) => {
  Logger.infoRedux(logger.startOperation('delete', `for ID: ${id}`));
  await sqliteService.remove('income', id);
  Logger.infoRedux(logger.completeOperation('delete', `ID: ${id}`));
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
      .addCase(fetchIncome.pending, standardReducerPatterns.pending)
      .addCase(fetchIncome.fulfilled, (state, action) => {
        standardReducerPatterns.fulfilled(state);
        state.items = action.payload;
      })
      .addCase(fetchIncome.rejected, (state, action) => {
        const errorMsg = action.error.message || 'Failed to fetch income';
        Logger.infoRedux(logger.failOperation('fetch', errorMsg));
        standardReducerPatterns.rejected(state, errorMsg);
      })
      
      // Add income
      .addCase(addIncome.pending, standardReducerPatterns.pending)
      .addCase(addIncome.fulfilled, (state, action) => {
        standardReducerPatterns.fulfilled(state);
        state.items.push(action.payload);
      })
      .addCase(addIncome.rejected, (state, action) => {
        const errorMsg = action.error.message || 'Failed to add income';
        Logger.infoRedux(logger.failOperation('add', errorMsg));
        standardReducerPatterns.rejected(state, errorMsg);
      })
      
      // Update income
      .addCase(updateIncome.pending, standardReducerPatterns.pending)
      .addCase(updateIncome.fulfilled, (state, action) => {
        const index = state.items.findIndex(income => income.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        standardReducerPatterns.fulfilled(state);
      })
      .addCase(updateIncome.rejected, (state, action) => {
        const errorMsg = action.error.message || 'Failed to update income';
        Logger.infoRedux(logger.failOperation('update', errorMsg));
        standardReducerPatterns.rejected(state, errorMsg);
      })
      
      // Delete income
      .addCase(deleteIncome.pending, standardReducerPatterns.pending)
      .addCase(deleteIncome.fulfilled, (state, action) => {
        state.items = state.items.filter(income => income.id !== action.payload);
        standardReducerPatterns.fulfilled(state);
      })
      .addCase(deleteIncome.rejected, (state, action) => {
        const errorMsg = action.error.message || 'Failed to delete income';
        Logger.infoRedux(logger.failOperation('delete', errorMsg));
        standardReducerPatterns.rejected(state, errorMsg);
      });
  }
});

export const { clearAllIncome } = incomeSlice.actions;

const incomeReducer = incomeSlice.reducer;
export default incomeReducer;