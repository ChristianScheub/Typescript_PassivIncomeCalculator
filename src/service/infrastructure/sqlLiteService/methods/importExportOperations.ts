import { StoreNames } from '../interfaces/ISQLiteService';
import { dbOperations } from './dbOperations';
import Logger from "@/service/shared/logging/Logger/logger";
import { ExportData } from '@/types/domains/database/import-export';

const SUPPORTED_STORES: StoreNames[] = [
  'transactions',
  'assetDefinitions',
  'assetCategories',
  'assetCategoryOptions',
  'assetCategoryAssignments',
  'liabilities',
  'expenses',
  'income',
  'exchangeRates'
];

const validatePartialData = (data: unknown): void => {
  if (!data || typeof data !== 'object') {
    Logger.error('Invalid data structure - not an object');
    throw new Error('Invalid backup file format: not an object');
  }
  const exportData = data as Record<string, unknown>;
  const found = SUPPORTED_STORES.some(store => Array.isArray(exportData[store]));
  if (!found) {
    Logger.error('No supported data arrays found in import');
    throw new Error('Invalid backup file: No supported data arrays found');
  }
  // Optional: Warnung für Stores, die keine Arrays sind, aber vorhanden
  SUPPORTED_STORES.forEach(store => {
    if (exportData[store] !== undefined && !Array.isArray(exportData[store])) {
      Logger.warn(`${store} exists but is not an array, skipping`);
    }
  });
};

// Type imports for each store
import type { Transaction, AssetDefinition, AssetCategory, AssetCategoryOption, AssetCategoryAssignment } from '@/types/domains/assets';
import type { Liability, Expense, Income } from '@/types/domains/financial';
import type { ExchangeRate } from '@/types/domains/financial/calculations';

// Helper: Cast item to correct type for each store
function castItemForStore(storeName: StoreNames, item: unknown):
  Transaction | AssetDefinition | AssetCategory | AssetCategoryOption | AssetCategoryAssignment | Liability | Expense | Income | ExchangeRate {
  switch (storeName) {
    case 'transactions':
      return item as Transaction;
    case 'assetDefinitions':
      return item as AssetDefinition;
    case 'assetCategories':
      return item as AssetCategory;
    case 'assetCategoryOptions':
      return item as AssetCategoryOption;
    case 'assetCategoryAssignments':
      return item as AssetCategoryAssignment;
    case 'liabilities':
      return item as Liability;
    case 'expenses':
      return item as Expense;
    case 'income':
      return item as Income;
    case 'exchangeRates':
      return item as ExchangeRate;
    default:
      throw new Error(`Unsupported store: ${storeName}`);
  }
}

// Importiert alle Stores, die im JSON als Array vorhanden sind
const importAnyStores = async (data: ExportData): Promise<void> => {
  for (const storeName of SUPPORTED_STORES) {
    const storeData = data[storeName];
    if (storeData && Array.isArray(storeData)) {
      Logger.infoService(`Importing ${storeData.length} ${storeName}`);
      for (const item of storeData) {
        await dbOperations.update(storeName, castItemForStore(storeName, item));
      }
      Logger.infoService(`${storeName} import completed successfully`);
    }
  }
};

export const importExportOperations = {
  // Exportiert alle oder nur ausgewählte Stores
  async exportData(storeNames?: StoreNames[]): Promise<string> {
    const stores = storeNames && storeNames.length > 0 ? storeNames : SUPPORTED_STORES;
    // Typ erweitern, damit Metadaten erlaubt sind
    const data: Partial<Record<StoreNames, unknown[]>> & { exportDate?: string; version?: string } = {};
    for (const store of stores) {
      data[store] = await dbOperations.getAll(store);
    }
    data.exportDate = new Date().toISOString();
    data.version = '3.1.0';
    // Refactored: Avoid nested template literals for export summary
    const storeSummaries = stores.map(s => {
      const count = Array.isArray(data[s]) ? data[s].length : 0;
      return count + ' ' + s;
    });
    Logger.infoService('Exporting backup: ' + storeSummaries.join(', '));
    return JSON.stringify(data, null, 2);
  },

  // Neue Validierung für Teilmengen
  validateData(data: unknown): void {
    validatePartialData(data);
  },

  // Importiert beliebige Teilmengen
  async importData(jsonData: string): Promise<void> {
    try {
      Logger.infoService('Starting data import process');
      const parsedData = JSON.parse(jsonData);
      this.validateData(parsedData);
      const data = parsedData as ExportData;
      Logger.infoService('Importing stores: ' + SUPPORTED_STORES.filter(s => Array.isArray(data[s])).join(', '));
      await importAnyStores(data);
      Logger.infoService('Data import completed successfully');
    } catch (error) {
      Logger.errorStack('Import error details', error as Error);
      if (error instanceof SyntaxError) {
        throw new Error('Invalid JSON file format. Please check your backup file.');
      }
      throw error instanceof Error ? error : new Error();
    }
  }
};
