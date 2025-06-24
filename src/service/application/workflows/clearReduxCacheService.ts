import { Dispatch } from 'redux';
import { clearAllCache } from '../../store/slices/calculatedDataSlice';
import { clearAllCharts } from '../../store/slices/customAnalyticsSlice';

/**
 * Löscht nur den Redux-Cache (calculatedData, customAnalytics) und den LocalStorage-Key 'passiveIncomeCalculator'.
 * Keine weiteren Datenbanken (z.B. IndexedDB) werden angefasst.
 */
export const clearReduxCacheAndLocalStorage = (dispatch: Dispatch) => {
  dispatch(clearAllCache());
  dispatch(clearAllCharts());
  localStorage.removeItem('passiveIncomeCalculator');
};
