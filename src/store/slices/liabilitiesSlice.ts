import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Liability } from '../../types';
import sqliteService from '../../service/sqlLiteService';
import { v4 as uuidv4 } from '../../utils/uuid';
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
export const fetchLiabilities = createAsyncThunk('liabilities/fetchLiabilities', async () => {
  return await sqliteService.getAll('liabilities');
});

export const addLiability = createAsyncThunk(
  'liabilities/addLiability', 
  async (liability: Omit<Liability, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newLiability: Liability = {
      ...liability,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };
    await sqliteService.add('liabilities', newLiability);
    return newLiability;
  }
);

export const updateLiability = createAsyncThunk('liabilities/updateLiability', async (liability: Liability) => {
  const updatedLiability: Liability = {
    ...liability,
    updatedAt: new Date().toISOString()
  };
  await sqliteService.update('liabilities', updatedLiability);
  return updatedLiability;
});

export const deleteLiability = createAsyncThunk('liabilities/deleteLiability', async (id: string) => {
  await sqliteService.remove('liabilities', id);
  return id;
});

// Slice
const liabilitiesSlice = createSlice({
  name: 'liabilities',
  initialState,
  reducers: {},
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
        state.status = 'loading';
      })
      .addCase(fetchLiabilities.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchLiabilities.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch liabilities';
      })
      
      // Add liability
      .addCase(addLiability.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      
      // Update liability
      .addCase(updateLiability.fulfilled, (state, action) => {
        const index = state.items.findIndex(liability => liability.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      
      // Delete liability
      .addCase(deleteLiability.fulfilled, (state, action) => {
        state.items = state.items.filter(liability => liability.id !== action.payload);
      });
  }
});

const liabilitiesReducer = liabilitiesSlice.reducer;
export default liabilitiesReducer;