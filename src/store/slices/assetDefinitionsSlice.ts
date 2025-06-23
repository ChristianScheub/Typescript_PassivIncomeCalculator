import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AssetDefinition } from '@/types/domains/assets/';
import Logger from '@service/shared/logging/Logger/logger';
import sqliteService from '@service/infrastructure/sqlLiteService';
import { deepCleanObject } from '@/utils/deepCleanObject';
import { RootState } from '../index';
import { createDividendApiHandler } from '@/service/domain/assets/market-data/dividendAPIService';
import { DividendHistoryEntry } from '@/types/domains/assets/dividends';
import { parseDividendHistoryFromApiResult } from '@/utils/parseDividendHistoryFromApiResult';
import type { DividendFrequency } from '@/types/shared/base/enums';

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

// Typ für Yahoo Dividend API Response
// interface YahooDividendApiResponse {
//   chart: {
//     result: [
//       {
//         events?: {
//           dividends?: {
//             [timestamp: string]: {
//               amount: number;
//               date: number;
//             };
//           };
//         };
//       }
//     ];
//   };
// }

// Async thunks
export const fetchAssetDefinitions = createAsyncThunk(
  'assetDefinitions/fetchAssetDefinitions',
  async () => {
    Logger.info('Fetching asset definitions from database');
    try {
      // Abrufen der Asset-Definitionen aus der Datenbank
      const definitions = await sqliteService.getAll('assetDefinitions');
      Logger.info(`Fetched ${definitions.length} asset definitions`);
      definitions.forEach(def => {
        if (def.dividendHistory) {
          Logger.info(`[DEBUG] Asset ${def.name} hat dividendHistory mit ${def.dividendHistory.length} Einträgen`);
        } else {
          Logger.info(`[DEBUG] Asset ${def.name} hat KEINE dividendHistory`);
        }
      });
      
      // Migration: dividendHistory immer setzen
      for (const def of definitions) {
        if (def.dividendHistory === undefined) {
          def.dividendHistory = [];
          Logger.info(`[MIGRATION] Setze dividendHistory für Asset ${def.name}`);
          await sqliteService.update('assetDefinitions', def);
        }
      }
      
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
        dividendHistory: assetDefinitionData.dividendHistory ?? [],
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
      Logger.info('[DEBUG] Vor DeepClean: ' + JSON.stringify(assetDefinition));
      // Aktualisierung des updatedAt-Feldes
      const updatedDefinition = {
        ...assetDefinition,
        dividendHistory: assetDefinition.dividendHistory ?? [],
        updatedAt: new Date().toISOString(),
      };
      Logger.info('[DEBUG] Nach updatedAt: ' + JSON.stringify(updatedDefinition));
      // Deep clean before DB update
      const cleanedDefinition = deepCleanObject(updatedDefinition);
      Logger.info('[DEBUG] Nach DeepClean: ' + JSON.stringify(cleanedDefinition));
      if (cleanedDefinition.dividendHistory) {
        Logger.info(`[DEBUG] Update: Asset ${cleanedDefinition.name} hat dividendHistory mit ${cleanedDefinition.dividendHistory.length} Einträgen`);
      } else {
        Logger.info(`[DEBUG] Update: Asset ${cleanedDefinition.name} hat KEINE dividendHistory`);
      }
      // Speichern der Aktualisierung in der Datenbank
      await sqliteService.update('assetDefinitions', cleanedDefinition);
      Logger.info(`Asset definition updated successfully: ${cleanedDefinition.name}`);
      return cleanedDefinition;
    } catch (error) {
      Logger.error(`Error updating asset definition in database: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`);
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

export const fetchAndUpdateDividends = createAsyncThunk(
  'assetDefinitions/fetchAndUpdateDividends',
  async (definition: AssetDefinition, { getState }) => {
    Logger.info('[fetchAndUpdateDividends] called for: ' + definition.fullName);
    const state = getState() as RootState;
    const provider = state.dividendApiConfig.selectedProvider;
    Logger.info(`[fetchAndUpdateDividends] using provider: ${provider}`);
    let handler;
    try {
      handler = createDividendApiHandler(provider);
      Logger.info('[fetchAndUpdateDividends] handler created');
    } catch (err) {
      Logger.error('[fetchAndUpdateDividends] Error creating handler: ' + JSON.stringify(err));
      throw err;
    }
    if (!definition.ticker) throw new Error('Kein Ticker für Asset vorhanden');
    let result: any;
    try {
      Logger.info('[fetchAndUpdateDividends] about to call fetchDividends');
      result = await handler.fetchDividends(definition.ticker, { interval: '1d', range: '2y' });
      Logger.info('[fetchAndUpdateDividends] fetchDividends finished');
    } catch (err) {
      Logger.error('[fetchAndUpdateDividends] Error in fetchDividends: ' + JSON.stringify(err));
      throw err;
    }

    // Mapping ausgelagert
    const currency = definition.currency || undefined;
    let dividendHistory: DividendHistoryEntry[] = parseDividendHistoryFromApiResult(result, currency);
    Logger.info('[DEBUG] Parsed dividendHistory (unified): ' + JSON.stringify(dividendHistory));
    dividendHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Frequency und paymentMonths ableiten
    let frequency: DividendFrequency | undefined = undefined;
    let paymentMonths: number[] | undefined = undefined;
    if (dividendHistory.length > 1) {
      const months = dividendHistory.map(d => new Date(d.date).getMonth() + 1); // 1-based
      paymentMonths = Array.from(new Set(months)).sort((a, b) => a - b);
      const intervals = dividendHistory.slice(1).map((d, i) =>
        (new Date(d.date).getTime() - new Date(dividendHistory[i].date).getTime()) / (1000 * 60 * 60 * 24)
      );
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      if (avgInterval < 40) frequency = 'monthly';
      else if (avgInterval < 100) frequency = 'quarterly';
      else if (avgInterval < 200) frequency = 'annually';
      else frequency = 'custom';
    }

    const last = dividendHistory.length > 0 ? dividendHistory[dividendHistory.length - 1] : undefined;
    const updatedDefinition = {
      ...definition,
      dividendInfo: last
        ? {
            amount: last.amount,
            frequency,
            lastDividendDate: last.date,
            paymentMonths,
          }
        : undefined,
      dividendHistory,
    };
    Logger.info('[DEBUG] updatedDefinition before return: ' + JSON.stringify(updatedDefinition));
    return updatedDefinition;
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
