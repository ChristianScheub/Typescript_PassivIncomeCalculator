import { StoreNames } from '@/types/domains/database';
import { ISQLiteService, FinanceDB } from './interfaces/ISQLiteService';
import { dbOperations } from './methods/dbOperations';
import { importExportOperations } from './methods/importExportOperations';

const sqliteService: ISQLiteService = {
  // CRUD Operations
  getAll: async <K extends StoreNames>(storeName: K): Promise<FinanceDB[K]['value'][]> => {
    return dbOperations.getAll(storeName);
  },

  getById: async <K extends StoreNames>(storeName: K, id: string): Promise<FinanceDB[K]['value'] | undefined> => {
    return dbOperations.getById(storeName, id);
  },

  add: async <K extends StoreNames>(storeName: K, item: FinanceDB[K]['value']): Promise<string> => {
    return dbOperations.add(storeName, item);
  },

  update: async <K extends StoreNames>(storeName: K, item: FinanceDB[K]['value']): Promise<string> => {
    return dbOperations.update(storeName, item);
  },

  remove: async (storeName: StoreNames, id: string): Promise<void> => {
    return dbOperations.remove(storeName, id);
  },

  // Import/Export Operations
  exportData: async (storeNames?: StoreNames[]): Promise<string> => {
    return importExportOperations.exportData(storeNames);
  },

  importData: async (jsonData: string): Promise<void> => {
    return importExportOperations.importData(jsonData);
  }
};

export default sqliteService;
