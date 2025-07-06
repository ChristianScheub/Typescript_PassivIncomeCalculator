import { store } from '@/store';
import { invalidatePortfolioCache } from '@/store/slices/domain';
import Logger from "@/service/shared/logging/Logger/logger";
import { clearPortfolioHistory } from './clearPortfolioHistory';
import sqliteService from '@/service/infrastructure/sqlLiteService';

export async function clearPriceHistory(): Promise<void> {
    Logger.infoService("Starting to clear price history");

    // Update asset definitions to remove price history
    const definitions = await sqliteService.getAll("assetDefinitions");
    for (const def of definitions) {
        if (def.id) {
            def.priceHistory = [];
            def.currentPrice = undefined;
            await sqliteService.update("assetDefinitions", def);
        }
    }

    // Clear portfolio history database as it's based on price history
    Logger.infoService("Clearing portfolio history database as it's based on price history");
    await clearPortfolioHistory();

    // Invalidate cache
    store.dispatch(invalidatePortfolioCache());

    Logger.infoService("Price history and portfolio history cleared successfully");
}
