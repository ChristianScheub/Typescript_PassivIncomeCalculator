import { store } from '../../../../../store';
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
import { updateDashboardValues } from '@/store/slices/dashboardSlice';
import { calculate30DayHistory } from '@/store/slices/portfolioHistorySlice';
import { updateForecastValues } from '@/store/slices/forecastSlice';
import { PortfolioHistoryHelper } from '../../../../domain/portfolio/history/portfolioHistoryService/methods/portfolioHistoryHelper';
import recentActivityService from '../../../../domain/analytics/reporting/recentActivityService';
import Logger from "@/service/shared/logging/Logger/logger";

/**
 * Refreshes all caches in the application
 * This includes:
 * - Clearing all dividend caches
 * - Clearing portfolio cache  
 * - Clearing portfolio history cache
 * - Invalidating ALL Redux caches
 * - Recalculating ALL data from SQL database (assets, liabilities, income, expenses, etc.)
 * - Updating all derived calculations (dashboard, forecast, analytics)
 */
export async function refreshAllCaches(): Promise<void> {
    Logger.infoService("Starting COMPLETE cache refresh for ALL data");

    try {
        // Step 1: Clear all dividend caches
        Logger.infoService("Clearing dividend caches");
        // TODO: Handle individual asset dividend cache invalidation if needed
        // Individual dividend caches are now managed per asset basis

        // Step 2: Clear portfolio cache
        Logger.infoService("Clearing portfolio cache");
        store.dispatch(invalidatePortfolioCache());

        // Step 3: Clear portfolio history caches
        Logger.infoService("Clearing portfolio history caches");
        PortfolioHistoryHelper.clearCaches();

        // Step 4: Clear ALL service caches and activity histories
        Logger.infoService("Clearing recent activity history");
        recentActivityService.clearActivities(); // Clear all activity types

        // Step 5: Refetch ALL data from SQL database
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

        // Step 6: Wait for data to be available, then recalculate derived data
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

        // Step 7: Update ALL calculated values and derived data
        Logger.infoService("Updating ALL dashboard, forecast, and analytics values");
        await Promise.all([
            store.dispatch(updateDashboardValues()),
            store.dispatch(updateForecastValues()),
            store.dispatch(calculate30DayHistory())
        ]);

        Logger.infoService("COMPLETE cache refresh completed successfully - ALL data refreshed from SQL database");
        
    } catch (error) {
        Logger.error("Failed to refresh ALL caches: " + JSON.stringify(error));
        throw error;
    }
}
