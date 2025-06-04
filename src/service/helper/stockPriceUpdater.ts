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
    if (!isApiKeyConfigured()) {
      throw new Error('API key not configured. Please set your Finnhub API key in Settings.');
    }

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

    for (const stock of stocksToUpdate) {
      try {
        const updatedStock = await StockPriceUpdater.updateSingleStock(stock, stockAPI);
        if (updatedStock) {
          updatedStocks.push(updatedStock);
        }
      } catch (error) {
        Logger.error(`Failed to update price for ${stock.ticker}: ${error}`);
      }
    }

    Logger.info(`Successfully updated ${updatedStocks.length} stock prices`);
    return updatedStocks;
  }

  private static async updateSingleStock(stock: Asset, stockAPI: any): Promise<Asset | null> {
    const quote = await stockAPI.getQuote(stock.ticker!);
    if (!quote?.price) return null;

    const currentValue = stock.quantity ? stock.quantity * quote.price : stock.value;
    const purchaseValue = stock.quantity && stock.purchasePrice ? stock.quantity * stock.purchasePrice : stock.value;
    const valueDifference = Number((currentValue - purchaseValue).toFixed(2));
    const percentageDifference = purchaseValue > 0 ? Number(((currentValue - purchaseValue) / purchaseValue * 100).toFixed(2)) : 0;

    const updatedStock = {
      ...stock,
      currentPrice: quote.price,
      lastPriceUpdate: new Date().toISOString(),
      value: Number(currentValue.toFixed(2)),
      valueDifference: valueDifference !== 0 ? valueDifference : undefined,
      percentageDifference: percentageDifference !== 0 ? percentageDifference : undefined
    };
    Logger.info(`Updated price for ${stock.ticker}: ${quote.price}`);
    Logger.info(`Value difference: ${valueDifference}, Percentage: ${percentageDifference}%`);
    return updatedStock;
  }
}
