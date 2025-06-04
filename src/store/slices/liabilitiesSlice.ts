import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Liability } from '../../types';
import sqliteService from '../../service/sqlLiteService';
import { v4 as uuidv4 } from '../../utils/uuid';
import Logger from '../../service/Logger/logger';
import { hydrateStore } from '../actions/hydrateAction';

interface LiabilitiesState {
  items: Liability[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: LiabilitiesState = {
  items: [],
  status: 'idle',
  error: null
};

// Async Thunks
export const fetchLiabilities = createAsyncThunk('liabilities/fetchLiabilities', async (_, { getState }) => {
  const state = getState() as { liabilities: LiabilitiesState };
  
  // If we already have items (from localStorage), don't fetch from SQLite
  if (state.liabilities.items.length > 0) {
    Logger.infoRedux('Using liabilities from localStorage');
    return state.liabilities.items;
  }

  Logger.infoRedux('Fetching all liabilities from SQLite');
  return await sqliteService.getAll('liabilities');
});

export const addLiability = createAsyncThunk(
  'liabilities/addLiability', 
  async (liability: Omit<Liability, 'id' | 'createdAt' | 'updatedAt'>) => {
    Logger.infoRedux(`Adding new liability: ${JSON.stringify(liability)}`);
    const now = new Date().toISOString();
    const newLiability: Liability = {
      ...liability,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };
    await sqliteService.add('liabilities', newLiability);
    Logger.infoRedux(`Liability added successfully: ${JSON.stringify(newLiability)}`);
    return newLiability;
  }
);

export const updateLiability = createAsyncThunk('liabilities/updateLiability', async (liability: Liability) => {
  Logger.infoRedux(`Updating liability: ${JSON.stringify(liability)}`);
  const updatedLiability: Liability = {
    ...liability,
    updatedAt: new Date().toISOString()
  };
  await sqliteService.update('liabilities', updatedLiability);
  Logger.infoRedux('Liability updated successfully');
  return updatedLiability;
});

export const deleteLiability = createAsyncThunk('liabilities/deleteLiability', async (id: string) => {
  Logger.infoRedux(`Deleting liability with ID: ${id}`);
  await sqliteService.remove('liabilities', id);
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
      .addCase(fetchLiabilities.pending, (state) => {
        Logger.infoRedux('Fetching liabilities...');
        state.status = 'loading';
      })
      .addCase(fetchLiabilities.fulfilled, (state, action) => {
        Logger.infoRedux(`Fetched ${action.payload.length} liabilities`);
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchLiabilities.rejected, (state, action) => {
        Logger.infoRedux(`Failed to fetch liabilities: ${action.error.message}`);
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch liabilities';
      })
      
      // Add liability
      .addCase(addLiability.pending, (state) => {
        Logger.infoRedux('Adding liability...');
        state.status = 'loading';
      })
      .addCase(addLiability.fulfilled, (state, action) => {
        Logger.infoRedux('Liability added successfully');
        state.status = 'succeeded';
        state.items.push(action.payload);
      })
      .addCase(addLiability.rejected, (state, action) => {
        Logger.infoRedux(`Failed to add liability: ${action.error.message}`);
        state.status = 'failed';
        state.error = action.error.message || 'Failed to add liability';
      })
      
      // Update liability
      .addCase(updateLiability.pending, (state) => {
        Logger.infoRedux('Updating liability...');
        state.status = 'loading';
      })
      .addCase(updateLiability.fulfilled, (state, action) => {
        const index = state.items.findIndex(liability => liability.id === action.payload.id);
        if (index !== -1) {
          Logger.infoRedux(`Liability ${action.payload.id} updated successfully`);
          state.items[index] = action.payload;
        }
        state.status = 'succeeded';
      })
      .addCase(updateLiability.rejected, (state, action) => {
        Logger.infoRedux(`Failed to update liability: ${action.error.message}`);
        state.status = 'failed';
        state.error = action.error.message || 'Failed to update liability';
      })
      
      // Delete liability
      .addCase(deleteLiability.pending, (state) => {
        Logger.infoRedux('Deleting liability...');
        state.status = 'loading';
      })
      .addCase(deleteLiability.fulfilled, (state, action) => {
        Logger.infoRedux(`Liability ${action.payload} deleted successfully`);
        state.items = state.items.filter(liability => liability.id !== action.payload);
        state.status = 'succeeded';
      })
      .addCase(deleteLiability.rejected, (state, action) => {
        Logger.infoRedux(`Failed to delete liability: ${action.error.message}`);
        state.status = 'failed';
        state.error = action.error.message || 'Failed to delete liability';
      });
  }
});

export const { clearAllLiabilities } = liabilitiesSlice.actions;

const liabilitiesReducer = liabilitiesSlice.reducer;
export default liabilitiesReducer;