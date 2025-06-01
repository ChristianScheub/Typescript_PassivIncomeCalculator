import { StoreNames } from '../interfaces/ISQLiteService';
import { dbOperations } from './dbOperations';
import Logger from '../../Logger/logger';

export const importExportOperations = {
  async exportData(): Promise<string> {
    const assets = await dbOperations.getAll('assets');
    const liabilities = await dbOperations.getAll('liabilities');
    const expenses = await dbOperations.getAll('expenses');
    const income = await dbOperations.getAll('income');

    const data = {
      assets,
      liabilities,
      expenses,
      income,
      exportDate: new Date().toISOString(),
    };

    return JSON.stringify(data, null, 2);
  },

  validateData(data: any): void {
    if (!data || typeof data !== 'object') {
      Logger.error('Invalid data structure - not an object');
      throw new Error('Invalid backup file format: not an object');
    }

    const requiredArrays = ['assets', 'liabilities', 'expenses', 'income'];
    for (const arrayName of requiredArrays) {
      if (!Array.isArray(data[arrayName])) {
        Logger.error(`Invalid data structure - ${arrayName} is not an array or missing`);
        throw new Error(`Invalid backup file format: ${arrayName} is not an array or missing`);
      }
    }
  },

  async importData(jsonData: string): Promise<void> {
    try {
      Logger.infoService('Starting data import process');
      const data = JSON.parse(jsonData);
      
      this.validateData(data);
      Logger.infoService(`Data validation passed - Assets: ${data.assets.length}, Liabilities: ${data.liabilities.length}, Expenses: ${data.expenses.length}, Income: ${data.income.length}`);

      const stores: StoreNames[] = ['assets', 'liabilities', 'expenses', 'income'];
      for (const storeName of stores) {
        Logger.infoService(`Importing ${data[storeName].length} ${storeName}`);
        for (const item of data[storeName]) {
          await dbOperations.update(storeName, item);
        }
        Logger.infoService(`${storeName} import completed successfully`);
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
