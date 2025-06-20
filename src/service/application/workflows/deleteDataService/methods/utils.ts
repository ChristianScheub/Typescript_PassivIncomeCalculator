import sqliteService, { StoreNames } from '../../../../infrastructure/sqlLiteService';
import Logger from "@/service/shared/logging/Logger/logger";

export async function clearSQLiteStores(stores: StoreNames[]): Promise<void> {
    for (const store of stores) {
        try {
            const items = await sqliteService.getAll(store);
            for (const item of items) {
                if (item.id) {
                    await sqliteService.remove(store, item.id.toString());
                }
            }
            Logger.infoService(`Cleared ${items.length} items from ${store}`);
        } catch (error) {
            Logger.error(`Failed to clear ${store}: ${JSON.stringify(error)}`);
        }
    }
}

export function clearLocalStorageData(keys: string[]): void {
    const currentStorage = localStorage.getItem('passiveIncomeCalculator');
    if (currentStorage) {
        const parsed = JSON.parse(currentStorage);
        keys.forEach(key => {
            if (key === 'assetCategories') {
                parsed[key] = { 
                    categories: [], 
                    categoryOptions: [], 
                    categoryAssignments: [], 
                    status: 'idle', 
                    error: null 
                };
            } else {
                parsed[key] = { items: [], status: 'idle', error: null };
            }
        });
        localStorage.setItem('passiveIncomeCalculator', JSON.stringify(parsed));
    }
}
