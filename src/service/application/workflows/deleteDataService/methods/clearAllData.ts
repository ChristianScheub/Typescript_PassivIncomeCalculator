import { store } from '@/store';
import { 
  clearAllTransactions,
  clearAllLiabilities,
  clearAllExpenses,
  clearAllIncome,
  clearAllAssetCategories
} from '@/store/slices/domain';
import { setStockApiKey, setStockApiEnabled } from '@/store/slices/configSlice';
import { StockAPIProvider } from '@/types/shared/base/enums';
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

    // Reset API key state
    const providers: StockAPIProvider[] = [
        StockAPIProvider.FINNHUB,
        StockAPIProvider.YAHOO,
        StockAPIProvider.ALPHA_VANTAGE
    ];
    providers.forEach((provider) => {
        store.dispatch(setStockApiKey({ provider, key: '' }));
    });
    store.dispatch(setStockApiEnabled(false));

    Logger.infoService("All data cleared successfully");

    // Reload page to ensure clean state
    setTimeout(() => {
        Logger.infoService("Reloading page after data clear");
        window.location.reload();
    }, 1500);
}
