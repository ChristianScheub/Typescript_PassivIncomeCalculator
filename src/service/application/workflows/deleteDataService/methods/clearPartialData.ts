import { store } from '../../../../../store';
import { clearAllTransactions } from '@/store/slices/transactionsSlice';
import { clearAllLiabilities } from '@/store/slices/liabilitiesSlice';
import { clearAllExpenses } from '@/store/slices/expensesSlice';
import { clearAllIncome } from '@/store/slices/incomeSlice';
import Logger from "@/service/shared/logging/Logger/logger";
import { StoreNames } from '../../../../infrastructure/sqlLiteService';
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
