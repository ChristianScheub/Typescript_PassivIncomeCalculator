import { IStockAPIService } from '../interfaces/IStockAPIService';
import { StockAPIProvider } from '@/store/slices/apiConfigSlice';
import Logger from "@/service/shared/logging/Logger/logger";

// Import provider implementations
import { FinnhubAPIService } from '../providers/FinnhubAPIService';
import { YahooAPIService } from '../providers/YahooAPIService';
import { AlphaVantageAPIService } from '../providers/AlphaVantageAPIService';

/**
 * API Gateway that routes requests to the appropriate stock API provider
 * based on the current configuration
 */
export class StockAPIGateway implements IStockAPIService {
  private currentProvider: IStockAPIService;
  private selectedProvider: StockAPIProvider;
  private apiKeys: { [K in StockAPIProvider]?: string };

  constructor(selectedProvider: StockAPIProvider, apiKeys: { [K in StockAPIProvider]?: string }) {
    this.selectedProvider = selectedProvider;
    this.apiKeys = apiKeys;
    this.currentProvider = this.createProvider(selectedProvider);
    
    Logger.info(`StockAPIGateway initialized with provider: ${selectedProvider}`);
  }

  /**
   * Switch to a different API provider
   */
  switchProvider(provider: StockAPIProvider, apiKeys: { [K in StockAPIProvider]?: string }): void {
    if (this.selectedProvider !== provider) {
      this.selectedProvider = provider;
      this.apiKeys = apiKeys;
      this.currentProvider = this.createProvider(provider);
      Logger.info(`Switched to API provider: ${provider}`);
    }
  }

  /**
   * Create provider instance based on the selected provider type
   */
  private createProvider(provider: StockAPIProvider): IStockAPIService {
    const apiKey = this.apiKeys[provider];
    
    switch (provider) {
      case StockAPIProvider.FINNHUB:
        if (!apiKey) {
          throw new Error(`No API key configured for provider: ${provider}`);
        }
        return new FinnhubAPIService(apiKey);
      
      case StockAPIProvider.YAHOO:
        // Yahoo Finance doesn't require an API key
        return new YahooAPIService();
      
      case StockAPIProvider.ALPHA_VANTAGE:
        if (!apiKey) {
          throw new Error(`No API key configured for provider: ${provider}`);
        }
        return new AlphaVantageAPIService(apiKey);
      
      default:
        throw new Error(`Unknown API provider: ${provider}`);
    }
  }

  /**
   * Get information about the current provider
   */
  getCurrentProviderInfo(): { provider: StockAPIProvider; hasApiKey: boolean } {
    return {
      provider: this.selectedProvider,
      hasApiKey: !!this.apiKeys[this.selectedProvider]
    };
  }

  // Delegate all IStockAPIService methods to the current provider
  async getStockExchanges(symbol: string) {
    return this.currentProvider.getStockExchanges(symbol);
  }

  async getCurrentStockPrice(symbol: string) {
    return this.currentProvider.getCurrentStockPrice(symbol);
  }

  async getHistory(symbol: string, days: number) {
    return this.currentProvider.getHistory(symbol, days);
  }

  async getHistory30Days(symbol: string) {
    return this.currentProvider.getHistory30Days(symbol);
  }
}
