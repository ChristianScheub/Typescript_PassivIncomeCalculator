import { store } from '@/store';
import { 
    invalidatePortfolioCache, 
    calculatePortfolioData,
    fetchTransactions 
} from '@/store/slices/transactionsSlice';
import { fetchAssetDefinitions } from '@/store/slices/assetDefinitionsSlice';
import { 
    fetchAssetCategories,
    fetchAssetCategoryOptions,
    fetchAssetCategoryAssignments 
} from '@/store/slices/assetCategoriesSlice';
import { fetchLiabilities } from '@/store/slices/liabilitiesSlice';
import { fetchExpenses } from '@/store/slices/expensesSlice';
import { fetchIncome } from '@/store/slices/incomeSlice';
import { updateForecastValues } from '@/store/slices/forecastSlice';
import { 
    clearAllCache as clearCalculatedDataCache
} from '@/store/slices/calculatedDataSlice';
import { PortfolioHistoryHelper } from '@/service/domain/portfolio/history/portfolioHistoryService/methods/portfolioHistoryHelper';
import recentActivityService from '@/service/domain/analytics/reporting/recentActivityService';
import Logger from "@/service/shared/logging/Logger/logger";
import { calculatePortfolioIntradayDataDirect } from '@/store/slices/portfolioIntradaySlice';
import PortfolioHistoryWorker from '@/workers/portfolioHistoryWorker.ts?worker';

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
            store.dispatch(fetchTransactions()),
            store.dispatch(fetchAssetDefinitions()),
            store.dispatch(fetchAssetCategories()),
            store.dispatch(fetchAssetCategoryOptions()),
            store.dispatch(fetchAssetCategoryAssignments()),
            
            // Financial data
            store.dispatch(fetchLiabilities()),
            store.dispatch(fetchExpenses()),
            store.dispatch(fetchIncome())
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
            await store.dispatch(calculatePortfolioData({ 
                assetDefinitions, 
                categoryData: { categories, categoryOptions, categoryAssignments } 
            }));
        }

        // Step 8: Update ALL calculated values and derived data
        Logger.infoService("Updating ALL dashboard, forecast, and analytics values");
        await Promise.all([
            store.dispatch(updateForecastValues())
            // Note: 30-day history is now calculated directly from IndexedDB, no Redux action needed
        ]);

        // Step 9: Clear and recalculate portfolio history database with all time ranges
        Logger.infoService("Clearing and recalculating portfolio history database via Web Worker");
        // Hole aktuelle Daten für Worker
        const refreshedStateForWorker = store.getState();
        const portfolioPositionsForWorker = refreshedStateForWorker.transactions?.portfolioCache?.positions || [];
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
        const portfolioPositions = refreshedState.transactions?.portfolioCache?.positions || [];
        const portfolioCacheId = refreshedState.transactions?.portfolioCache?.id || 'default';
        const assetDefinitionsForIntraday = refreshedState.assetDefinitions?.items || [];
        if (portfolioPositions.length > 0 && assetDefinitionsForIntraday.length > 0) {
            await store.dispatch(
                calculatePortfolioIntradayDataDirect({
                    portfolioPositions,
                    portfolioCacheId,
                    assetDefinitions: assetDefinitionsForIntraday
                })
            );
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
