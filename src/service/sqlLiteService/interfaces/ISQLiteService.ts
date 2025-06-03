import { DBSchema } from 'idb';
import { Asset, Liability, Expense, Income } from '../../../types';
import { ExchangeRate } from '../../exchangeService/interfaces/IExchangeService';

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
  exchangeRates: {
    key: string;
    value: ExchangeRate;
    indexes: { 'by-date': string };
  };
}

export type StoreNames = 'assets' | 'liabilities' | 'expenses' | 'income' | 'exchangeRates';

export interface ISQLiteService {
  getAll<K extends StoreNames>(storeName: K): Promise<FinanceDB[K]['value'][]>;
  getById<K extends StoreNames>(storeName: K, id: string): Promise<FinanceDB[K]['value'] | undefined>;
  add<K extends StoreNames>(storeName: K, item: FinanceDB[K]['value']): Promise<string>;
  update<K extends StoreNames>(storeName: K, item: FinanceDB[K]['value']): Promise<string>;
  remove(storeName: StoreNames, id: string): Promise<void>;
  exportData(): Promise<string>;
  importData(jsonData: string): Promise<void>;
}
