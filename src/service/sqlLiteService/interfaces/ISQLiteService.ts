import { DBSchema } from 'idb';
import { Asset, Liability, Expense, Income } from '../../../types';

export interface FinanceDB extends DBSchema {
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

export type StoreNames = 'assets' | 'liabilities' | 'expenses' | 'income';

export interface ISQLiteService {
  getAll<K extends StoreNames>(storeName: K): Promise<FinanceDB[K]['value'][]>;
  getById<K extends StoreNames>(storeName: K, id: string): Promise<FinanceDB[K]['value'] | undefined>;
  add<K extends StoreNames>(storeName: K, item: FinanceDB[K]['value']): Promise<string>;
  update<K extends StoreNames>(storeName: K, item: FinanceDB[K]['value']): Promise<string>;
  remove(storeName: StoreNames, id: string): Promise<void>;
  exportData(): Promise<string>;
  importData(jsonData: string): Promise<void>;
}
