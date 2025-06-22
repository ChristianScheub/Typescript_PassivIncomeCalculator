import { PortfolioHistoryStoreNames, PortfolioHistoryDB } from '../interfaces/IPortfolioHistoryService';
import { initPortfolioHistoryDatabase } from './initDatabase';

export const dbOperations = {
  async getAll<K extends PortfolioHistoryStoreNames>(storeName: K): Promise<PortfolioHistoryDB[K]['value'][]> {
    const db = await initPortfolioHistoryDatabase();
    return db.getAll(storeName as any);
  },

  async getById<K extends PortfolioHistoryStoreNames>(storeName: K, id: string): Promise<PortfolioHistoryDB[K]['value'] | undefined> {
    const db = await initPortfolioHistoryDatabase();
    return db.get(storeName as any, id);
  },

  async add<K extends PortfolioHistoryStoreNames>(storeName: K, item: PortfolioHistoryDB[K]['value']): Promise<void> {
    const db = await initPortfolioHistoryDatabase();
    await db.add(storeName as any, item);
  },

  async update<K extends PortfolioHistoryStoreNames>(storeName: K, item: PortfolioHistoryDB[K]['value']): Promise<void> {
    const db = await initPortfolioHistoryDatabase();
    await db.put(storeName as any, item);
  },

  async remove(storeName: PortfolioHistoryStoreNames, id: string): Promise<void> {
    const db = await initPortfolioHistoryDatabase();
    return db.delete(storeName as any, id);
  },

  // Bulk operations for performance
  async bulkAdd<K extends PortfolioHistoryStoreNames>(storeName: K, items: PortfolioHistoryDB[K]['value'][]): Promise<void> {
    const db = await initPortfolioHistoryDatabase();
    const tx = db.transaction(storeName as any, 'readwrite');
    const store = tx.objectStore(storeName as any);
    
    await Promise.all([
      ...items.map(item => store.add(item)),
      tx.done
    ]);
  },

  async bulkUpdate<K extends PortfolioHistoryStoreNames>(storeName: K, items: PortfolioHistoryDB[K]['value'][]): Promise<void> {
    const db = await initPortfolioHistoryDatabase();
    const tx = db.transaction(storeName as any, 'readwrite');
    const store = tx.objectStore(storeName as any);
    
    await Promise.all([
      ...items.map(item => store.put(item)),
      tx.done
    ]);
  },

  // Upsert operation (insert or update)
  async bulkUpsert<K extends PortfolioHistoryStoreNames>(storeName: K, items: PortfolioHistoryDB[K]['value'][]): Promise<void> {
    const db = await initPortfolioHistoryDatabase();
    const tx = db.transaction(storeName as any, 'readwrite');
    const store = tx.objectStore(storeName as any);
    
    // Use put() instead of add() to allow overwriting existing keys
    await Promise.all([
      ...items.map(item => store.put(item)),
      tx.done
    ]);
  },

  async clearStore(storeName: PortfolioHistoryStoreNames): Promise<void> {
    const db = await initPortfolioHistoryDatabase();
    return db.clear(storeName as any);
  },

  async count(storeName: PortfolioHistoryStoreNames): Promise<number> {
    const db = await initPortfolioHistoryDatabase();
    return db.count(storeName as any);
  }
};
