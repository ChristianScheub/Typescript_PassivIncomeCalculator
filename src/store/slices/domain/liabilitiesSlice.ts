import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Liability } from '@/types/domains/financial/';
import sqliteService from '@service/infrastructure/sqlLiteService';
import { v4 as uuidv4 } from '@/utils/uuid';
import Logger from '@service/shared/logging/Logger/logger';
import { hydrateStore } from '../../actions/hydrateAction';
import { StandardCrudState, createSliceLogger, standardReducerPatterns } from '../../common/slicePatterns';

// Using standardized CRUD state interface
type LiabilitiesState = StandardCrudState<Liability>;

// Create logger for this slice
const logger = createSliceLogger('Liabilities');

const initialState: LiabilitiesState = {
  items: [],
  status: 'idle',
  error: null
};

// Async Thunks
export const fetchLiabilities = createAsyncThunk('liabilities/fetchLiabilities', async (_, { getState }) => {
  Logger.infoRedux(logger.startOperation('fetch'));
  const state = getState() as { liabilities: LiabilitiesState };
  
  // If we already have items (from localStorage), don't fetch from SQLite
  if (state.liabilities.items.length > 0) {
    Logger.infoRedux(logger.cacheHit('fetch') + ` - ${state.liabilities.items.length} entries from localStorage`);
    return state.liabilities.items;
  }

  const result = await sqliteService.getAll('liabilities');
  Logger.infoRedux(logger.completeOperation('fetch', `${result.length} entries retrieved`));
  return result;
});

export const addLiability = createAsyncThunk(
  'liabilities/addLiability', 
  async (liability: Omit<Liability, 'id' | 'createdAt' | 'updatedAt'>) => {
    Logger.infoRedux(logger.startOperation('add'));
    const now = new Date().toISOString();
    const newLiability: Liability = {
      ...liability,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };
    await sqliteService.add('liabilities', newLiability);
    Logger.infoRedux(logger.completeOperation('add', `ID: ${newLiability.id}`));
    return newLiability;
  }
);

export const updateLiability = createAsyncThunk('liabilities/updateLiability', async (liability: Liability) => {
  Logger.infoRedux(logger.startOperation('update', `for ID: ${liability.id}`));
  const updatedLiability: Liability = {
    ...liability,
    updatedAt: new Date().toISOString()
  };
  await sqliteService.update('liabilities', updatedLiability);
  Logger.infoRedux(logger.completeOperation('update', `ID: ${liability.id}`));
  return updatedLiability;
});

export const deleteLiability = createAsyncThunk('liabilities/deleteLiability', async (id: string) => {
  Logger.infoRedux(logger.startOperation('delete', `for ID: ${id}`));
  await sqliteService.remove('liabilities', id);
  Logger.infoRedux(logger.completeOperation('delete', `ID: ${id}`));
  return id;
});

// Slice
const liabilitiesSlice = createSlice({
  name: 'liabilities',
  initialState,
  reducers: {
    // Clear all liabilities action
    clearAllLiabilities: (state) => {
      state.items = [];
      state.status = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrateStore, (state, action) => {
        if (action.payload.liabilities) {
          return {
            ...state,
            ...action.payload.liabilities,
            status: 'idle',
            error: null
          };
        }
        return state;
      })
      // Fetch liabilities
      .addCase(fetchLiabilities.pending, standardReducerPatterns.pending)
      .addCase(fetchLiabilities.fulfilled, (state, action) => {
        standardReducerPatterns.fulfilled(state);
        state.items = action.payload;
      })
      .addCase(fetchLiabilities.rejected, (state, action) => {
        const errorMsg = action.error.message || 'Failed to fetch liabilities';
        Logger.infoRedux(logger.failOperation('fetch', errorMsg));
        standardReducerPatterns.rejected(state, errorMsg);
      })
      
      // Add liability
      .addCase(addLiability.pending, standardReducerPatterns.pending)
      .addCase(addLiability.fulfilled, (state, action) => {
        standardReducerPatterns.fulfilled(state);
        state.items.push(action.payload);
      })
      .addCase(addLiability.rejected, (state, action) => {
        const errorMsg = action.error.message || 'Failed to add liability';
        Logger.infoRedux(logger.failOperation('add', errorMsg));
        standardReducerPatterns.rejected(state, errorMsg);
      })
      
      // Update liability
      .addCase(updateLiability.pending, standardReducerPatterns.pending)
      .addCase(updateLiability.fulfilled, (state, action) => {
        const index = state.items.findIndex(liability => liability.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        standardReducerPatterns.fulfilled(state);
      })
      .addCase(updateLiability.rejected, (state, action) => {
        const errorMsg = action.error.message || 'Failed to update liability';
        Logger.infoRedux(logger.failOperation('update', errorMsg));
        standardReducerPatterns.rejected(state, errorMsg);
      })
      
      // Delete liability
      .addCase(deleteLiability.pending, standardReducerPatterns.pending)
      .addCase(deleteLiability.fulfilled, (state, action) => {
        state.items = state.items.filter(liability => liability.id !== action.payload);
        standardReducerPatterns.fulfilled(state);
      })
      .addCase(deleteLiability.rejected, (state, action) => {
        const errorMsg = action.error.message || 'Failed to delete liability';
        Logger.infoRedux(logger.failOperation('delete', errorMsg));
        standardReducerPatterns.rejected(state, errorMsg);
      });
  }
});

export const { clearAllLiabilities } = liabilitiesSlice.actions;

const liabilitiesReducer = liabilitiesSlice.reducer;
export default liabilitiesReducer;