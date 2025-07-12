import { store } from '@/store';
import { 
    invalidatePortfolioCache, 
    calculatePortfolioData,
    fetchTransactions 
} from '@/store/slices/domain';
import { fetchAssetDefinitions } from '@/store/slices/domain';
import { 
    fetchAssetCategories,
    fetchAssetCategoryOptions,
    fetchAssetCategoryAssignments 
} from '@/store/slices/domain';
import { fetchLiabilities } from '@/store/slices/domain';
import { fetchExpenses } from '@/store/slices/domain';
import { fetchIncome } from '@/store/slices/domain';
import { updateForecastValues } from '@/store/slices/cache';
import { 
    clearAllCache as clearCalculatedDataCache
} from '@/store/slices/cache';
import { PortfolioHistoryHelper } from '@/service/domain/portfolio/history/portfolioHistoryService/methods/portfolioHistoryHelper';
import recentActivityService from '@/service/domain/analytics/reporting/recentActivityService';
import Logger from "@/service/shared/logging/Logger/logger";
import { calculatePortfolioIntradayDataDirect } from '@/store/slices/cache';
import PortfolioHistoryWorker from '@/workers/portfolioHistoryWorker.ts?worker';
import type { ThunkDispatch, AnyAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store';

/**
 * Refreshes all caches in the application (e.g. for pull to refresh)
 * This includes:
 * - Clearing all dividend caches
 * - Clearing portfolio cache  
 * - Clearing portfolio history cache
 * - Clearing calculated data cache (new caching system)
 * - Invalidating ALL Redux caches
 * - Recalculating ALL data from SQL database (assets, liabilities, income, expenses, etc.)
 * - Updating all derived calculations (dashboard, forecast, analytics)
 * - Recalculating new calculated data cache (portfolio history, asset focus, financial summary)
 */
export async function refreshAllCaches(): Promise<void> {
    Logger.cache("Starting COMPLETE cache refresh for ALL data");

    // Cast store.dispatch for AsyncThunk actions
    const thunkDispatch = store.dispatch as ThunkDispatch<RootState, unknown, AnyAction>;

    try {
        // Step 1: Clear all dividend caches
        Logger.infoService("Clearing dividend caches");
        // Individual dividend caches are now managed per asset basis

        // Step 2: Clear portfolio cache
        Logger.infoService("Clearing portfolio cache");
        store.dispatch(invalidatePortfolioCache());

        // Step 3: Clear portfolio history caches
        Logger.infoService("Clearing portfolio history caches");
        PortfolioHistoryHelper.clearCaches();

        // Step 4: Clear calculated data cache (new caching system)
        Logger.infoService("Clearing calculated data cache");
        store.dispatch(clearCalculatedDataCache());

        // Step 5: Clear ALL service caches and activity histories
        Logger.infoService("Clearing recent activity history");
        recentActivityService.clearActivities(); // Clear all activity types

        // Step 6: Refetch ALL data from SQL database
        Logger.infoService("Refetching ALL data from SQL database");
        
        // Fetch ALL core data in parallel
        await Promise.all([
            // Asset-related data
            thunkDispatch(fetchTransactions()).unwrap(),
            thunkDispatch(fetchAssetDefinitions()).unwrap(),
            thunkDispatch(fetchAssetCategories()).unwrap(),
            thunkDispatch(fetchAssetCategoryOptions()).unwrap(),
            thunkDispatch(fetchAssetCategoryAssignments()).unwrap(),
            
            // Financial data
            thunkDispatch(fetchLiabilities()).unwrap(),
            thunkDispatch(fetchExpenses()).unwrap(),
            thunkDispatch(fetchIncome()).unwrap()
        ]);

        // Step 7: Wait for data to be available, then recalculate derived data
        Logger.infoService("Recalculating ALL derived data");
        
        // Get fresh data from store
        const state = store.getState();
        const { items: assets } = state.transactions;
        const { items: assetDefinitions } = state.assetDefinitions;
        const { categories, categoryOptions, categoryAssignments } = state.assetCategories;
        const { items: liabilities } = state.liabilities;
        const { items: expenses } = state.expenses;
        const { items: income } = state.income;

        Logger.infoService(`Refreshed data counts: Assets: ${assets.length}, Liabilities: ${liabilities.length}, Income: ${income.length}, Expenses: ${expenses.length}`);

        // Recalculate portfolio data with fresh data
        if (assets.length > 0 && assetDefinitions.length > 0) {
            await thunkDispatch(calculatePortfolioData({ 
                assetDefinitions, 
                categoryData: { categories, categoryOptions, categoryAssignments } 
            }));
        }

        // Step 8: Update ALL calculated values and derived data
        Logger.infoService("Updating ALL dashboard, forecast, and analytics values");
        await Promise.all([
            thunkDispatch(updateForecastValues())
            // Note: 30-day history is now calculated directly from IndexedDB, no Redux action needed
        ]);

        // Step 9: Clear and recalculate portfolio history database with all time ranges
        Logger.infoService("Clearing and recalculating portfolio history database via Web Worker");
        // Hole aktuelle Daten für Worker
        const refreshedStateForWorker = store.getState();
        const portfolioPositionsForWorker = refreshedStateForWorker.transactions?.cache?.positions || [];
        const assetDefinitionsForHistory = refreshedStateForWorker.assetDefinitions?.items || [];
        if (portfolioPositionsForWorker.length > 0 && assetDefinitionsForHistory.length > 0) {
            const worker = new PortfolioHistoryWorker();
            const workerPromise = new Promise((resolve, reject) => {
                worker.onmessage = async (event) => {
                    const { type, history, error } = event.data || {};
                    if (type === 'resultAll' && history) {
                        const portfolioHistoryService = (await import('@/service/infrastructure/sqlLitePortfolioHistory')).default;
                        await portfolioHistoryService.bulkAddPortfolioHistory(history);
                        Logger.infoService('✅ Portfolio history updated via Web Worker');
                        resolve(null);
                    } else if (type === 'error') {
                        Logger.error('❌ Worker error: ' + error);
                        reject(error);
                    }
                };
                worker.postMessage({
                    type: 'calculateAll',
                    params: {
                        assetDefinitions: assetDefinitionsForHistory,
                        portfolioPositions: portfolioPositionsForWorker
                    }
                });
            });
            await workerPromise;
        } else {
            Logger.warn('No portfolio positions or asset definitions found for portfolio history aggregation after cache refresh');
        }

        Logger.infoService("COMPLETE cache refresh completed successfully - ALL data refreshed from SQL database");

        // Step 10: Trigger portfolio intraday aggregation with latest data
        const refreshedState = store.getState();
        const portfolioPositions = refreshedState.transactions?.cache?.positions || [];
        const assetDefinitionsForIntraday = refreshedState.assetDefinitions?.items || [];
        // No id property on cache, use 'default' or generate as needed
        const portfolioCacheId = 'default';
        if (portfolioPositions.length > 0 && assetDefinitionsForIntraday.length > 0) {
            await thunkDispatch(calculatePortfolioIntradayDataDirect({
                portfolioCacheId
                // Add dateRange if needed
            }));
            Logger.infoService('Triggered portfolio intraday aggregation after full cache refresh');
        } else {
            Logger.warn('No portfolio positions or asset definitions found for intraday aggregation after cache refresh');
        }
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error : new Error(JSON.stringify(error));
        Logger.error("Failed to refresh ALL caches: " + errorMessage.message);
        throw errorMessage;
    }
}
