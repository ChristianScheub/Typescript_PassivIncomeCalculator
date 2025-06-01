import { openDB } from 'idb';
import { StoreNames, FinanceDB } from '../interfaces/ISQLiteService';
import Logger from '../../Logger/logger';

const DB_NAME = 'finance-tracker';
const DB_VERSION = 1;

export const initDatabase = async () => {
  return openDB<FinanceDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const assetStore = db.createObjectStore('assets', { keyPath: 'id' });
      assetStore.createIndex('by-type', 'type');

      db.createObjectStore('liabilities', { keyPath: 'id' });

      const expenseStore = db.createObjectStore('expenses', { keyPath: 'id' });
      expenseStore.createIndex('by-category', 'category');

      db.createObjectStore('income', { keyPath: 'id' });
    },
  });
};
