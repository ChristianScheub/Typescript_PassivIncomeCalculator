import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AssetDefinition } from '@/types/domains/assets/';
import Logger from '@service/shared/logging/Logger/logger';
import sqliteService from '@service/infrastructure/sqlLiteService';
import { deepCleanObject } from '@/utils/deepCleanObject';
import { DividendHistoryEntry } from '@/types/domains/assets/dividends';
import { parseDividendHistoryFromApiResult } from '@/utils/parseDividendHistoryFromApiResult';
import type { DividendFrequency } from '@/types/shared/base/enums';
import dividendApiService from '@/service/domain/assets/market-data/dividendAPIService';
import type { DividendData } from '@/service/domain/assets/market-data/dividendAPIService';
import { StandardCrudState, createSliceLogger, standardReducerPatterns } from '../../common/slicePatterns';

// Using standardized CRUD state interface
type AssetDefinitionsState = StandardCrudState<AssetDefinition>;

// Create logger for this slice
const logger = createSliceLogger('AssetDefinitions');

const initialState: AssetDefinitionsState = {
  items: [],
  status: 'idle',
  error: null,
};

// Async thunks
export const fetchAssetDefinitions = createAsyncThunk(
  'assetDefinitions/fetchAssetDefinitions',
  async () => {
    Logger.infoRedux(logger.startOperation('fetch'));
    try {
      // Abrufen der Asset-Definitionen aus der Datenbank
      const definitions = await sqliteService.getAll('assetDefinitions');
      Logger.infoRedux(logger.completeOperation('fetch', `${definitions.length} asset definitions`));
      definitions.forEach(def => {
        const defName = def.name || def.fullName || 'Unnamed Asset';
        if (def.dividendHistory) {
          Logger.info(`[DEBUG] Asset ${defName} hat dividendHistory mit ${def.dividendHistory.length} Einträgen`);
        } else {
          Logger.info(`[DEBUG] Asset ${defName} hat KEINE dividendHistory`);
        }
      });
      
      // Migration: dividendHistory immer setzen und name field sicherstellen
      for (const def of definitions) {
        let needsUpdate = false;
        
        if (def.dividendHistory === undefined) {
          def.dividendHistory = [];
          const defName = def.name || def.fullName || 'Unnamed Asset';
          Logger.info(`[MIGRATION] Setze dividendHistory für Asset ${defName}`);
          needsUpdate = true;
        }
        
        // Ensure name field is always set
        if (!def.name && def.fullName) {
          def.name = def.fullName;
          Logger.info(`[MIGRATION] Setze name field von fullName für Asset ${def.fullName}`);
          needsUpdate = true;
        } else if (!def.name && !def.fullName) {
          def.name = 'Unnamed Asset';
          def.fullName = 'Unnamed Asset';
          Logger.info(`[MIGRATION] Setze Standard-Name für Asset ohne Namen`);
          needsUpdate = true;
        }
        
        if (needsUpdate) {
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
    Logger.infoRedux(logger.startOperation('add', `asset definition: ${assetDefinitionData.name || assetDefinitionData.fullName || 'Unnamed Asset'}`));
    try {
      // Ensure name field is always set
      const safeAssetDefinitionData = {
        ...assetDefinitionData,
        name: assetDefinitionData.name || assetDefinitionData.fullName || 'Unnamed Asset',
        sectors: Array.isArray(assetDefinitionData.sectors) ? assetDefinitionData.sectors : [],
      };
      // Erstellen einer neuen Asset-Definition mit ID und Zeitstempeln
      const newAssetDefinition: AssetDefinition = {
        ...safeAssetDefinitionData,
        dividendHistory: assetDefinitionData.dividendHistory ?? [],
        id: Date.now().toString(), // Temporäre ID, wird von der Datenbank überschrieben
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      // Speichern in der Datenbank
      const savedId = await sqliteService.add('assetDefinitions', newAssetDefinition);
      const savedDefinition = { ...newAssetDefinition, id: savedId };
      Logger.infoRedux(logger.completeOperation('add', `asset definition: ${savedDefinition.name || savedDefinition.fullName || 'Unnamed Asset'}`));
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
    Logger.info(`Updating asset definition in database: ${assetDefinition.name || assetDefinition.fullName || 'Unnamed Asset'}`);
    try {
      Logger.info('[DEBUG] Vor DeepClean: ' + JSON.stringify(assetDefinition));
      // Ensure name field and sectors are always set
      const safeAssetDefinition = {
        ...assetDefinition,
        name: assetDefinition.name || assetDefinition.fullName || 'Unnamed Asset',
        sectors: Array.isArray(assetDefinition.sectors) ? assetDefinition.sectors : [],
      };
      // Aktualisierung des updatedAt-Feldes
      const updatedDefinition = {
        ...safeAssetDefinition,
        dividendHistory: assetDefinition.dividendHistory ?? [],
        updatedAt: new Date().toISOString(),
      };
      Logger.info('[DEBUG] Nach updatedAt: ' + JSON.stringify(updatedDefinition));
      // Deep clean before DB update
      const cleanedDefinition = deepCleanObject(updatedDefinition);
      Logger.info('[DEBUG] Nach DeepClean: ' + JSON.stringify(cleanedDefinition));
      if (cleanedDefinition.dividendHistory) {
        const defName = cleanedDefinition.name || cleanedDefinition.fullName || 'Unnamed Asset';
        Logger.info(`[DEBUG] Update: Asset ${defName} hat dividendHistory mit ${cleanedDefinition.dividendHistory.length} Einträgen`);
      } else {
        const defName = cleanedDefinition.name || cleanedDefinition.fullName || 'Unnamed Asset';
        Logger.info(`[DEBUG] Update: Asset ${defName} hat KEINE dividendHistory`);
      }
      // Speichern der Aktualisierung in der Datenbank
      await sqliteService.update('assetDefinitions', cleanedDefinition);
      Logger.info(`Asset definition updated successfully: ${cleanedDefinition.name || cleanedDefinition.fullName || 'Unnamed Asset'}`);
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
  async (definition: AssetDefinition) => {
    Logger.info('[fetchAndUpdateDividends] called for: ' + definition.fullName);
    if (!definition.ticker) throw new Error('Kein Ticker für Asset vorhanden');
    let result: { dividends: DividendData[] };
    try {
      Logger.info('[fetchAndUpdateDividends] about to call fetchDividends');
      result = await dividendApiService.fetchDividends(definition.ticker, { interval: '1d', range: '2y' });
      Logger.info('[fetchAndUpdateDividends] fetchDividends finished');
    } catch (err) {
      Logger.error('[fetchAndUpdateDividends] Error in fetchDividends: ' + JSON.stringify(err));
      throw err;
    }

    let dividendHistory: DividendHistoryEntry[] = [];
    const currency = definition.currency || undefined;
    // Robust handling: if result.dividends is an array, map directly; else, use parser for raw API result
    if (Array.isArray(result?.dividends)) {
      dividendHistory = result.dividends
        .filter((div: DividendData) => div.amount != null && (div.lastDividendDate))
        .map((div: DividendData) => ({
          date: div.lastDividendDate
            ? new Date(div.lastDividendDate).toISOString()
            : '',
          amount: div.amount,
          source: 'api',
          currency,
        }))
        .filter((entry: DividendHistoryEntry) => !!entry.date && entry.amount != null);
    } else {
      dividendHistory = parseDividendHistoryFromApiResult(result, currency);
    }
    Logger.info('[DEBUG] Parsed dividendHistory (unified): ' + JSON.stringify(dividendHistory));
    dividendHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Frequency und paymentMonths ableiten
    let frequency: DividendFrequency | undefined = undefined;
    let paymentMonths: number[] | undefined = undefined;
    if (dividendHistory.length > 1) {
      const months = dividendHistory.map(d => new Date(d.date).getMonth() + 1); // 1-based
      paymentMonths = Array.from(new Set(months)).sort((a, b) => a - b);
    }
    // Frequency direkt aus dem API-Result übernehmen, falls vorhanden
    if (dividendHistory.length > 0 && result.dividends?.[0]?.frequency) {
      frequency = result.dividends[0].frequency;
    }

    // --- NEU: Dividend Growth & Forecast berechnen ---
    // 1. Wachstum der letzten 3 Jahre
    const { calculateDividendCAGRForYears, generateDividendForecast } = await import('@/utils/dividendHistoryUtils');
    const dividendGrowthPast3Y = calculateDividendCAGRForYears(dividendHistory, 3) ?? 0;
    // 2. Prognose für die nächsten 3 Jahre
    const dividendForecast3Y = generateDividendForecast(dividendHistory, 3);
    // ---

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
      dividendGrowthPast3Y,
      dividendForecast3Y,
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
      .addCase(fetchAssetDefinitions.pending, standardReducerPatterns.pending)
      .addCase(fetchAssetDefinitions.fulfilled, (state, action) => {
        standardReducerPatterns.fulfilled(state);
        state.items = action.payload.slice().sort((a, b) => {
          // Defensive sorting: Use fullName as fallback if name is undefined/null
          const nameA = a.name || a.fullName || '';
          const nameB = b.name || b.fullName || '';
          return nameA.localeCompare(nameB);
        });
      })
      .addCase(fetchAssetDefinitions.rejected, (state, action) => {
        const errorMsg = action.error.message || 'Failed to fetch asset definitions';
        Logger.infoRedux(logger.failOperation('fetch', errorMsg));
        standardReducerPatterns.rejected(state, errorMsg);
      })
      
      // Add asset definition
      .addCase(addAssetDefinition.pending, standardReducerPatterns.pending)
      .addCase(addAssetDefinition.fulfilled, (state, action) => {
        standardReducerPatterns.fulfilled(state);
        state.items.push(action.payload);
        Logger.cache(`Asset definition added: ${action.payload.name || action.payload.fullName || 'Unnamed Asset'}, invalidating portfolio cache`);
      })
      .addCase(addAssetDefinition.rejected, (state, action) => {
        const errorMsg = action.error.message || 'Failed to add asset definition';
        Logger.infoRedux(logger.failOperation('add', errorMsg));
        standardReducerPatterns.rejected(state, errorMsg);
      })
      
      // Update asset definition
      .addCase(updateAssetDefinition.pending, standardReducerPatterns.pending)
      .addCase(updateAssetDefinition.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
          Logger.cache(`Asset definition updated: ${action.payload.name}, invalidating portfolio cache`);
        }
        standardReducerPatterns.fulfilled(state);
      })
      .addCase(updateAssetDefinition.rejected, (state, action) => {
        const errorMsg = action.error.message || 'Failed to update asset definition';
        Logger.infoRedux(logger.failOperation('update', errorMsg));
        standardReducerPatterns.rejected(state, errorMsg);
      })
      
      // Delete asset definition
      .addCase(deleteAssetDefinition.pending, standardReducerPatterns.pending)
      .addCase(deleteAssetDefinition.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
        Logger.cache(`Asset definition deleted: ${action.payload}, invalidating portfolio cache`);
        standardReducerPatterns.fulfilled(state);
      })
      .addCase(deleteAssetDefinition.rejected, (state, action) => {
        const errorMsg = action.error.message || 'Failed to delete asset definition';
        Logger.infoRedux(logger.failOperation('delete', errorMsg));
        standardReducerPatterns.rejected(state, errorMsg);
      });
  },
});

export default assetDefinitionsSlice.reducer;
