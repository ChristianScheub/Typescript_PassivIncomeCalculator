import { store } from '@/store';
import { clearAllTransactions } from '@/store/slices/domain';
import { clearAllLiabilities } from '@/store/slices/domain';
import { clearAllExpenses } from '@/store/slices/domain';
import { clearAllIncome } from '@/store/slices/domain';
import Logger from "@/service/shared/logging/Logger/logger";
import { StoreNames } from '@/types/domains/database';
import { clearSQLiteStores, clearLocalStorageData } from './utils';

export async function clearPartialData(): Promise<void> {
    Logger.infoService("Starting to clear financial data");

    // Clear Redux store
    store.dispatch(clearAllTransactions());
    store.dispatch(clearAllLiabilities());
    store.dispatch(clearAllExpenses());
    store.dispatch(clearAllIncome());

    // Clear SQLite data
    await clearSQLiteStores([
        "transactions",
        "liabilities",
        "expenses",
        "income"
    ] as StoreNames[]);

    // Clear localStorage
    clearLocalStorageData(['transactions', 'liabilities', 'expenses', 'income']);

    Logger.infoService("Financial data cleared successfully");
}
