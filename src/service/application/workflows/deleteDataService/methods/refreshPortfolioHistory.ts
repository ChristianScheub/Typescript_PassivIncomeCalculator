import { store } from '@/store';
import { 
    calculatePortfolioHistory,
    calculateAssetFocusData,
    calculateFinancialSummary
} from '@/store/slices/cache';
import { AssetFocusTimeRange } from '@/types/shared/analytics';
import Logger from "@/service/shared/logging/Logger/logger";

/**
 * Clears and recalculates all portfolio history data
 * This includes:
 * - Clearing portfolio history database
 * - Recalculating all portfolio history for different time ranges
 * - Recalculating asset focus data
 * - Recalculating financial summary
 * - Recalculating 30-day history
 */
export async function refreshPortfolioHistory(): Promise<void> {
    Logger.infoService("Starting to refresh portfolio history data");

    try {
        // Import here to avoid circular dependencies
        const { clearPortfolioHistory } = await import('./clearPortfolioHistory');
        
        // Step 1: Clear existing portfolio history database
        Logger.infoService("Clearing existing portfolio history database");
        await clearPortfolioHistory();

        // Step 2: Define time ranges for recalculation
        const timeRanges: AssetFocusTimeRange[] = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];

        // Step 3: Recalculate portfolio history for all time ranges
        Logger.infoService("Recalculating portfolio history for all time ranges");
        for (const timeRange of timeRanges) {
            Logger.infoService(`Calculating portfolio history for timeRange: ${timeRange}`);
            await store.dispatch(calculatePortfolioHistory({ timeRange }));
        }

        // Step 4: Recalculate other calculated data
        Logger.infoService("Recalculating calculated data");
        await Promise.all([
            store.dispatch(calculateFinancialSummary()),
            store.dispatch(calculateAssetFocusData())
            // Note: 30-day history is now calculated directly from IndexedDB, no Redux action needed
        ]);

        Logger.infoService("Portfolio history refresh completed successfully - all data recalculated");
        
    } catch (error) {
        Logger.error("Failed to refresh portfolio history: " + JSON.stringify(error));
        throw error;
    }
}
