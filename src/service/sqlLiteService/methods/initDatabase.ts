import { openDB } from 'idb';
import { FinanceDB } from '../interfaces/ISQLiteService';

const DB_NAME = 'finance-tracker';
const DB_VERSION = 2;

export const initDatabase = async () => {
  return openDB<FinanceDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      // Create original stores for version 1
      if (oldVersion < 1) {
        const assetStore = db.createObjectStore('assets', { keyPath: 'id' });
        assetStore.createIndex('by-type', 'type');

        db.createObjectStore('liabilities', { keyPath: 'id' });

        const expenseStore = db.createObjectStore('expenses', { keyPath: 'id' });
        expenseStore.createIndex('by-category', 'category');

        db.createObjectStore('income', { keyPath: 'id' });
      }

      // Add exchange rates store for version 2
      if (oldVersion < 2) {
        const exchangeRateStore = db.createObjectStore('exchangeRates', { keyPath: 'id', autoIncrement: true });
        exchangeRateStore.createIndex('by-date', 'date', { unique: true });
      }
    },
  });
};
