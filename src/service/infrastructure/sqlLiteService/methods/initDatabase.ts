import { openDB } from 'idb';
import { FinanceDB } from '../interfaces/ISQLiteService';

// Import for development debugging
import '../utils/clearDatabase';

const DB_NAME = 'finance-tracker';
const DB_VERSION = 6;

export const initDatabase = async () => {
  return openDB<FinanceDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion) {
      console.log(`Database upgrade: ${oldVersion} → ${newVersion}`);
      
      // Create original stores for version 1
      if (oldVersion < 1) {
        console.log('Creating base stores for version 1');
        const transactionStore = db.createObjectStore('transactions', { keyPath: 'id' });
        transactionStore.createIndex('by-type', 'type');

        db.createObjectStore('liabilities', { keyPath: 'id' });

        const expenseStore = db.createObjectStore('expenses', { keyPath: 'id' });
        expenseStore.createIndex('by-category', 'category');

        db.createObjectStore('income', { keyPath: 'id' });
      }

      // Add exchange rates store for version 2
      if (oldVersion < 2 && !db.objectStoreNames.contains('exchangeRates')) {
        console.log('Adding exchange rates store for version 2');
        const exchangeRateStore = db.createObjectStore('exchangeRates', { keyPath: 'id', autoIncrement: true });
        exchangeRateStore.createIndex('by-date', 'date', { unique: true });
      }

      // Add asset definitions store for version 3
      if (oldVersion < 3 && !db.objectStoreNames.contains('assetDefinitions')) {
        console.log('Adding asset definitions store for version 3');
        const assetDefinitionStore = db.createObjectStore('assetDefinitions', { keyPath: 'id' });
        assetDefinitionStore.createIndex('by-type', 'type');
      }

      // Add asset category stores for version 4
      if (oldVersion < 4) {
        console.log('Adding asset category stores for version 4');
        
        if (!db.objectStoreNames.contains('assetCategories')) {
          const assetCategoryStore = db.createObjectStore('assetCategories', { keyPath: 'id' });
          assetCategoryStore.createIndex('by-name', 'name');
        }

        if (!db.objectStoreNames.contains('assetCategoryOptions')) {
          const assetCategoryOptionStore = db.createObjectStore('assetCategoryOptions', { keyPath: 'id' });
          assetCategoryOptionStore.createIndex('by-category', 'categoryId');
          assetCategoryOptionStore.createIndex('by-name', 'name');
        }

        if (!db.objectStoreNames.contains('assetCategoryAssignments')) {
          const assetCategoryAssignmentStore = db.createObjectStore('assetCategoryAssignments', { keyPath: 'id' });
          assetCategoryAssignmentStore.createIndex('by-asset', 'assetDefinitionId');
          assetCategoryAssignmentStore.createIndex('by-category', 'categoryId');
        }
      }

      // Clean architecture migration for version 6
      if (oldVersion < 6) {
        console.log('Clean architecture migration for version 6');
        
        // Ensure transactions store exists with proper structure
        if (!db.objectStoreNames.contains('transactions')) {
          console.log('Creating transactions store');
          const transactionStore = db.createObjectStore('transactions', { keyPath: 'id' });
          transactionStore.createIndex('by-type', 'type');
        }
      }
      
      console.log('Database upgrade completed successfully');
    },
  });
};
