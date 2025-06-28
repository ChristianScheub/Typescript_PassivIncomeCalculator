import { StoreNames, FinanceDB } from '../interfaces/ISQLiteService';
import { initDatabase } from './initDatabase';

export const dbOperations = {
  async getAll<K extends StoreNames>(storeName: K): Promise<FinanceDB[K]['value'][]> {
    const db = await initDatabase();
    return db.getAll(storeName);
  },

  async getById<K extends StoreNames>(storeName: K, id: string): Promise<FinanceDB[K]['value'] | undefined> {
    const db = await initDatabase();
    return db.get(storeName, id);
  },

  async add<K extends StoreNames>(storeName: K, item: FinanceDB[K]['value']): Promise<string> {
    const db = await initDatabase();
    return db.add(storeName, item);
  },

  async update<K extends StoreNames>(storeName: K, item: FinanceDB[K]['value']): Promise<string> {
    const db = await initDatabase();
    try {
      // Log the item and its keys before update
      // eslint-disable-next-line no-console
      console.log('[DB UPDATE] Store:', storeName, 'Item:', item, 'Keys:', Object.keys(item));
      const result = await db.put(storeName, item);
      // eslint-disable-next-line no-console
      console.log('[DB UPDATE] Success:', result);
      return result;
    } catch (error) {
      // Log full error object and all properties
      // eslint-disable-next-line no-console
      let errorString = '';
      if (typeof error === 'object' && error !== null) {
        try {
          errorString = JSON.stringify(error);
        } catch {
          errorString = error?.toString ? error.toString() : String(error);
        }
      } else {
        errorString = String(error);
      }
      console.error('[DB UPDATE ERROR]', {
        error,
        errorString,
        errorJSON: (() => { try { return JSON.stringify(error); } catch { return undefined; } })(),
        errorStack: (error as any)?.stack,
        errorKeys: (typeof error === 'object' && error !== null) ? Object.keys(error) : undefined,
        item,
        itemKeys: Object.keys(item),
        storeName
      });
      throw error;
    }
  },

  async remove(storeName: StoreNames, id: string): Promise<void> {
    const db = await initDatabase();
    return db.delete(storeName, id);
  }
};
