import { store } from '../../../../../store';
import { clearAllTransactions, invalidatePortfolioCache } from '../../../../../store/slices/transactionsSlice';
import Logger from '../../../../shared/logging/Logger/logger';
import { StoreNames } from '../../../../infrastructure/sqlLiteService';
import { clearSQLiteStores, clearLocalStorageData } from './utils';

export async function clearAssetTransactions(): Promise<void> {
    Logger.infoService("Starting to clear asset transactions");

    // Clear Redux store
    store.dispatch(clearAllTransactions());

    // Clear SQLite data
    await clearSQLiteStores(["transactions"] as StoreNames[]);

    // Clear localStorage
    clearLocalStorageData(['transactions']);

    // Invalidate caches
    store.dispatch(invalidatePortfolioCache());

    Logger.infoService("Asset transactions cleared successfully");
}
