import { store } from '../../../../../store';
import { clearAllExpenses } from '@/store/slices/expensesSlice';
import Logger from "@/service/shared/logging/Logger/logger";
import { StoreNames } from '../../../../infrastructure/sqlLiteService';
import { clearSQLiteStores, clearLocalStorageData } from './utils';

export async function clearExpenses(): Promise<void> {
    Logger.infoService("Starting to clear expenses");

    // Clear Redux store
    store.dispatch(clearAllExpenses());

    // Clear SQLite data
    await clearSQLiteStores(["expenses"] as StoreNames[]);

    // Clear localStorage
    clearLocalStorageData(['expenses']);
    Logger.infoService("Expenses cleared successfully");
}
