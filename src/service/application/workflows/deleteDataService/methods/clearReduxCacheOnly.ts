import { Dispatch } from 'redux';
import { clearAllCharts } from '@/store/slices/ui';
import { 
  clearAllCache,
  clearAllForecast
} from '@/store/slices/cache';
import { 
  clearAllTransactions,
  clearAllExpenses,
  clearAllAssetCategories
} from '@/store/slices/domain';

/**
 * Löscht NUR den Redux-Cache (calculatedData, customAnalytics) und den LocalStorage-Key 'StrictFinance'.
 * Keine weiteren Datenbanken (z.B. IndexedDB) werden angefasst.
 */
export const clearReduxCacheOnly = async (dispatch: Dispatch): Promise<void> => {
  dispatch(clearAllCache());
  dispatch(clearAllCharts());
  dispatch(clearAllTransactions());
  dispatch(clearAllForecast());
  dispatch(clearAllExpenses());
  dispatch(clearAllAssetCategories());
  localStorage.removeItem('StrictFinance');
};
