import { PortfolioHistoryStoreNames, PortfolioHistoryDB } from '../interfaces/IPortfolioHistoryService';
import { initPortfolioHistoryDatabase } from './initDatabase';
import Logger from '@/service/shared/logging/Logger/logger';

export const dbOperations = {
  async getAll<K extends PortfolioHistoryStoreNames>(storeName: K): Promise<PortfolioHistoryDB[K]['value'][]> {
    const db = await initPortfolioHistoryDatabase();
    return db.getAll(storeName as 'portfolioIntradayData' | 'portfolioHistory');
  },

  async getById<K extends PortfolioHistoryStoreNames>(storeName: K, id: string): Promise<PortfolioHistoryDB[K]['value'] | undefined> {
    const db = await initPortfolioHistoryDatabase();
    return db.get(storeName as 'portfolioIntradayData' | 'portfolioHistory', id);
  },

  async add<K extends PortfolioHistoryStoreNames>(storeName: K, item: PortfolioHistoryDB[K]['value']): Promise<void> {
    Logger.infoService(`DB ACTION: add to ${storeName} - ${JSON.stringify(item)}`);
    const db = await initPortfolioHistoryDatabase();
    await db.add(storeName as 'portfolioIntradayData' | 'portfolioHistory', item);
  },

  async update<K extends PortfolioHistoryStoreNames>(storeName: K, item: PortfolioHistoryDB[K]['value']): Promise<void> {
    Logger.infoService(`DB ACTION: update in ${storeName} - ${JSON.stringify(item)}`);
    const db = await initPortfolioHistoryDatabase();
    await db.put(storeName as 'portfolioIntradayData' | 'portfolioHistory', item);
  },

  async remove(storeName: PortfolioHistoryStoreNames, id: string): Promise<void> {
    const db = await initPortfolioHistoryDatabase();
    return db.delete(storeName as 'portfolioIntradayData' | 'portfolioHistory', id);
  },

  // Bulk operations for performance
  async bulkAdd<K extends PortfolioHistoryStoreNames>(storeName: K, items: PortfolioHistoryDB[K]['value'][]): Promise<void> {
    Logger.infoService(`DB ACTION: bulkAdd to ${storeName} - ${JSON.stringify(items)}`);
    const db = await initPortfolioHistoryDatabase();
    const tx = db.transaction(storeName as 'portfolioIntradayData' | 'portfolioHistory', 'readwrite');
    const store = tx.objectStore(storeName as 'portfolioIntradayData' | 'portfolioHistory');
    
    await Promise.all([
      ...items.map(item => store.add(item)),
      tx.done
    ]);
  },

  async bulkUpdate<K extends PortfolioHistoryStoreNames>(storeName: K, items: PortfolioHistoryDB[K]['value'][]): Promise<void> {
    Logger.infoService(`DB ACTION: bulkUpdate in ${storeName} - ${JSON.stringify(items)}`);
    const db = await initPortfolioHistoryDatabase();
    const tx = db.transaction(storeName as 'portfolioIntradayData' | 'portfolioHistory', 'readwrite');
    const store = tx.objectStore(storeName as 'portfolioIntradayData' | 'portfolioHistory');
    
    await Promise.all([
      ...items.map(item => store.put(item)),
      tx.done
    ]);
  },

  // Upsert operation (insert or update)
  async bulkUpsert<K extends PortfolioHistoryStoreNames>(storeName: K, items: PortfolioHistoryDB[K]['value'][]): Promise<void> {
    Logger.infoService(`DB ACTION: bulkUpsert in ${storeName} - ${JSON.stringify(items)}`);
    const db = await initPortfolioHistoryDatabase();
    const tx = db.transaction(storeName as 'portfolioIntradayData' | 'portfolioHistory', 'readwrite');
    const store = tx.objectStore(storeName as 'portfolioIntradayData' | 'portfolioHistory');
    
    // Use put() instead of add() to allow overwriting existing keys
    await Promise.all([
      ...items.map(item => store.put(item)),
      tx.done
    ]);
  },

  async clearStore(storeName: PortfolioHistoryStoreNames): Promise<void> {
    const db = await initPortfolioHistoryDatabase();
    return db.clear(storeName as 'portfolioIntradayData' | 'portfolioHistory');
  },

  async count(storeName: PortfolioHistoryStoreNames): Promise<number> {
    const db = await initPortfolioHistoryDatabase();
    return db.count(storeName as 'portfolioIntradayData' | 'portfolioHistory');
  }
};
