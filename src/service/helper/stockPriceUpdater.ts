import { Asset } from '../../types';
import Logger from '../Logger/logger';
import { createStockAPIService } from '../stockAPIService';
import { isApiKeyConfigured } from '../stockAPIService/utils/fetch';

/**
 * Helper class to update stock prices in batch
 */
export class StockPriceUpdater {
  /**
   * Updates stock prices for the first 30 stocks in the given array
   * @param stocks Array of assets (only stock types will be updated)
   * @returns Array of updated stocks with new prices and timestamps
   */
  static async updateStockPrices(stocks: Asset[]): Promise<Asset[]> {
    // First, check if API key is configured
    if (!isApiKeyConfigured()) {
      throw new Error('API key not configured. Please set your Finnhub API key in Settings.');
    }

    // Filter out only stocks with tickers, limit to first 30
    const stocksToUpdate = stocks
      .filter(asset => asset.type === 'stock' && asset.ticker)
      .slice(0, 30);

    if (stocksToUpdate.length === 0) {
      Logger.info('No stocks to update');
      return [];
    }

    Logger.info(`Updating prices for ${stocksToUpdate.length} stocks`);
    const stockAPI = createStockAPIService();
    const updatedStocks: Asset[] = [];

    // Update each stock price
    for (const stock of stocksToUpdate) {
      try {
        const quote = await stockAPI.getQuote(stock.ticker!);
        if (quote && quote.price) { 
          const currentValue = stock.quantity ? stock.quantity * quote.price : stock.value;
          const purchaseValue = stock.quantity && stock.purchasePrice ? stock.quantity * stock.purchasePrice : stock.value;
          
          // Calculate differences with proper precision
          const valueDifference = Number((currentValue - purchaseValue).toFixed(2));
          // Calculate percentage without additional decimal division (since we want it as a percentage already)
          const percentageDifference = purchaseValue > 0 ? Number(((currentValue - purchaseValue) / purchaseValue * 100).toFixed(2)) : 0;

          // Only set differences if they're not zero
          const updatedStock = {
            ...stock,
            currentPrice: quote.price,
            lastPriceUpdate: new Date().toISOString(),
            value: Number(currentValue.toFixed(2)),
            valueDifference: valueDifference !== 0 ? valueDifference : undefined,
            percentageDifference: percentageDifference !== 0 ? percentageDifference : undefined
          };
          updatedStocks.push(updatedStock);
          Logger.info(`Updated price for ${stock.ticker}: ${quote.price}`);
          Logger.info(`Value difference: ${valueDifference}, Percentage: ${percentageDifference}%`);
        }
      } catch (error) {
        Logger.error(`Failed to update price for ${stock.ticker}: ${error}`);
        // Continue with next stock
      }
    }

    Logger.info(`Successfully updated ${updatedStocks.length} stock prices`);
    return updatedStocks;
  }
}
