import { store } from '../../../store';
import { clearAllAssets } from '../../../store/slices/assetsSlice';
import { clearAllLiabilities } from '../../../store/slices/liabilitiesSlice';
import { clearAllExpenses } from '../../../store/slices/expensesSlice';
import { clearAllIncome } from '../../../store/slices/incomeSlice';
import Logger from '../../Logger/logger';
import { StoreNames } from '../../sqlLiteService';
import { clearSQLiteStores, clearLocalStorageData } from './utils';

export async function clearPartialData(): Promise<void> {
    Logger.infoService("Starting to clear financial data");

    // Clear Redux store
    store.dispatch(clearAllAssets());
    store.dispatch(clearAllLiabilities());
    store.dispatch(clearAllExpenses());
    store.dispatch(clearAllIncome());

    // Clear SQLite data
    await clearSQLiteStores([
        "assets",
        "liabilities",
        "expenses",
        "income"
    ] as StoreNames[]);

    // Clear localStorage
    clearLocalStorageData(['assets', 'liabilities', 'expenses', 'income']);

    Logger.infoService("Financial data cleared successfully");
}
