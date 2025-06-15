import { store } from '../../../store';
import { clearAllExpenses } from '../../../store/slices/expensesSlice';
import { analytics } from '../../analytics';
import Logger from '../../Logger/logger';
import { StoreNames } from '../../sqlLiteService';
import { clearSQLiteStores, clearLocalStorageData } from './utils';

export async function clearExpenses(): Promise<void> {
    Logger.infoService("Starting to clear expenses");

    // Clear Redux store
    store.dispatch(clearAllExpenses());

    // Clear SQLite data
    await clearSQLiteStores(["expenses"] as StoreNames[]);

    // Clear localStorage
    clearLocalStorageData(['expenses']);

    analytics.trackEvent("settings_clear_expenses");
    Logger.infoService("Expenses cleared successfully");
}
