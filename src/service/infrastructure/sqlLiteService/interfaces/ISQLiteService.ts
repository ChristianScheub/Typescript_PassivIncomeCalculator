import { DBSchema } from 'idb';
import { 
  Transaction as Asset, 
  AssetDefinition, 
  AssetCategory, 
  AssetCategoryOption, 
  AssetCategoryAssignment 
} from '@/types/domains/assets/';
import { 
  Liability, 
  Expense, 
  Income 
} from '@/types/domains/financial/';
import { ExchangeRate } from '@/types/domains/financial/calculations';

export interface FinanceDB extends DBSchema {
  transactions: {
    key: string;
    value: Asset;
    indexes: { 'by-type': string };
  };
  assetDefinitions: {
    key: string;
    value: AssetDefinition;
    indexes: { 'by-type': string };
  };
  assetCategories: {
    key: string;
    value: AssetCategory;
    indexes: { 'by-name': string };
  };
  assetCategoryOptions: {
    key: string;
    value: AssetCategoryOption;
    indexes: { 'by-category': string, 'by-name': string };
  };
  assetCategoryAssignments: {
    key: string;
    value: AssetCategoryAssignment;
    indexes: { 'by-asset': string, 'by-category': string };
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
  exchangeRates: {
    key: string;
    value: ExchangeRate;
    indexes: { 'by-date': string };
  };
}

export type StoreNames = import('@/types/domains/database/config').StoreNames;

export interface ISQLiteService {
  getAll<K extends StoreNames>(storeName: K): Promise<FinanceDB[K]['value'][]>;
  getById<K extends StoreNames>(storeName: K, id: string): Promise<FinanceDB[K]['value'] | undefined>;
  add<K extends StoreNames>(storeName: K, item: FinanceDB[K]['value']): Promise<string>;
  update<K extends StoreNames>(storeName: K, item: FinanceDB[K]['value']): Promise<string>;
  remove(storeName: StoreNames, id: string): Promise<void>;
  exportData(): Promise<string>;
  importData(jsonData: string): Promise<void>;
}
