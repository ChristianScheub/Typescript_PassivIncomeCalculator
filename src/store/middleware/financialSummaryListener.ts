import { Middleware, MiddlewareAPI, AnyAction, Dispatch } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { calculateFinancialSummary, calculateAssetFocusData, invalidateFinancialSummary } from '@/store/slices/domain/transactionsSlice';
import Logger from '@/service/shared/logging/Logger/logger';

// Type guard to check if action has a type property
function isActionWithType(action: unknown): action is AnyAction {
  return typeof action === 'object' && action !== null && 'type' in action && typeof (action as AnyAction).type === 'string';
}

// Helper function to get required data for financial summary
const getFinancialData = (state: RootState) => ({
  assets: state.transactions?.items || [],
  assetDefinitions: state.assetDefinitions?.items || [],
  liabilities: state.liabilities?.items || [],
  expenses: state.expenses?.items || [],
  income: state.income?.items || [],
});

// Helper function to check if financial summary should be recalculated
const shouldRecalculateFinancialSummary = (state: RootState): boolean => {
  const hasData = state.transactions?.items?.length > 0 ||
                  state.assetDefinitions?.items?.length > 0 ||
                  state.income?.items?.length > 0 || 
                  state.expenses?.items?.length > 0 || 
                  state.liabilities?.items?.length > 0;
  
  const hasValidFinancialSummary = state.transactions?.cache?.financialSummary && 
    (state.transactions.cache.financialSummary.totalAssets > 0 || 
     state.transactions.cache.financialSummary.monthlyIncome > 0 || 
     state.transactions.cache.financialSummary.monthlyExpenses > 0 ||
     state.transactions.cache.financialSummary.totalLiabilities > 0);

  return hasData && !hasValidFinancialSummary;
};

// Helper function to check if asset focus data should be recalculated
const shouldRecalculateAssetFocusData = (state: RootState): boolean => {
  const hasAssets = state.transactions?.items?.length > 0;
  const hasAssetDefinitions = state.assetDefinitions?.items?.length > 0;
  const hasValidAssetFocusData = state.transactions?.cache?.assetFocusData && 
    state.transactions.cache.assetFocusData.assetsWithValues?.length > 0;

  return (hasAssets || hasAssetDefinitions) && !hasValidAssetFocusData;
};

// Middleware to automatically trigger financial summary and asset focus data recalculation when relevant data changes
export const financialSummaryMiddleware: Middleware<object, RootState> = (store: MiddlewareAPI<Dispatch, RootState>) => (next) => (action: unknown) => {
  const result = next(action);
  
  // Listen for successful data changes
  if (isActionWithType(action) && action.type.endsWith('/fulfilled')) {
    const { type } = action;
    
    // Check for data changes that should trigger financial summary recalculation
    const shouldTriggerRecalculation = (
      type.startsWith('income/') || 
      type.startsWith('expenses/') || 
      type.startsWith('liabilities/') ||
      type.startsWith('transactions/') ||
      type.startsWith('assetDefinitions/')
    ) && (
      type.includes('/add') || 
      type.includes('/update') || 
      type.includes('/delete') ||
      type.includes('/load') ||
      type.includes('/fetch')
    );
    
    if (shouldTriggerRecalculation) {
      Logger.info(`FinancialSummaryMiddleware: ${type} detected, checking if recalculation needed`);
      
      const state = store.getState();
      
      // Trigger financial summary recalculation
      if (shouldRecalculateFinancialSummary(state)) {
        Logger.info('FinancialSummaryMiddleware: Triggering financial summary recalculation');
        const financialData = getFinancialData(state);
        store.dispatch(calculateFinancialSummary(financialData) as any);
      } else {
        // Invalidate cache to force recalculation next time
        store.dispatch(invalidateFinancialSummary());
      }
      
      // Trigger asset focus data recalculation for asset/transaction changes
      if ((type.startsWith('transactions/') || type.startsWith('assetDefinitions/')) && 
          shouldRecalculateAssetFocusData(state)) {
        Logger.info('FinancialSummaryMiddleware: Triggering asset focus data recalculation');
        store.dispatch(calculateAssetFocusData() as any);
      }
    }
  }
  
  return result;
};

export default financialSummaryMiddleware;
