import { store } from '../../../store';
import { clearAllAssets, invalidatePortfolioCache, invalidateAllDividendCaches } from '../../../store/slices/assetsSlice';
import Logger from '../../Logger/logger';
import { StoreNames } from '../../sqlLiteService';
import { clearSQLiteStores, clearLocalStorageData } from './utils';

export async function clearAssetTransactions(): Promise<void> {
    Logger.infoService("Starting to clear asset transactions");

    // Clear Redux store
    store.dispatch(clearAllAssets());

    // Clear SQLite data
    await clearSQLiteStores(["assets"] as StoreNames[]);

    // Clear localStorage
    clearLocalStorageData(['assets']);

    // Invalidate caches
    store.dispatch(invalidatePortfolioCache());
    store.dispatch(invalidateAllDividendCaches());

    Logger.infoService("Asset transactions cleared successfully");
}
