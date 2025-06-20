import { StoreNames } from '../interfaces/ISQLiteService';
import { dbOperations } from './dbOperations';
import Logger from "@/service/shared/logging/Logger/logger";
import { ExportData, ImportDataFlags } from '@/types/domains/database/import-export';

// Helper function to determine import data flags
const getImportDataFlags = (data: ExportData): ImportDataFlags => ({
  isV2Format: data.version?.startsWith('2.') ?? false,
  hasAssetDefinitions: Array.isArray(data.assetDefinitions),
  hasAssetCategories: Array.isArray(data.assetCategories),
  hasAssetCategoryOptions: Array.isArray(data.assetCategoryOptions),
  hasAssetCategoryAssignments: Array.isArray(data.assetCategoryAssignments),
  hasExchangeRates: Array.isArray(data.exchangeRates)
});

// Helper function to create validation log message
const createValidationLogMessage = (data: ExportData, flags: ImportDataFlags): string => {
  const baseCounts = [
    `Transactions: ${data.transactions.length}`,
    `Liabilities: ${data.liabilities.length}`,
    `Expenses: ${data.expenses.length}`,
    `Income: ${data.income.length}`
  ];

  const optionalCounts = [
    flags.hasAssetDefinitions && data.assetDefinitions && `Asset Definitions: ${data.assetDefinitions.length}`,
    flags.hasAssetCategories && data.assetCategories && `Asset Categories: ${data.assetCategories.length}`,
    flags.hasAssetCategoryOptions && data.assetCategoryOptions && `Category Options: ${data.assetCategoryOptions.length}`,
    flags.hasAssetCategoryAssignments && data.assetCategoryAssignments && `Category Assignments: ${data.assetCategoryAssignments.length}`,
    flags.hasExchangeRates && data.exchangeRates && `Exchange Rates: ${data.exchangeRates.length}`
  ].filter(Boolean);

  return `Data validation passed - ${[...baseCounts, ...optionalCounts].join(', ')}`;
};

// Helper function to import core data stores
const importCoreDataStores = async (data: ExportData): Promise<void> => {
  // Import transactions
  const transactionData = data.transactions;
  if (transactionData && Array.isArray(transactionData)) {
    Logger.infoService(`Importing ${transactionData.length} transactions`);
    
    for (const item of transactionData) {
      await dbOperations.update('transactions', item as any);
    }
    
    Logger.infoService(`Transactions import completed successfully`);
  }
  
  // Import other core stores
  const coreStores: StoreNames[] = ['liabilities', 'expenses', 'income'];
  
  for (const storeName of coreStores) {
    const storeData = data[storeName];
    if (storeData && Array.isArray(storeData)) {
      Logger.infoService(`Importing ${storeData.length} ${storeName}`);
      
      for (const item of storeData) {
        await dbOperations.update(storeName, item as any);
      }
      
      Logger.infoService(`${storeName} import completed successfully`);
    }
  }
};

// Helper function to import data store when data exists
const importExistingDataStore = async (
  data: ExportData,
  storeName: StoreNames,
  displayName: string
): Promise<void> => {
  const storeData = data[storeName];
  if (storeData && Array.isArray(storeData)) {
    Logger.infoService(`Importing ${storeData.length} ${displayName}`);
    
    for (const item of storeData) {
      await dbOperations.update(storeName, item as any);
    }
    
    Logger.infoService(`${displayName} import completed successfully`);
  }
};

// Helper function to log when data is missing
const logMissingDataStore = (
  displayName: string
): void => {
  Logger.infoService(`No ${displayName} found in backup`);
};

// Helper function to create export log message
const createExportLogMessage = (data: ExportData): string => {
  const counts = [
    `${data.transactions.length} transactions`,
    `${data.assetDefinitions?.length || 0} asset definitions`,
    `${data.assetCategories?.length || 0} asset categories`,
    `${data.assetCategoryOptions?.length || 0} category options`,
    `${data.assetCategoryAssignments?.length || 0} category assignments`,
    `${data.liabilities.length} liabilities`,
    `${data.expenses.length} expenses`,
    `${data.income.length} income`,
    `${data.exchangeRates?.length || 0} exchange rates`
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

  validateData(data: unknown): void {
    if (!data || typeof data !== 'object') {
      Logger.error('Invalid data structure - not an object');
      throw new Error('Invalid backup file format: not an object');
    }

    const exportData = data as Record<string, unknown>;

    // Check for transactions array
    const hasTransactions = Array.isArray(exportData.transactions);
    
    if (!hasTransactions) {
      Logger.error('Invalid data structure - transactions array not found');
      throw new Error('Invalid backup file format: transactions array not found');
    }
    
    const requiredArrays = ['liabilities', 'expenses', 'income'];
    const optionalArrays = ['assetDefinitions', 'assetCategories', 'assetCategoryOptions', 'assetCategoryAssignments', 'exchangeRates'];

    for (const arrayName of requiredArrays) {
      if (!Array.isArray(exportData[arrayName])) {
        Logger.error(`Invalid data structure - ${arrayName} is not an array or missing`);
        throw new Error(`Invalid backup file format: ${arrayName} is not an array or missing`);
      }
    }

    // Validate optional arrays if they exist
    for (const arrayName of optionalArrays) {
      if (exportData[arrayName] !== undefined && !Array.isArray(exportData[arrayName])) {
        Logger.error(`Invalid data structure - ${arrayName} exists but is not an array`);
        throw new Error(`Invalid backup file format: ${arrayName} exists but is not an array`);
      }
    }
  },

  async importData(jsonData: string): Promise<void> {
    try {
      Logger.infoService('Starting data import process');
      const parsedData = JSON.parse(jsonData);
      
      this.validateData(parsedData);
      
      const data = parsedData as ExportData;
      const flags = getImportDataFlags(data);
      
      Logger.infoService(`Import format: ${flags.isV2Format ? 'v2.x (complete)' : 'v1.x (partial)'}`);
      Logger.infoService(createValidationLogMessage(data, flags));

      // Import core data stores
      await importCoreDataStores(data);

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
