import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AssetDefinition } from '../../types/domains/assets/';
import Logger from '@service/shared/logging/Logger/logger';
import sqliteService from '@service/infrastructure/sqlLiteService';

interface AssetDefinitionsState {
  items: AssetDefinition[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AssetDefinitionsState = {
  items: [],
  status: 'idle',
  error: null,
};

// Async thunks
export const fetchAssetDefinitions = createAsyncThunk(
  'assetDefinitions/fetchAssetDefinitions',
  async () => {
    Logger.info('Fetching asset definitions from database');
    try {
      // Abrufen der Asset-Definitionen aus der Datenbank
      const definitions = await sqliteService.getAll('assetDefinitions');
      Logger.info(`Fetched ${definitions.length} asset definitions`);
      return definitions;
    } catch (error) {
      Logger.error(`Error fetching asset definitions: ${error}`);
      return [];
    }
  }
);

export const addAssetDefinition = createAsyncThunk(
  'assetDefinitions/addAssetDefinition',
  async (assetDefinitionData: Omit<AssetDefinition, 'id' | 'createdAt' | 'updatedAt'>) => {
    Logger.info(`Adding asset definition to database: ${assetDefinitionData.name}`);
    
    try {
      // Erstellen einer neuen Asset-Definition mit ID und Zeitstempeln
      const newAssetDefinition: AssetDefinition = {
        ...assetDefinitionData,
        id: Date.now().toString(), // Temporäre ID, wird von der Datenbank überschrieben
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Speichern in der Datenbank
      const savedId = await sqliteService.add('assetDefinitions', newAssetDefinition);
      const savedDefinition = { ...newAssetDefinition, id: savedId };
      Logger.info(`Asset definition saved successfully: ${savedDefinition.name}`);
      return savedDefinition;
    } catch (error) {
      Logger.error(`Error saving asset definition to database: ${error}`);
      throw error;
    }
  }
);

export const updateAssetDefinition = createAsyncThunk(
  'assetDefinitions/updateAssetDefinition',
  async (assetDefinition: AssetDefinition) => {
    Logger.info(`Updating asset definition in database: ${assetDefinition.name}`);
    
    try {
      // Aktualisierung des updatedAt-Feldes
      const updatedDefinition = {
        ...assetDefinition,
        updatedAt: new Date().toISOString(),
      };
      
      // Speichern der Aktualisierung in der Datenbank
      await sqliteService.update('assetDefinitions', updatedDefinition);
      Logger.info(`Asset definition updated successfully: ${updatedDefinition.name}`);
      return updatedDefinition;
    } catch (error) {
      Logger.error(`Error updating asset definition in database: ${error}`);
      throw error;
    }
  }
);

export const deleteAssetDefinition = createAsyncThunk(
  'assetDefinitions/deleteAssetDefinition',
  async (id: string) => {
    Logger.info(`Deleting asset definition from database: ${id}`);
    
    try {
      // Löschen aus der Datenbank
      await sqliteService.remove('assetDefinitions', id);
      Logger.info(`Asset definition deleted successfully: ${id}`);
      return id;
    } catch (error) {
      Logger.error(`Error deleting asset definition from database: ${error}`);
      throw error;
    }
  }
);

const assetDefinitionsSlice = createSlice({
  name: 'assetDefinitions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch asset definitions
      .addCase(fetchAssetDefinitions.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAssetDefinitions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchAssetDefinitions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch asset definitions';
      })
      
      // Add asset definition
      .addCase(addAssetDefinition.fulfilled, (state, action) => {
        state.items.push(action.payload);
        Logger.cache(`Asset definition added: ${action.payload.name}, invalidating portfolio cache`);
      })
      
      // Update asset definition
      .addCase(updateAssetDefinition.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
          Logger.cache(`Asset definition updated: ${action.payload.name}, invalidating portfolio cache`);
        }
      })
      
      // Delete asset definition
      .addCase(deleteAssetDefinition.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
        Logger.cache(`Asset definition deleted: ${action.payload}, invalidating portfolio cache`);
      });
  },
});

export default assetDefinitionsSlice.reducer;
