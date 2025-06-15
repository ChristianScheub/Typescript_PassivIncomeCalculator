import { store } from '../../../store';
import { clearAllLiabilities } from '../../../store/slices/liabilitiesSlice';
import Logger from '../../Logger/logger';
import { StoreNames } from '../../sqlLiteService';
import { clearSQLiteStores, clearLocalStorageData } from './utils';

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
