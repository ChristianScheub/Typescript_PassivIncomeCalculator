import { store } from '@/store';
import { clearAllLiabilities } from '@/store/slices/domain';
import Logger from "@/service/shared/logging/Logger/logger";
import { clearSQLiteStores, clearLocalStorageData } from './utils';
import { StoreNames } from '@/types/domains/database';

export async function clearDebts(): Promise<void> {
    Logger.infoService("Starting to clear debts");

    // Clear Redux store
    store.dispatch(clearAllLiabilities());

    // Clear SQLite data
    await clearSQLiteStores(["liabilities"] as StoreNames[]);

    // Clear localStorage
    clearLocalStorageData(['liabilities']);

    Logger.infoService("Debts cleared successfully");
}
