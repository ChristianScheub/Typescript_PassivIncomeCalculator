import { store } from '../../../store';
import { clearAllAssetCategories } from '../../../store/slices/assetCategoriesSlice';
import { invalidatePortfolioCache } from '../../../store/slices/assetsSlice';
import { analytics } from '../../analytics';
import Logger from '../../Logger/logger';
import { StoreNames } from '../../sqlLiteService';
import { clearSQLiteStores, clearLocalStorageData } from './utils';

export async function clearAssetDefinitions(): Promise<void> {
    Logger.infoService("Starting to clear asset definitions");
    
    // Clear Redux store
    store.dispatch(clearAllAssetCategories());

    // Clear SQLite data
    await clearSQLiteStores([
        "assetDefinitions",
        "assetCategories",
        "assetCategoryOptions",
        "assetCategoryAssignments"
    ] as StoreNames[]);

    // Clear localStorage
    clearLocalStorageData(['assetDefinitions', 'assetCategories']);

    // Invalidate caches
    store.dispatch(invalidatePortfolioCache());

    analytics.trackEvent("settings_clear_asset_definitions");
    Logger.infoService("Asset definitions cleared successfully");
}
