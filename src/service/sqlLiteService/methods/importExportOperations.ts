import { StoreNames } from '../interfaces/ISQLiteService';
import { dbOperations } from './dbOperations';
import Logger from '../../Logger/logger';

interface ImportDataFlags {
  isV2Format: boolean;
  hasAssetDefinitions: boolean;
  hasAssetCategories: boolean;
  hasAssetCategoryOptions: boolean;
  hasAssetCategoryAssignments: boolean;
  hasExchangeRates: boolean;
}

// Helper function to determine import data flags
const getImportDataFlags = (data: any): ImportDataFlags => ({
  isV2Format: data.version?.startsWith('2.') ?? false,
  hasAssetDefinitions: Array.isArray(data.assetDefinitions),
  hasAssetCategories: Array.isArray(data.assetCategories),
  hasAssetCategoryOptions: Array.isArray(data.assetCategoryOptions),
  hasAssetCategoryAssignments: Array.isArray(data.assetCategoryAssignments),
  hasExchangeRates: Array.isArray(data.exchangeRates)
});

// Helper function to create validation log message
const createValidationLogMessage = (data: any, flags: ImportDataFlags): string => {
  const baseCounts = [
    `Transactions: ${(data.transactions || data.assets || []).length}`, // Support both new and legacy format
    `Liabilities: ${data.liabilities.length}`,
    `Expenses: ${data.expenses.length}`,
    `Income: ${data.income.length}`
  ];

  const optionalCounts = [
    flags.hasAssetDefinitions && `Asset Definitions: ${data.assetDefinitions.length}`,
    flags.hasAssetCategories && `Asset Categories: ${data.assetCategories.length}`,
    flags.hasAssetCategoryOptions && `Category Options: ${data.assetCategoryOptions.length}`,
    flags.hasAssetCategoryAssignments && `Category Assignments: ${data.assetCategoryAssignments.length}`,
    flags.hasExchangeRates && `Exchange Rates: ${data.exchangeRates.length}`
  ].filter(Boolean);

  return `Data validation passed - ${[...baseCounts, ...optionalCounts].join(', ')}`;
};

// Helper function to migrate legacy "assets" data to "transactions" during import
const migrateLegacyAssetsToTransactions = async (data: any): Promise<void> => {
  // Check if this is a legacy format with "assets" instead of "transactions"
  if (data.assets && Array.isArray(data.assets) && !data.transactions) {
    Logger.infoService(`Found legacy 'assets' data (${data.assets.length} items) - migrating to 'transactions'`);
    
    // Migrate assets to transactions
    for (const asset of data.assets) {
      await dbOperations.update('transactions', asset);
    }
    
    Logger.infoService(`Legacy assets migration completed - ${data.assets.length} transactions imported`);
  }
};

// Helper function to import core data stores
const importCoreDataStores = async (data: any): Promise<void> => {
  // Import transactions
  const transactionData = data.transactions;
  if (transactionData && Array.isArray(transactionData)) {
    Logger.infoService(`Importing ${transactionData.length} transactions`);
    
    for (const item of transactionData) {
      await dbOperations.update('transactions', item);
    }
    
    Logger.infoService(`Transactions import completed successfully`);
  }
  
  // Import other core stores
  const coreStores: StoreNames[] = ['liabilities', 'expenses', 'income'];
  
  for (const storeName of coreStores) {
    Logger.infoService(`Importing ${data[storeName].length} ${storeName}`);
    
    for (const item of data[storeName]) {
      await dbOperations.update(storeName, item);
    }
    
    Logger.infoService(`${storeName} import completed successfully`);
  }
};

// Helper function to import data store when data exists
const importExistingDataStore = async (
  data: any,
  storeName: StoreNames,
  displayName: string
): Promise<void> => {
  Logger.infoService(`Importing ${data[storeName].length} ${displayName}`);
  
  for (const item of data[storeName]) {
    await dbOperations.update(storeName, item);
  }
  
  Logger.infoService(`${displayName} import completed successfully`);
};

// Helper function to log when data is missing (legacy format)
const logMissingDataStore = (
  displayName: string
): void => {
  Logger.infoService(`No ${displayName} found in backup (legacy format)`);
};

// Helper function to create export log message
const createExportLogMessage = (data: any): string => {
  const counts = [
    `${data.transactions.length} transactions`,
    `${data.assetDefinitions.length} asset definitions`,
    `${data.assetCategories.length} asset categories`,
    `${data.assetCategoryOptions.length} category options`,
    `${data.assetCategoryAssignments.length} category assignments`,
    `${data.liabilities.length} liabilities`,
    `${data.expenses.length} expenses`,
    `${data.income.length} income`,
    `${data.exchangeRates.length} exchange rates`
  ];
  
  return `Exporting complete backup: ${counts.join(', ')}`;
};

