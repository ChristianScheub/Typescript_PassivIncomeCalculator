import { store } from '../../../store';
import { clearAllAssets, invalidatePortfolioCache } from '../../../store/slices/transactionsSlice';
import Logger from '../../Logger/logger';
import { StoreNames } from '../../sqlLiteService';
import { clearSQLiteStores, clearLocalStorageData } from './utils';

export async function clearAssetTransactions(): Promise<void> {
    Logger.infoService("Starting to clear asset transactions");

    // Clear Redux store
    store.dispatch(clearAllAssets());

    // Clear SQLite data
    await clearSQLiteStores(["transactions"] as StoreNames[]);

    // Clear localStorage
    clearLocalStorageData(['transactions']);

    // Invalidate caches
    store.dispatch(invalidatePortfolioCache());
    // Individual dividend caches are now managed per asset basis
    // store.dispatch(invalidateAllDividendCaches());

    Logger.infoService("Asset transactions cleared successfully");
}
