import { store } from '@/store';
import { 
  clearAllAssetCategories,
  invalidatePortfolioCache
} from '@/store/slices/domain';
import Logger from "@/service/shared/logging/Logger/logger";
import { StoreNames } from '@/types/domains/database';
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

    Logger.infoService("Asset definitions cleared successfully");
}