export const importExportOperations = {
  async exportData(): Promise<string> {
    // Export all data stores including new ones
    const transactions = await dbOperations.getAll('transactions');
    const assetDefinitions = await dbOperations.getAll('assetDefinitions');
    const assetCategories = await dbOperations.getAll('assetCategories');
    const assetCategoryOptions = await dbOperations.getAll('assetCategoryOptions');
    const assetCategoryAssignments = await dbOperations.getAll('assetCategoryAssignments');
    const liabilities = await dbOperations.getAll('liabilities');
    const expenses = await dbOperations.getAll('expenses');
    const income = await dbOperations.getAll('income');
    const exchangeRates = await dbOperations.getAll('exchangeRates');

    const data = {
      transactions,
      assetDefinitions,
      assetCategories,
      assetCategoryOptions,
      assetCategoryAssignments,
      liabilities,
      expenses,
      income,
      exchangeRates,
      exportDate: new Date().toISOString(),
      version: '3.0.0', // Major version bump for clean architecture
    };

    Logger.infoService(createExportLogMessage(data));
    return JSON.stringify(data, null, 2);
  },

  validateData(data: any): void {
    if (!data || typeof data !== 'object') {
      Logger.error('Invalid data structure - not an object');
      throw new Error('Invalid backup file format: not an object');
    }

    // Check for transactions array OR legacy assets array
    const hasTransactions = Array.isArray(data.transactions);
    const hasLegacyAssets = Array.isArray(data.assets);
    
    if (!hasTransactions && !hasLegacyAssets) {
      Logger.error('Invalid data structure - neither transactions nor legacy assets array found');
      throw new Error('Invalid backup file format: neither transactions nor assets array found');
    }
    
    if (hasLegacyAssets && !hasTransactions) {
      Logger.infoService(`Detected legacy backup format with ${data.assets.length} assets - will be migrated to transactions`);
    }
    
    const requiredArrays = ['liabilities', 'expenses', 'income'];
    const optionalArrays = ['assetDefinitions', 'assetCategories', 'assetCategoryOptions', 'assetCategoryAssignments', 'exchangeRates'];

    for (const arrayName of requiredArrays) {
      if (!Array.isArray(data[arrayName])) {
        Logger.error(`Invalid data structure - ${arrayName} is not an array or missing`);
        throw new Error(`Invalid backup file format: ${arrayName} is not an array or missing`);
      }
    }

    // Validate optional arrays if they exist
    for (const arrayName of optionalArrays) {
      if (data[arrayName] !== undefined && !Array.isArray(data[arrayName])) {
        Logger.error(`Invalid data structure - ${arrayName} exists but is not an array`);
        throw new Error(`Invalid backup file format: ${arrayName} exists but is not an array`);
      }
    }
  },

  async importData(jsonData: string): Promise<void> {
    try {
      Logger.infoService('Starting data import process');
      const data = JSON.parse(jsonData);
      
      this.validateData(data);
      
      const flags = getImportDataFlags(data);
      
      Logger.infoService(`Import format: ${flags.isV2Format ? 'v2.x (complete)' : 'v1.x (legacy)'}`);
      Logger.infoService(createValidationLogMessage(data, flags));

      // Import core data stores
      await importCoreDataStores(data);

      // Migrate legacy assets to transactions if necessary
      await migrateLegacyAssetsToTransactions(data);

      // Migrate legacy assets to transactions if necessary
      await migrateLegacyAssetsToTransactions(data);

      // Import optional data stores
      if (flags.hasAssetDefinitions) {
        await importExistingDataStore(data, 'assetDefinitions', 'asset definitions');
      } else {
        logMissingDataStore('asset definitions');
      }

      if (flags.hasAssetCategories) {
        await importExistingDataStore(data, 'assetCategories', 'asset categories');
      } else {
        logMissingDataStore('asset categories');
      }

      if (flags.hasAssetCategoryOptions) {
        await importExistingDataStore(data, 'assetCategoryOptions', 'asset category options');
      } else {
        logMissingDataStore('asset category options');
      }

      if (flags.hasAssetCategoryAssignments) {
        await importExistingDataStore(data, 'assetCategoryAssignments', 'asset category assignments');
      } else {
        logMissingDataStore('asset category assignments');
      }

      if (flags.hasExchangeRates) {
        await importExistingDataStore(data, 'exchangeRates', 'exchange rates');
      } else {
        logMissingDataStore('exchange rates');
      }

      Logger.infoService('Data import completed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error(`Import failed: ${errorMessage}`);
      
      if (error instanceof SyntaxError) {
        throw new Error('Invalid JSON file format. Please check your backup file.');
      }
      
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  }
};
