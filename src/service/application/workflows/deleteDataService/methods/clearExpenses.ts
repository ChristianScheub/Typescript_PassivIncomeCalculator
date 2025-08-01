import { store } from '@/store';
import { clearAllExpenses } from '@/store/slices/domain';
import Logger from "@/service/shared/logging/Logger/logger";
import { StoreNames } from '@/types/domains/database';
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
