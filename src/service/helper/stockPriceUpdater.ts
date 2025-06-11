import { AssetDefinition } from '../../types';
import Logger from '../Logger/logger';
import { createStockAPIService } from '../stockAPIService';
import { isApiKeyConfigured } from '../stockAPIService/utils/fetch';
import { updateAssetDefinitionPrice, cleanupOldPriceHistory } from '../../utils/priceHistoryUtils';

/**
 * Helper class to update stock prices in batch
 * Now works with AssetDefinitions instead of individual transactions
 */
export class StockPriceUpdater {
  /**
   * Updates stock prices for asset definitions
   * @param definitions Array of asset definitions (only stock types with tickers will be updated)
   * @returns Array of updated asset definitions with new prices and timestamps
   */
  static async updateStockPrices(definitions: AssetDefinition[]): Promise<AssetDefinition[]> {
    if (!isApiKeyConfigured()) {
      throw new Error('API key not configured. Please set your Finnhub API key in Settings.');
    }

    const stockDefinitionsToUpdate = definitions
      .filter(definition => 
        definition.type === 'stock' && 
        definition.ticker && 
        definition.autoUpdatePrice === true  // Only update if auto-update is enabled
      )
      .slice(0, 30);

    if (stockDefinitionsToUpdate.length === 0) {
      Logger.info('No stock definitions with auto-update enabled to update');
      return [];
    }

    Logger.info(`Updating prices for ${stockDefinitionsToUpdate.length} stock definitions with auto-update enabled`);
    const stockAPI = createStockAPIService();
    const updatedDefinitions: AssetDefinition[] = [];

    for (const definition of stockDefinitionsToUpdate) {
      try {
        const updatedDefinition = await StockPriceUpdater.updateSingleDefinition(definition, stockAPI);
        if (updatedDefinition) {
          updatedDefinitions.push(updatedDefinition);
        }
      } catch (error) {
        Logger.error(`Failed to update price for ${definition.ticker}: ${error}`);
      }
    }

    Logger.info(`Successfully updated ${updatedDefinitions.length} stock definition prices`);
    return updatedDefinitions;
  }

  private static async updateSingleDefinition(definition: AssetDefinition, stockAPI: any): Promise<AssetDefinition | null> {
    const quote = await stockAPI.getQuote(definition.ticker!);
    if (!quote?.price) return null;

    const newPrice = quote.price;
    
    // Use utility function to update price and manage history
    const updatedDefinition = updateAssetDefinitionPrice(definition, newPrice, 'api');
    
    // Clean up old price history to prevent unlimited growth
    const finalDefinition = {
      ...updatedDefinition,
      priceHistory: cleanupOldPriceHistory(updatedDefinition.priceHistory)
    };
    
    Logger.info(`Updated price for ${definition.ticker} (${definition.fullName}): ${newPrice}`);
    Logger.info(`Price history entries: ${finalDefinition.priceHistory?.length || 0}`);
    return finalDefinition;
  }
}
