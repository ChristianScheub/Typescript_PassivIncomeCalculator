import { store } from '@/store';
import { clearAllIncome } from '@/store/slices/domain';
import Logger from "@/service/shared/logging/Logger/logger";
import { clearSQLiteStores, clearLocalStorageData } from './utils';
import { StoreNames } from '@/types/domains/database';

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
