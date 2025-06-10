import { StoreNames } from '../interfaces/ISQLiteService';
import { dbOperations } from './dbOperations';
import Logger from '../../Logger/logger';

// Helper function to migrate legacy asset data
const migrateLegacyAssetData = (asset: any) => {
  // Create a copy to avoid modifying the original
  const migratedAsset = { ...asset };
  
  // Check for legacy fields in the imported data (these may exist in old backup files)
  const hasLegacyDividendInfo = 'dividendInfo' in asset && asset.dividendInfo;
  const hasLegacyRentalIncome = 'rentalIncome' in asset && asset.rentalIncome;
  const hasLegacyInterestRate = 'interestRate' in asset && asset.interestRate !== undefined;
  
  // Log if we're migrating legacy dividend/rental/interest data
  if (hasLegacyDividendInfo || hasLegacyRentalIncome || hasLegacyInterestRate) {
    Logger.infoService(
      `Migrating legacy data for asset ${asset.name}: ` +
      `hasDividend=${hasLegacyDividendInfo}, hasRental=${hasLegacyRentalIncome}, hasInterest=${hasLegacyInterestRate}`
    );
    
    // Log deprecation warnings for legacy fields found in import data
    if (hasLegacyDividendInfo) {
      Logger.infoService(`Asset ${asset.name} contains legacy dividendInfo in import data - should be migrated to assetDefinition`);
    }
    if (hasLegacyRentalIncome) {
      Logger.infoService(`Asset ${asset.name} contains legacy rentalIncome in import data - should be migrated to assetDefinition`);
    }
    if (hasLegacyInterestRate) {
      Logger.infoService(`Asset ${asset.name} contains legacy interestRate in import data - should be migrated to assetDefinition`);
    }
  }
  
  return migratedAsset;
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

    Logger.infoService(`Exporting complete backup: ${assets.length} assets, ${assetDefinitions.length} asset definitions, ${assetCategories.length} asset categories, ${assetCategoryOptions.length} category options, ${assetCategoryAssignments.length} category assignments, ${liabilities.length} liabilities, ${expenses.length} expenses, ${income.length} income, ${exchangeRates.length} exchange rates`);
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
      
      // Determine import version and available data
      const isV2Format = data.version && data.version.startsWith('2.');
      const hasAssetDefinitions = Array.isArray(data.assetDefinitions);
      const hasAssetCategories = Array.isArray(data.assetCategories);
      const hasAssetCategoryOptions = Array.isArray(data.assetCategoryOptions);
      const hasAssetCategoryAssignments = Array.isArray(data.assetCategoryAssignments);
      const hasExchangeRates = Array.isArray(data.exchangeRates);
      
      Logger.infoService(`Import format: ${isV2Format ? 'v2.x (complete)' : 'v1.x (legacy)'}`);
      Logger.infoService(`Data validation passed - Assets: ${data.assets.length}, Liabilities: ${data.liabilities.length}, Expenses: ${data.expenses.length}, Income: ${data.income.length}${hasAssetDefinitions ? `, Asset Definitions: ${data.assetDefinitions.length}` : ''}${hasAssetCategories ? `, Asset Categories: ${data.assetCategories.length}` : ''}${hasAssetCategoryOptions ? `, Category Options: ${data.assetCategoryOptions.length}` : ''}${hasAssetCategoryAssignments ? `, Category Assignments: ${data.assetCategoryAssignments.length}` : ''}${hasExchangeRates ? `, Exchange Rates: ${data.exchangeRates.length}` : ''}`);

      // Import core data stores (required)
      const coreStores: StoreNames[] = ['assets', 'liabilities', 'expenses', 'income'];
      for (const storeName of coreStores) {
        Logger.infoService(`Importing ${data[storeName].length} ${storeName}`);
        for (const item of data[storeName]) {
          // Apply migration for assets to handle legacy dividend data
          const processedItem = storeName === 'assets' ? migrateLegacyAssetData(item) : item;
          await dbOperations.update(storeName, processedItem);
        }
        Logger.infoService(`${storeName} import completed successfully`);
      }

      // Import additional data stores if available
      if (hasAssetDefinitions) {
        Logger.infoService(`Importing ${data.assetDefinitions.length} asset definitions`);
        for (const item of data.assetDefinitions) {
          await dbOperations.update('assetDefinitions', item);
        }
        Logger.infoService('Asset definitions import completed successfully');
      } else {
        Logger.infoService('No asset definitions found in backup (legacy format)');
      }

      // Import asset categories data (v2.1+)
      if (hasAssetCategories) {
        Logger.infoService(`Importing ${data.assetCategories.length} asset categories`);
        for (const item of data.assetCategories) {
          await dbOperations.update('assetCategories', item);
        }
        Logger.infoService('Asset categories import completed successfully');
      } else {
        Logger.infoService('No asset categories found in backup (legacy format)');
      }

      if (hasAssetCategoryOptions) {
        Logger.infoService(`Importing ${data.assetCategoryOptions.length} asset category options`);
        for (const item of data.assetCategoryOptions) {
          await dbOperations.update('assetCategoryOptions', item);
        }
        Logger.infoService('Asset category options import completed successfully');
      } else {
        Logger.infoService('No asset category options found in backup (legacy format)');
      }

      if (hasAssetCategoryAssignments) {
        Logger.infoService(`Importing ${data.assetCategoryAssignments.length} asset category assignments`);
        for (const item of data.assetCategoryAssignments) {
          await dbOperations.update('assetCategoryAssignments', item);
        }
        Logger.infoService('Asset category assignments import completed successfully');
      } else {
        Logger.infoService('No asset category assignments found in backup (legacy format)');
      }

      if (hasExchangeRates) {
        Logger.infoService(`Importing ${data.exchangeRates.length} exchange rates`);
        for (const item of data.exchangeRates) {
          await dbOperations.update('exchangeRates', item);
        }
        Logger.infoService('Exchange rates import completed successfully');
      } else {
        Logger.infoService('No exchange rates found in backup (legacy format)');
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
