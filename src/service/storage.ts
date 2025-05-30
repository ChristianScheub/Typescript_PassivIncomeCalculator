import { openDB, DBSchema } from 'idb';
import { Asset, Liability, Expense, Income } from '../types';
import Logger from './Logger/logger';

interface FinanceDB extends DBSchema {
  assets: {
    key: string;
    value: Asset;
    indexes: { 'by-type': string };
  };
  liabilities: {
    key: string;
    value: Liability;
  };
  expenses: {
    key: string;
    value: Expense;
    indexes: { 'by-category': string };
  };
  income: {
    key: string;
    value: Income;
  };
}

const DB_NAME = 'finance-tracker';
const DB_VERSION = 1;

async function initDatabase() {
  return openDB<FinanceDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Assets store
      const assetStore = db.createObjectStore('assets', { keyPath: 'id' });
      assetStore.createIndex('by-type', 'type');

      // Liabilities store
      db.createObjectStore('liabilities', { keyPath: 'id' });

      // Expenses store
      const expenseStore = db.createObjectStore('expenses', { keyPath: 'id' });
      expenseStore.createIndex('by-category', 'category');

      // Income store
      db.createObjectStore('income', { keyPath: 'id' });
    },
  });
}

type StoreNames = 'assets' | 'liabilities' | 'expenses' | 'income';

// Generic CRUD operations with proper typing using the FinanceDB schema
export async function getAll<K extends StoreNames>(storeName: K): Promise<FinanceDB[K]['value'][]> {
  const db = await initDatabase();
  return db.getAll(storeName);
}

export async function getById<K extends StoreNames>(storeName: K, id: string): Promise<FinanceDB[K]['value'] | undefined> {
  const db = await initDatabase();
  return db.get(storeName, id);
}

export async function add<K extends StoreNames>(storeName: K, item: FinanceDB[K]['value']): Promise<string> {
  const db = await initDatabase();
  return db.add(storeName, item);
}

export async function update<K extends StoreNames>(storeName: K, item: FinanceDB[K]['value']): Promise<string> {
  const db = await initDatabase();
  return db.put(storeName, item);
}

export async function remove(storeName: StoreNames, id: string): Promise<void> {
  const db = await initDatabase();
  return db.delete(storeName, id);
}

// Export backup
export async function exportData(): Promise<string> {
  const assets = await getAll('assets');
  const liabilities = await getAll('liabilities');
  const expenses = await getAll('expenses');
  const income = await getAll('income');

  const data = {
    assets,
    liabilities,
    expenses,
    income,
    exportDate: new Date().toISOString(),
  };

  return JSON.stringify(data, null, 2);
}

// Import backup
export async function importData(jsonData: string): Promise<void> {
  try {
    Logger.info('Starting data import process');
    const data = JSON.parse(jsonData);
    
    // Validate data structure
    if (!data || typeof data !== 'object') {
      Logger.error('Invalid data structure - not an object');
      throw new Error('Invalid backup file format: not an object');
    }

    // Check if required arrays exist and are arrays
    const requiredArrays = ['assets', 'liabilities', 'expenses', 'income'];
    for (const arrayName of requiredArrays) {
      if (!Array.isArray(data[arrayName])) {
        Logger.error(`Invalid data structure - ${arrayName} is not an array or missing`);
        throw new Error(`Invalid backup file format: ${arrayName} is not an array or missing`);
      }
    }

    Logger.info(`Data validation passed - Assets: ${data.assets.length}, Liabilities: ${data.liabilities.length}, Expenses: ${data.expenses.length}, Income: ${data.income.length}`);

    const db = await initDatabase();
    Logger.info('Database initialized for import');

    // Clear existing data with individual transactions
    try {
      Logger.info('Starting to clear existing data');
      
      const stores: StoreNames[] = ['assets', 'liabilities', 'expenses', 'income'];
      for (const storeName of stores) {
        Logger.info(`Clearing existing ${storeName}`);
        const tx = db.transaction(storeName, 'readwrite');
        await tx.store.clear();
        await tx.done;
        Logger.info(`${storeName} cleared successfully`);
      }

      Logger.info('All existing data cleared successfully');
    } catch (error) {
      Logger.error(`Failed to clear existing data: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Failed to clear existing data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Import new data with error handling for each category
    const categories: Array<{ name: StoreNames; data: any[] }> = [
      { name: 'assets', data: data.assets },
      { name: 'liabilities', data: data.liabilities },
      { name: 'expenses', data: data.expenses },
      { name: 'income', data: data.income }
    ];

    for (const category of categories) {
      try {
        Logger.info(`Importing ${category.data.length} ${category.name}`);
        const tx = db.transaction(category.name, 'readwrite');
        
        for (let i = 0; i < category.data.length; i++) {
          const item = category.data[i];
          try {
            // Validate item structure
            if (!item.id || !item.name) {
              Logger.error(`Invalid ${category.name} item ${i + 1}: missing id or name - ${JSON.stringify(item)}`);
              throw new Error(`Invalid ${category.name} item: missing required fields`);
            }

            await tx.store.put(item); // Always use put to handle both add and update
            Logger.info(`Imported ${category.name} ${i + 1}/${category.data.length}: ${item.name || 'Unknown'}`);
          } catch (itemError) {
            Logger.error(`Failed to import ${category.name} item ${i + 1}: ${itemError instanceof Error ? itemError.message : String(itemError)}`);
            throw new Error(`Failed to import ${category.name} item ${i + 1}: ${itemError instanceof Error ? itemError.message : 'Unknown error'}`);
          }
        }
        
        await tx.done;
        Logger.info(`${category.name} import completed successfully`);
      } catch (categoryError) {
        Logger.error(`${category.name} import failed: ${categoryError instanceof Error ? categoryError.message : String(categoryError)}`);
        throw new Error(`Failed to import ${category.name}: ${categoryError instanceof Error ? categoryError.message : 'Unknown error'}`);
      }
    }

    Logger.info('Data import completed successfully');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    Logger.error(`Import failed: ${errorMessage}`);
    
    // If it's a JSON parse error, provide more helpful message
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON file format. Please check your backup file.');
    }
    
    // Re-throw the error with proper message
    throw error instanceof Error ? error : new Error(errorMessage);
  }
}