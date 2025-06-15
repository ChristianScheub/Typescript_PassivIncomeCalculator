import { store } from '../../../store';
import { clearAllIncome } from '../../../store/slices/incomeSlice';
import Logger from '../../Logger/logger';
import { StoreNames } from '../../sqlLiteService';
import { clearSQLiteStores, clearLocalStorageData } from './utils';

export async function clearIncome(): Promise<void> {
    Logger.infoService("Starting to clear income");

    // Clear Redux store
    store.dispatch(clearAllIncome());

    // Clear SQLite data
    await clearSQLiteStores(["income"] as StoreNames[]);

    // Clear localStorage
    clearLocalStorageData(['income']);

    Logger.infoService("Income cleared successfully");
}
