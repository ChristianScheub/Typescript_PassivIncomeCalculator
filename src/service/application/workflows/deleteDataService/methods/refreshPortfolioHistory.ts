import { store } from '@/store';
import { 
    calculatePortfolioHistory,
    calculateAssetFocusData,
    calculateFinancialSummary
} from '@/store/slices/domain/transactionsSlice'; // MIGRATED: Now in consolidated cache
import { AssetFocusTimeRange } from '@/types/shared/analytics';
import Logger from "@/service/shared/logging/Logger/logger";
import type { ThunkDispatch, AnyAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store';

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

    // Cast store.dispatch for AsyncThunk actions
    const thunkDispatch = store.dispatch as ThunkDispatch<RootState, unknown, AnyAction>;

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
            await thunkDispatch(calculatePortfolioHistory({ timeRange }));
        }

        // Step 4: Recalculate other calculated data
        Logger.infoService("Recalculating calculated data");
        const state = store.getState();
        await Promise.all([
            thunkDispatch(calculateFinancialSummary({
                liabilities: state.liabilities.items,
                expenses: state.expenses.items,
                income: state.income.items
            })),
            thunkDispatch(calculateAssetFocusData())
            // Note: 30-day history is now calculated directly from IndexedDB, no Redux action needed
        ]);

        Logger.infoService("Portfolio history refresh completed successfully - all data recalculated");
        
    } catch (error) {
        Logger.error("Failed to refresh portfolio history: " + JSON.stringify(error));
        throw error;
    }
}
