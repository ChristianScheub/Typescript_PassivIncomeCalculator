import { AssetDefinition } from "@/types/domains/assets";
import Logger from "@/service/shared/logging/Logger/logger";
import stockAPIService from "@/service/domain/assets/market-data/stockAPIService";
import {
  updateAssetDefinitionPrice,
  cleanupOldPriceHistory,
} from "@/utils/priceHistoryUtils";
import { IStockAPIService } from "@/service/domain/assets/market-data/stockAPIService/interfaces/IStockAPIService";
import { StockHistoryEntry } from "@/types/domains/assets/market-data";
import { TimeRangePeriod } from "@/types/shared/time";

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
  static async updateStockPrices(
    definitions: AssetDefinition[],
    apiKeys?: Record<string, string | undefined>,
    selectedProvider?: string
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

    // Fehlerhafte Ticker sammeln
    const failedTickers: { ticker: string; name: string }[] = [];
    const updatedDefinitions: AssetDefinition[] = [];

    // Dynamische API-Service-Auswahl (Worker: API-Keys und Provider werden übergeben)
    let stockAPI: IStockAPIService = stockAPIService;
    if (apiKeys && selectedProvider) {
      // Use dynamic import for provider selection
      const { StockAPIProvider } = await import("@/types/shared/base/enums");
      const apiKey = apiKeys[selectedProvider.toLowerCase()];
      Logger.infoService(`[StockPriceUpdater] Provider: ${selectedProvider}, apiKeys: ${JSON.stringify(apiKeys)}, verwendeter apiKey: ${apiKey}`);
      switch (selectedProvider) {
        case StockAPIProvider.FINNHUB: {
          const { FinnhubAPIService } = await import("@/service/domain/assets/market-data/stockAPIService/providers/FinnhubAPIService");
          stockAPI = new FinnhubAPIService(apiKey);
          break;
        }
        case StockAPIProvider.YAHOO: {
          const { YahooAPIService } = await import("@/service/domain/assets/market-data/stockAPIService/providers/YahooAPIService");
          stockAPI = new YahooAPIService();
          break;
        }
        case StockAPIProvider.ALPHA_VANTAGE: {
          const { AlphaVantageAPIService } = await import("@/service/domain/assets/market-data/stockAPIService/providers/AlphaVantageAPIService");
          stockAPI = new AlphaVantageAPIService(apiKey);
          break;
        }
        case StockAPIProvider.IEX_CLOUD: {
          const { IEXCloudAPIService } = await import("@/service/domain/assets/market-data/stockAPIService/providers/IEXCloudAPIService");
          stockAPI = new IEXCloudAPIService(apiKey);
          break;
        }
        case StockAPIProvider.TWELVE_DATA: {
          const { TwelveDataAPIService } = await import("@/service/domain/assets/market-data/stockAPIService/providers/TwelveDataAPIService");
          stockAPI = new TwelveDataAPIService(apiKey);
          break;
        }
        case StockAPIProvider.QUANDL: {
          const { QuandlAPIService } = await import("@/service/domain/assets/market-data/stockAPIService/providers/QuandlAPIService");
          stockAPI = new QuandlAPIService(apiKey);
          break;
        }
        case StockAPIProvider.EOD_HISTORICAL_DATA: {
          const { EODHistoricalDataAPIService } = await import("@/service/domain/assets/market-data/stockAPIService/providers/EODHistoricalDataAPIService");
          stockAPI = new EODHistoricalDataAPIService(apiKey);
          break;
        }
        case StockAPIProvider.POLYGON_IO: {
          const { PolygonIOAPIService } = await import("@/service/domain/assets/market-data/stockAPIService/providers/PolygonIOAPIService");
          stockAPI = new PolygonIOAPIService(apiKey);
          break;
        }
        default:
          throw new Error('Kein unterstützter Stock API Provider ausgewählt!');
      }
    }

    for (const definition of stockDefinitionsToUpdate) {
      try {
        // Inline logic from updateSingleDefinition
        const priceData = await stockAPI.getCurrentStockPrice(definition.ticker!);
        if (!priceData?.price) throw new Error("No price data available");

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
        updatedDefinitions.push(finalDefinition);
      } catch (error) {
        Logger.error(
          `Failed to update price for ${definition.ticker}: ${error}`
        );
        failedTickers.push({ ticker: definition.ticker!, name: definition.fullName });
        // NICHT throwen, sondern weitermachen
      }
    }

    Logger.infoService(
      `Successfully updated ${updatedDefinitions.length} stock definition prices`
    );
    Logger.infoService(
      `StockPriceUpdater: Updated prices for ${updatedDefinitions.length} stock definitions`
    );

    // Am Ende: Alert für fehlgeschlagene Ticker (nur im Browser-Kontext)
    if (failedTickers.length > 0 && typeof window !== 'undefined') {
      const msg =
        "Für folgende Assets konnte kein Preis abgerufen werden:\n" +
        failedTickers.map(f => `${f.ticker} (${f.name})`).join("\n");
      window.alert(msg);
    }

    return updatedDefinitions;
  }

  /**
   * Updates historical data (30 days) for stock definitions
   * @param definitions Array of asset definitions (only stock types with tickers will be updated)
   * @param apiKeys Optional API keys for providers
   * @param selectedProvider Optional selected API provider
   * @returns Array of updated asset definitions with historical data
   */
  static async updateStockHistoricalData(
    definitions: AssetDefinition[],
    apiKeys?: Record<string, string | undefined>,
    selectedProvider?: string
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

    // Dynamische API-Service-Auswahl (Worker: API-Keys und Provider werden übergeben)
    let stockAPI: IStockAPIService = stockAPIService;
    if (apiKeys && selectedProvider) {
      // Use dynamic import for provider selection
      const { StockAPIProvider } = await import("@/types/shared/base/enums");
      const apiKey = apiKeys[selectedProvider.toLowerCase()];
      Logger.infoService(`[StockPriceUpdater] Historical Data Provider: ${selectedProvider}, apiKeys: ${JSON.stringify(apiKeys)}, verwendeter apiKey: ${apiKey}`);
      switch (selectedProvider) {
        case StockAPIProvider.FINNHUB: {
          const { FinnhubAPIService } = await import("@/service/domain/assets/market-data/stockAPIService/providers/FinnhubAPIService");
          stockAPI = new FinnhubAPIService(apiKey);
          break;
        }
        case StockAPIProvider.YAHOO: {
          const { YahooAPIService } = await import("@/service/domain/assets/market-data/stockAPIService/providers/YahooAPIService");
          stockAPI = new YahooAPIService();
          break;
        }
        case StockAPIProvider.ALPHA_VANTAGE: {
          const { AlphaVantageAPIService } = await import("@/service/domain/assets/market-data/stockAPIService/providers/AlphaVantageAPIService");
          stockAPI = new AlphaVantageAPIService(apiKey);
          break;
        }
        case StockAPIProvider.IEX_CLOUD: {
          const { IEXCloudAPIService } = await import("@/service/domain/assets/market-data/stockAPIService/providers/IEXCloudAPIService");
          stockAPI = new IEXCloudAPIService(apiKey);
          break;
        }
        case StockAPIProvider.TWELVE_DATA: {
          const { TwelveDataAPIService } = await import("@/service/domain/assets/market-data/stockAPIService/providers/TwelveDataAPIService");
          stockAPI = new TwelveDataAPIService(apiKey);
          break;
        }
        case StockAPIProvider.QUANDL: {
          const { QuandlAPIService } = await import("@/service/domain/assets/market-data/stockAPIService/providers/QuandlAPIService");
          stockAPI = new QuandlAPIService(apiKey);
          break;
        }
        case StockAPIProvider.EOD_HISTORICAL_DATA: {
          const { EODHistoricalDataAPIService } = await import("@/service/domain/assets/market-data/stockAPIService/providers/EODHistoricalDataAPIService");
          stockAPI = new EODHistoricalDataAPIService(apiKey);
          break;
        }
        case StockAPIProvider.POLYGON_IO: {
          const { PolygonIOAPIService } = await import("@/service/domain/assets/market-data/stockAPIService/providers/PolygonIOAPIService");
          stockAPI = new PolygonIOAPIService(apiKey);
          break;
        }
        default:
          throw new Error('Kein unterstützter Stock API Provider ausgewählt!');
      }
    }
    
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
   * @param apiKeys Optional API keys for providers
   * @param selectedProvider Optional selected API provider
   * @returns Array of updated asset definitions with historical data
   */
  static async updateStockHistoricalDataWithPeriod(
    definitions: AssetDefinition[],
    period: TimeRangePeriod,
    apiKeys?: Record<string, string | undefined>,
    selectedProvider?: string
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

    // Fehlerhafte Ticker sammeln
    const failedTickers: { ticker: string; name: string }[] = [];
    const updatedDefinitions: AssetDefinition[] = [];
    
    // Dynamische API-Service-Auswahl (Worker: API-Keys und Provider werden übergeben)
    let stockAPI: IStockAPIService = stockAPIService;
    if (apiKeys && selectedProvider) {
      // Use dynamic import for provider selection
      const { StockAPIProvider } = await import("@/types/shared/base/enums");
      const apiKey = apiKeys[selectedProvider.toLowerCase()];
      Logger.infoService(`[StockPriceUpdater] Historical Data with Period Provider: ${selectedProvider}, apiKeys: ${JSON.stringify(apiKeys)}, verwendeter apiKey: ${apiKey}`);
      switch (selectedProvider) {
        case StockAPIProvider.FINNHUB: {
          const { FinnhubAPIService } = await import("@/service/domain/assets/market-data/stockAPIService/providers/FinnhubAPIService");
          stockAPI = new FinnhubAPIService(apiKey);
          break;
        }
        case StockAPIProvider.YAHOO: {
          const { YahooAPIService } = await import("@/service/domain/assets/market-data/stockAPIService/providers/YahooAPIService");
          stockAPI = new YahooAPIService();
          break;
        }
        case StockAPIProvider.ALPHA_VANTAGE: {
          const { AlphaVantageAPIService } = await import("@/service/domain/assets/market-data/stockAPIService/providers/AlphaVantageAPIService");
          stockAPI = new AlphaVantageAPIService(apiKey);
          break;
        }
        case StockAPIProvider.IEX_CLOUD: {
          const { IEXCloudAPIService } = await import("@/service/domain/assets/market-data/stockAPIService/providers/IEXCloudAPIService");
          stockAPI = new IEXCloudAPIService(apiKey);
          break;
        }
        case StockAPIProvider.TWELVE_DATA: {
          const { TwelveDataAPIService } = await import("@/service/domain/assets/market-data/stockAPIService/providers/TwelveDataAPIService");
          stockAPI = new TwelveDataAPIService(apiKey);
          break;
        }
        case StockAPIProvider.QUANDL: {
          const { QuandlAPIService } = await import("@/service/domain/assets/market-data/stockAPIService/providers/QuandlAPIService");
          stockAPI = new QuandlAPIService(apiKey);
          break;
        }
        case StockAPIProvider.EOD_HISTORICAL_DATA: {
          const { EODHistoricalDataAPIService } = await import("@/service/domain/assets/market-data/stockAPIService/providers/EODHistoricalDataAPIService");
          stockAPI = new EODHistoricalDataAPIService(apiKey);
          break;
        }
        case StockAPIProvider.POLYGON_IO: {
          const { PolygonIOAPIService } = await import("@/service/domain/assets/market-data/stockAPIService/providers/PolygonIOAPIService");
          stockAPI = new PolygonIOAPIService(apiKey);
          break;
        }
        default:
          throw new Error('Kein unterstützter Stock API Provider ausgewählt!');
      }
    }

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
        } else {
          failedTickers.push({ ticker: definition.ticker!, name: definition.fullName });
          Logger.error(
            `No historical data for ${definition.ticker} (${definition.fullName}) in period ${period}`
          );
        }
      } catch (error) {
        Logger.error(
          `Failed to update historical data for ${definition.ticker}: ${error}`
        );
        failedTickers.push({ ticker: definition.ticker!, name: definition.fullName });
        // NICHT throwen, sondern weitermachen
      }
    }

    Logger.infoService(
      `Successfully updated historical data (${period}) for ${updatedDefinitions.length} stock definitions`
    );
    Logger.infoService(
      `StockPriceUpdater: Updated historical data for ${updatedDefinitions.length} stock definitions`
    );

    // Am Ende: Alert für fehlgeschlagene Ticker
    if (failedTickers.length > 0) {
      const msg =
        "Für folgende Assets konnte keine Historie abgerufen werden:\n" +
        failedTickers.map(f => `${f.ticker} (${f.name})`).join("\n");
       
      alert(msg);
    }

    return updatedDefinitions;
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
