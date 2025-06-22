import portfolioHistoryService from '../../../../infrastructure/sqlLitePortfolioHistory';
import Logger from "@/service/shared/logging/Logger/logger";

/**
 * Clears all portfolio history data from the portfolio-history database
 * This includes:
 * - portfolioHistory (daily snapshots)
 * - portfolioIntradayData (portfolio value over time)
 */
export async function clearPortfolioHistory(): Promise<void> {
    Logger.infoService("Starting to clear portfolio history database");

    try {
        // Clear both stores in the portfolio history database
        await Promise.all([
            portfolioHistoryService.clearStore('portfolioHistory'),
            portfolioHistoryService.clearStore('portfolioIntradayData')
        ]);

        Logger.infoService("Portfolio history database cleared successfully - all stores cleared");
    } catch (error) {
        Logger.error("Failed to clear portfolio history database: " + JSON.stringify(error));
        throw error;
    }
}
