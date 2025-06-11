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
    `Assets: ${data.assets.length}`,
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

// Helper function to import core data stores
const importCoreDataStores = async (data: any): Promise<void> => {
  const coreStores: StoreNames[] = ['assets', 'liabilities', 'expenses', 'income'];
  
  for (const storeName of coreStores) {
    Logger.infoService(`Importing ${data[storeName].length} ${storeName}`);
    
    for (const item of data[storeName]) {
      await dbOperations.update(storeName, item);
    }
    
    Logger.infoService(`${storeName} import completed successfully`);
  }
};

// Helper function to import optional data store
const importOptionalDataStore = async (
  data: any,
  storeName: StoreNames,
  hasData: boolean,
  displayName: string
): Promise<void> => {
  if (hasData) {
    Logger.infoService(`Importing ${data[storeName].length} ${displayName}`);
    
    for (const item of data[storeName]) {
      await dbOperations.update(storeName, item);
    }
    
    Logger.infoService(`${displayName} import completed successfully`);
  } else {
    Logger.infoService(`No ${displayName} found in backup (legacy format)`);
  }
};

// Helper function to create export log message
const createExportLogMessage = (data: any): string => {
  const counts = [
    `${data.assets.length} assets`,
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
    const assets = await dbOperations.getAll('assets');
    const assetDefinitions = await dbOperations.getAll('assetDefinitions');
    const assetCategories = await dbOperations.getAll('assetCategories');
    const assetCategoryOptions = await dbOperations.getAll('assetCategoryOptions');
    const assetCategoryAssignments = await dbOperations.getAll('assetCategoryAssignments');
    const liabilities = await dbOperations.getAll('liabilities');
    const expenses = await dbOperations.getAll('expenses');
    const income = await dbOperations.getAll('income');
    const exchangeRates = await dbOperations.getAll('exchangeRates');

    const data = {
      assets,
      assetDefinitions,
      assetCategories,
      assetCategoryOptions,
      assetCategoryAssignments,
      liabilities,
      expenses,
      income,
      exchangeRates,
      exportDate: new Date().toISOString(),
      version: '2.1.0', // Increment version for asset categories support
    };

    Logger.infoService(createExportLogMessage(data));
    return JSON.stringify(data, null, 2);
  },

  validateData(data: any): void {
    if (!data || typeof data !== 'object') {
      Logger.error('Invalid data structure - not an object');
      throw new Error('Invalid backup file format: not an object');
    }

    // Support both old format (v1.x), v2.0 and new format (v2.1+)
    const requiredArrays = ['assets', 'liabilities', 'expenses', 'income'];
    const optionalArrays = ['assetDefinitions', 'assetCategories', 'assetCategoryOptions', 'assetCategoryAssignments', 'exchangeRates']; // These may not exist in older exports

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

      // Import optional data stores
      await importOptionalDataStore(data, 'assetDefinitions', flags.hasAssetDefinitions, 'asset definitions');
      await importOptionalDataStore(data, 'assetCategories', flags.hasAssetCategories, 'asset categories');
      await importOptionalDataStore(data, 'assetCategoryOptions', flags.hasAssetCategoryOptions, 'asset category options');
      await importOptionalDataStore(data, 'assetCategoryAssignments', flags.hasAssetCategoryAssignments, 'asset category assignments');
      await importOptionalDataStore(data, 'exchangeRates', flags.hasExchangeRates, 'exchange rates');

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
