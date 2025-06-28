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

// Unterstützte Store-Namen für flexiblen Import/Export
const SUPPORTED_STORES: StoreNames[] = [
  'transactions',
  'assetDefinitions',
  'assetCategories',
  'assetCategoryOptions',
  'assetCategoryAssignments',
  'liabilities',
  'expenses',
  'income',
  'exchangeRates'
];

// Neue Validierung: Mindestens ein unterstützter Store als Array
const validatePartialData = (data: unknown): void => {
  if (!data || typeof data !== 'object') {
    Logger.error('Invalid data structure - not an object');
    throw new Error('Invalid backup file format: not an object');
  }
  const exportData = data as Record<string, unknown>;
  const found = SUPPORTED_STORES.some(store => Array.isArray(exportData[store]));
  if (!found) {
    Logger.error('No supported data arrays found in import');
    throw new Error('Invalid backup file: No supported data arrays found');
  }
  // Optional: Warnung für Stores, die keine Arrays sind, aber vorhanden
  SUPPORTED_STORES.forEach(store => {
    if (exportData[store] !== undefined && !Array.isArray(exportData[store])) {
      Logger.warn(`${store} exists but is not an array, skipping`);
    }
  });
};

// Importiert alle Stores, die im JSON als Array vorhanden sind
const importAnyStores = async (data: ExportData): Promise<void> => {
  for (const storeName of SUPPORTED_STORES) {
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

export const importExportOperations = {
  // Exportiert alle oder nur ausgewählte Stores
  async exportData(storeNames?: StoreNames[]): Promise<string> {
    const stores = storeNames && storeNames.length > 0 ? storeNames : SUPPORTED_STORES;
    // Typ erweitern, damit Metadaten erlaubt sind
    const data: Partial<Record<StoreNames, unknown[]>> & { exportDate?: string; version?: string } = {};
    for (const store of stores) {
      data[store] = await dbOperations.getAll(store);
    }
    data.exportDate = new Date().toISOString();
    data.version = '3.1.0';
    Logger.infoService(
      `Exporting backup: ${stores.map(s => `${data[s]?.length || 0} ${s}`).join(', ')}`
    );
    return JSON.stringify(data, null, 2);
  },

  // Neue Validierung für Teilmengen
  validateData(data: unknown): void {
    validatePartialData(data);
  },

  // Importiert beliebige Teilmengen
  async importData(jsonData: string): Promise<void> {
    try {
      Logger.infoService('Starting data import process');
      const parsedData = JSON.parse(jsonData);
      this.validateData(parsedData);
      const data = parsedData as ExportData;
      Logger.infoService('Importing stores: ' + SUPPORTED_STORES.filter(s => Array.isArray(data[s])).join(', '));
      await importAnyStores(data);
      Logger.infoService('Data import completed successfully');
    } catch (error) {
      Logger.errorStack('Import error details', error as Error);
      if (error instanceof SyntaxError) {
        throw new Error('Invalid JSON file format. Please check your backup file.');
      }
      throw error instanceof Error ? error : new Error();
    }
  }
};
