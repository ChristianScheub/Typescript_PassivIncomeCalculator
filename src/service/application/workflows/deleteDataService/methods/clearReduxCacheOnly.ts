import { Dispatch } from 'redux';
import { clearAllCharts } from '@/store/slices/customAnalyticsSlice';
import { clearAllCache } from '@/store/slices/calculatedDataSlice';
import { clearAllTransactions } from '@/store/slices/transactionsSlice';
import { clearAllForecast } from '@/store/slices/forecastSlice';
import { clearAllExpenses } from '@/store/slices/expensesSlice';
import { clearAllAssetCategories } from '@/store/slices/assetCategoriesSlice';

/**
 * Löscht NUR den Redux-Cache (calculatedData, customAnalytics) und den LocalStorage-Key 'passiveIncomeCalculator'.
 * Keine weiteren Datenbanken (z.B. IndexedDB) werden angefasst.
 */
export const clearReduxCacheOnly = async (dispatch: Dispatch): Promise<void> => {
  dispatch(clearAllCache());
  dispatch(clearAllCharts());
  dispatch(clearAllTransactions());
  dispatch(clearAllForecast());
  dispatch(clearAllExpenses());
  dispatch(clearAllAssetCategories());
  localStorage.removeItem('passiveIncomeCalculator');
};
