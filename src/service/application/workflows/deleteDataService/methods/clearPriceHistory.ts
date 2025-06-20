import { store } from '../../../../../store';
import { invalidatePortfolioCache } from '@/store/slices/transactionsSlice';
import Logger from "@/service/shared/logging/Logger/logger";
import sqliteService from '../../../../infrastructure/sqlLiteService';

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

    // Invalidate cache
    store.dispatch(invalidatePortfolioCache());

    Logger.infoService("Price history cleared successfully");
}
