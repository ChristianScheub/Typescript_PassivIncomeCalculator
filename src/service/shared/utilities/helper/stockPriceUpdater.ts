import { AssetDefinition } from "@/types/domains/assets";
import Logger from "@/service/shared/logging/Logger/logger";
import stockAPIService, {
  createStockAPIServiceMethod,
} from "../../../domain/assets/market-data/stockAPIService";
import {
  updateAssetDefinitionPrice,
  cleanupOldPriceHistory,
} from "@/utils/priceHistoryUtils";
import { IStockAPIService } from "../../../domain/assets/market-data/stockAPIService/interfaces/IStockAPIService";
import { StockHistoryEntry } from "@/types/domains/assets/market-data";
import { TimeRangePeriod } from "@/types/shared/time";
import { getStore } from "@/store";

/**
 * Helper class to update stock prices in batch
 * Now works with AssetDefinitions instead of individual transactions
 */
export class StockPriceUpdater {
  /**
   * Updates stock prices for asset definitions
   * @param definitions Array of asset definitions (only stock types with tickers will be updated)
   * @returns Array of updated asset definitions with new prices and timestamps
   */ static async updateStockPrices(
    definitions: AssetDefinition[]
  ): Promise<AssetDefinition[]> {
    const stockDefinitionsToUpdate = definitions
      .filter(
        (definition) =>
          definition.type === "stock" &&
          definition.ticker &&
          definition.autoUpdatePrice === true // Only update if auto-update is enabled
      )
      .slice(0, 30);

    if (stockDefinitionsToUpdate.length === 0) {
      Logger.infoService(
        "No stock definitions with auto-update enabled to update"
      );
      return [];
    }

    Logger.infoService(
      `Updating prices for ${stockDefinitionsToUpdate.length} stock definitions with auto-update enabled`
    );

    try {
      // Get Redux state for provider/apiKeys
      const store = getStore();
      const apiConfig = store.getState().apiConfig;
      const stockAPI = createStockAPIServiceMethod(
        apiConfig.selectedProvider,
        apiConfig.apiKeys
      );
      const updatedDefinitions: AssetDefinition[] = [];

      for (const definition of stockDefinitionsToUpdate) {
        try {
          const updatedDefinition =
            await StockPriceUpdater.updateSingleDefinition(
              definition,
              stockAPI
            );
          if (updatedDefinition) {
            updatedDefinitions.push(updatedDefinition);
          }
        } catch (error) {
          Logger.error(
            `Failed to update price for ${definition.ticker}: ${error}`
          );
          throw error;
        }
      }

      Logger.infoService(
        `Successfully updated ${updatedDefinitions.length} stock definition prices`
      );
      Logger.infoService(
        `StockPriceUpdater: Updated prices for ${updatedDefinitions.length} stock definitions`
      );
      return updatedDefinitions;
    } catch (error) {
      Logger.error(`Stock API service not available: ${error}`);
      throw new Error(
        "Stock API service not available. Please check your API configuration in Settings."
      );
    }
  }

  private static async updateSingleDefinition(
    definition: AssetDefinition,
    stockAPI: IStockAPIService
  ): Promise<AssetDefinition | null> {
    const priceData = await stockAPI.getCurrentStockPrice(definition.ticker!);
    if (!priceData?.price) return null;

    const newPrice = priceData.price;

    // Use utility function to update price and manage history
    const updatedDefinition = updateAssetDefinitionPrice(
      definition,
      newPrice,
      "api"
    );

    // Clean up old price history to prevent unlimited growth
    const finalDefinition = {
      ...updatedDefinition,
      priceHistory: cleanupOldPriceHistory(updatedDefinition.priceHistory),
    };

    Logger.infoService(
      `Updated price for ${definition.ticker} (${definition.fullName}): ${newPrice}`
    );
    Logger.infoService(
      `Price history entries: ${finalDefinition.priceHistory?.length || 0}`
    );
    return finalDefinition;
  }

  /**
   * Updates historical data (30 days) for stock definitions
   * @param definitions Array of asset definitions (only stock types with tickers will be updated)
   * @returns Array of updated asset definitions with historical data
   */
  static async updateStockHistoricalData(
    definitions: AssetDefinition[]
  ): Promise<AssetDefinition[]> {
    const stockDefinitionsToUpdate = definitions
      .filter(
        (definition) =>
          definition.type === "stock" &&
          definition.ticker &&
          definition.autoUpdateHistoricalPrices === true // Only update if auto-update is enabled
      )
      .slice(0, 10); // Limit to prevent API overload

    if (stockDefinitionsToUpdate.length === 0) {
      Logger.infoService(
        "No stock definitions with auto-update historical prices enabled to update"
      );
      return [];
    }

    Logger.infoService(
      `Fetching 30-day historical data for ${stockDefinitionsToUpdate.length} stock definitions with auto-update enabled`
    );

    // Get Redux state for provider/apiKeys
    const store = getStore();
    const apiConfig = store.getState().apiConfig;
    const stockAPI = createStockAPIServiceMethod(
      apiConfig.selectedProvider,
      apiConfig.apiKeys
    );
    const updatedDefinitions: AssetDefinition[] = [];

    for (const definition of stockDefinitionsToUpdate) {
      const historicalData = await stockAPI.getHistory30Days(
        definition.ticker!
      );

      if (historicalData?.data && historicalData.data.length > 0) {
        // Convert historical data to price history format and update definition
        const priceHistory =
          historicalData.data?.map((entry: StockHistoryEntry) => ({
            date: entry.date,
            price: entry.close,
            source: "api" as const,
          })) || [];

        const updatedDefinition = {
          ...definition,
          priceHistory: [...(definition.priceHistory || []), ...priceHistory]
            .filter(
              (entry, index, arr) =>
                // Remove duplicates by date and source
                arr.findIndex(
                  (e) => e.date === entry.date && e.source === entry.source
                ) === index
            )
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            ),
          lastPriceUpdate: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Clean up old entries
        const finalDefinition = {
          ...updatedDefinition,
          priceHistory: cleanupOldPriceHistory(updatedDefinition.priceHistory),
        };

        updatedDefinitions.push(finalDefinition);
        Logger.infoService(
          `Updated historical data for ${definition.ticker} (${definition.fullName}): ${historicalData.data.length} entries`
        );
      }
    }

    Logger.infoService(
      `Successfully updated historical data for ${updatedDefinitions.length} stock definitions`
    );
    Logger.infoService(
      `StockPriceUpdater: Updated historical data for ${updatedDefinitions.length} stock definitions`
    );
    return updatedDefinitions;
  }

