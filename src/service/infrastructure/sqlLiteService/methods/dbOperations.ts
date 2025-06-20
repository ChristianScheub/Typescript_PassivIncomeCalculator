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
    return db.put(storeName, item);
  },

  async remove(storeName: StoreNames, id: string): Promise<void> {
    const db = await initDatabase();
    return db.delete(storeName, id);
  }
};
