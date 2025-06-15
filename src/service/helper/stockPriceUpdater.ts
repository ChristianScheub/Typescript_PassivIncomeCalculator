import { AssetDefinition } from '../../types';
import Logger from '../Logger/logger';
import stockAPIService from '../stockAPIService';
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
   */  static async updateStockPrices(definitions: AssetDefinition[]): Promise<AssetDefinition[]> {
    const stockDefinitionsToUpdate = definitions
      .filter(definition => 
        definition.type === 'stock' && 
        definition.ticker && 
        definition.autoUpdatePrice === true  // Only update if auto-update is enabled
      )
      .slice(0, 30);

    if (stockDefinitionsToUpdate.length === 0) {
      Logger.infoService('No stock definitions with auto-update enabled to update');
      return [];
    }
    
    Logger.infoService(`Updating prices for ${stockDefinitionsToUpdate.length} stock definitions with auto-update enabled`);
    
    try {
      const stockAPI = stockAPIService.createStockAPIService();
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
      
      Logger.infoService(`Successfully updated ${updatedDefinitions.length} stock definition prices`);
      Logger.infoService(`StockPriceUpdater: Updated prices for ${updatedDefinitions.length} stock definitions`);
      return updatedDefinitions;
    } catch (error) {
      Logger.error(`Stock API service not available: ${error}`);
      throw new Error('Stock API service not available. Please check your API configuration in Settings.');
    }
  }

  private static async updateSingleDefinition(definition: AssetDefinition, stockAPI: any): Promise<AssetDefinition | null> {
    const priceData = await stockAPI.getCurrentStockPrice(definition.ticker!);
    if (!priceData?.price) return null;

    const newPrice = priceData.price;
    
    // Use utility function to update price and manage history
    const updatedDefinition = updateAssetDefinitionPrice(definition, newPrice, 'api');
    
    // Clean up old price history to prevent unlimited growth
    const finalDefinition = {
      ...updatedDefinition,
      priceHistory: cleanupOldPriceHistory(updatedDefinition.priceHistory)
    };
    
    Logger.infoService(`Updated price for ${definition.ticker} (${definition.fullName}): ${newPrice}`);
    Logger.infoService(`Price history entries: ${finalDefinition.priceHistory?.length || 0}`);
    return finalDefinition;
  }

  /**
   * Updates historical data (30 days) for stock definitions
   * @param definitions Array of asset definitions (only stock types with tickers will be updated)
   * @returns Array of updated asset definitions with historical data
   */
  static async updateStockHistoricalData(definitions: AssetDefinition[]): Promise<AssetDefinition[]> {
    const stockDefinitionsToUpdate = definitions
      .filter(definition => 
        definition.type === 'stock' && 
        definition.ticker && 
        definition.autoUpdateHistoricalPrices === true  // Only update if auto-update is enabled
      )
      .slice(0, 10); // Limit to prevent API overload

    if (stockDefinitionsToUpdate.length === 0) {
      Logger.infoService('No stock definitions with auto-update historical prices enabled to update');
      return [];
    }
    
    Logger.infoService(`Fetching 30-day historical data for ${stockDefinitionsToUpdate.length} stock definitions with auto-update enabled`);
    
    try {
      const stockAPI = stockAPIService.createStockAPIService();
      const updatedDefinitions: AssetDefinition[] = [];

      for (const definition of stockDefinitionsToUpdate) {
        try {
          const historicalData = await stockAPI.getHistory30Days(definition.ticker!);
          
          if (historicalData?.data && historicalData.data.length > 0) {
            // Convert historical data to price history format and update definition
            const priceHistory = historicalData.data.map((entry: any) => ({
              date: entry.date,
              price: entry.close,
              source: 'api' as const
            }));

            const updatedDefinition = {
              ...definition,
              priceHistory: [...(definition.priceHistory || []), ...priceHistory]
                .filter((entry, index, arr) => 
                  // Remove duplicates by date and source
                  arr.findIndex(e => e.date === entry.date && e.source === entry.source) === index
                )
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
              lastPriceUpdate: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };

            // Clean up old entries
            const finalDefinition = {
              ...updatedDefinition,
              priceHistory: cleanupOldPriceHistory(updatedDefinition.priceHistory)
            };

            updatedDefinitions.push(finalDefinition);
            Logger.infoService(`Updated historical data for ${definition.ticker} (${definition.fullName}): ${historicalData.data.length} entries`);
          }
        } catch (error) {
          Logger.error(`Failed to update historical data for ${definition.ticker}: ${error}`);
        }
      }
      
      Logger.infoService(`Successfully updated historical data for ${updatedDefinitions.length} stock definitions`);
      Logger.infoService(`StockPriceUpdater: Updated historical data for ${updatedDefinitions.length} stock definitions`);
      return updatedDefinitions;
    } catch (error) {
      Logger.error(`Stock API service not available for historical data: ${error}`);
      throw new Error('Stock API service not available. Please check your API configuration in Settings.');
    }
  }
}