  /**
   * Updates historical data for stock definitions with specific time period
   * @param definitions Array of asset definitions (only stock types with tickers will be updated)
   * @param period Time period for historical data (e.g., "1d", "1mo", "1y", etc.)
   * @returns Array of updated asset definitions with historical data
   */
  static async updateStockHistoricalDataWithPeriod(
    definitions: AssetDefinition[],
    period: TimeRangePeriod
  ): Promise<AssetDefinition[]> {
    const stockDefinitionsToUpdate = definitions.filter(
      (definition) => definition.type === "stock" && definition.ticker
    );

    if (stockDefinitionsToUpdate.length === 0) {
      Logger.infoService(
        "No stock definitions found to update historical data"
      );
      return [];
    }

    Logger.infoService(
      `Updating historical data (${period}) for ${stockDefinitionsToUpdate.length} stock definitions`
    );

    try {
      // Get Redux state for provider/apiKeys
      const store = getStore();
      const apiConfig = store.getState().apiConfig;
      const stockAPI = createStockAPIServiceMethod(
        apiConfig.selectedProvider,
        apiConfig.apiKeys
      );
      const updatedDefinitions: AssetDefinition[] = [];

      for (const definition of stockDefinitionsToUpdate) {
        try {
          // Use the fetchChart method directly through the YahooAPIService to support custom periods
          const historicalData = await this.fetchHistoricalDataWithPeriod(
            stockAPI,
            definition.ticker!,
            period
          );

          if (historicalData?.data && historicalData.data.length > 0) {
            // Convert historical data to price history format and update definition
            const priceHistory =
              historicalData.data?.map((entry: StockHistoryEntry) => ({
                date: entry.date,
                price: entry.close,
                source: "api" as const,
              })) || [];

            const updatedDefinition = {
              ...definition,
              priceHistory: [
                ...(definition.priceHistory || []),
                ...priceHistory,
              ]
                .filter(
                  (entry, index, arr) =>
                    // Remove duplicates by date and source
                    arr.findIndex(
                      (e) => e.date === entry.date && e.source === entry.source
                    ) === index
                )
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                ),
              lastPriceUpdate: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            // Clean up old entries
            const finalDefinition = {
              ...updatedDefinition,
              priceHistory: cleanupOldPriceHistory(
                updatedDefinition.priceHistory,
                1000
              ), // Keep more entries for longer periods
            };

            updatedDefinitions.push(finalDefinition);
            Logger.infoService(
              `Updated historical data (${period}) for ${definition.ticker} (${definition.fullName}): ${historicalData.data.length} entries`
            );
          }
        } catch (error) {
          Logger.error(
            `Failed to update historical data for ${definition.ticker}: ${error}`
          );
          throw error;
        }
      }

      Logger.infoService(
        `Successfully updated historical data (${period}) for ${updatedDefinitions.length} stock definitions`
      );
      return updatedDefinitions;
    } catch (error) {
      Logger.error(
        `Stock API service not available for historical data: ${error}`
      );
      throw new Error(
        "Stock API service not available. Please check your API configuration in Settings."
      );
    }
  }

  /**
   * Fetch historical data with a specific period using the API service
   * @param stockAPI The stock API service instance
   * @param ticker The stock ticker symbol
   * @param period The time period for historical data
   * @returns Historical stock data
   */
  private static async fetchHistoricalDataWithPeriod(
    stockAPI: IStockAPIService,
    ticker: string,
    period: TimeRangePeriod
  ) {
    // Convert period to days for APIs that need days parameter
    const periodToDays: Record<TimeRangePeriod, number> = {
      "1d": 1,
      "5d": 5,
      "1mo": 30,
      "3mo": 90,
      "6mo": 180,
      "1y": 365,
      "2y": 730,
      "5y": 1825,
      "10y": 3650,
      ytd: this.calculateYTDDays(),
      max: 3650, // Use 10 years as "max" to avoid excessive data
    };

    const days = periodToDays[period];
    Logger.infoService(
      `Fetching ${period} (${days} days) of historical data for ${ticker}`
    );

    // Use the getHistory method with calculated days
    return await stockAPI.getHistory(ticker, days);
  }

  /**
   * Calculate the number of days from the beginning of the year to today
   * @returns Number of days since January 1st
   */
  private static calculateYTDDays(): number {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const diffTime = Math.abs(now.getTime() - startOfYear.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
