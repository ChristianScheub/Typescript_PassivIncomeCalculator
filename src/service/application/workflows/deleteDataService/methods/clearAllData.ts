import { store } from '@/store';
import { 
  clearAllTransactions,
  clearAllLiabilities,
  clearAllExpenses,
  clearAllIncome,
  clearAllAssetCategories
} from '@/store/slices/domain';
import { setStockApiKey, setStockApiEnabled, setDividendApiKey, setDividendApiEnabled } from '@/store/slices/configSlice';
import { StockAPIProvider } from '@/types/shared/base/enums';
import { DividendApiProvider } from '@/types/shared/base/enums';
import Logger from "@/service/shared/logging/Logger/logger";
import { clearSQLiteStores } from './utils';
import { StoreNames } from '@/types/domains/database';
import { clearPortfolioHistory } from './clearPortfolioHistory';

export async function clearAllData(): Promise<void> {
    Logger.infoService("Starting to clear all data");

    // Clear Redux store
    store.dispatch(clearAllTransactions());
    store.dispatch(clearAllLiabilities());
    store.dispatch(clearAllExpenses());
    store.dispatch(clearAllIncome());
    store.dispatch(clearAllAssetCategories());

    // Clear SQLite data
    await clearSQLiteStores([
        "transactions",
        "assetDefinitions",
        "assetCategories",
        "assetCategoryOptions",
        "assetCategoryAssignments",
        "liabilities",
        "expenses",
        "income",
        "exchangeRates"
    ] as StoreNames[]);

    // Clear portfolio history database
    Logger.infoService("Clearing portfolio history database");
    await clearPortfolioHistory();

    // Clear ALL localStorage
    localStorage.clear();
    Logger.infoService("LocalStorage cleared completely");

    // Dynamisch alle vorhandenen StockAPIProvider-Keys entfernen
    const stockApiConfig = store.getState().config.apis.stock;
    Object.keys(stockApiConfig.apiKeys).forEach((provider) => {
        store.dispatch(setStockApiKey({ provider: provider as StockAPIProvider, key: '' }));
    });
    store.dispatch(setStockApiEnabled(false));

    // Dynamisch alle vorhandenen DividendApiProvider-Keys entfernen
    const dividendApiConfig = store.getState().config.apis.dividend;
    Object.keys(dividendApiConfig.apiKeys).forEach((provider) => {
        store.dispatch(setDividendApiKey({ provider: provider as DividendApiProvider, key: '' }));
    });
    store.dispatch(setDividendApiEnabled(false));

    Logger.infoService("All data cleared successfully");

    // Reload page to ensure clean state
    setTimeout(() => {
        Logger.infoService("Reloading page after data clear");
        if (typeof window !== 'undefined') {
            window.location.reload();
        }
    }, 1500);
}
