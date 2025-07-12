import { Transaction as Asset, AssetDefinition } from '@/types/domains/assets';
import { getCurrentQuantity } from '@/utils/transactionCalculations';
import Logger from "@/service/shared/logging/Logger/logger";
import { PortfolioHistoryPoint, PortfolioServiceTransaction, AssetPosition } from '@/types/domains/portfolio';

/**
 * Helper class containing shared functionality for portfolio history calculations
 */
export class PortfolioHistoryHelper {
  // Cache für berechnete Werte
  private static readonly transactionsCache = new Map<string, PortfolioServiceTransaction[]>();
  private static readonly portfolioValueCache = new Map<string, number>();
  private static readonly datesCache = new Map<string, string[]>();
  private static readonly assetDefMapCache = new Map<string, Map<string, AssetDefinition>>();

  /**
   * Löscht alle Caches
   */
  static clearCaches(): void {
    this.transactionsCache.clear();
    this.portfolioValueCache.clear();
    this.datesCache.clear();
    this.assetDefMapCache.clear();
    Logger.cache('Portfolio history caches cleared');
  }

  /**
   * Generiert einen Cache-Key für ein Asset-Array
   */
  private static getCacheKey(assets: Asset[], date?: string): string {
    const assetKey = assets.map(a => `${a.id}-${a.value}-${a.purchaseDate}`).join('|');
    return date ? `${assetKey}-${date}` : assetKey;
  }

  /**
   * Creates a cached map of asset definitions by ID and filters valid assets
   */
  static prepareAssets(
    assets: Asset[], 
    assetDefinitions: AssetDefinition[] = []
  ): { validAssets: Asset[], assetDefMap: Map<string, AssetDefinition> } {
    if (!assets || assets.length === 0) {
      Logger.warn('No assets provided for portfolio history calculation');
      return { validAssets: [], assetDefMap: new Map() };
    }

    const cacheKey = this.getCacheKey(assets);
    const cachedMap = this.assetDefMapCache.get(cacheKey);
    
    if (cachedMap) {
      Logger.cache('Cache hit: Using cached asset definition map');
      const validAssets = this.validateAssets(assets, cachedMap);
      return { validAssets, assetDefMap: cachedMap };
    }

    const assetDefMap = new Map(assetDefinitions.map(def => [def.id, def]));
    const validAssets = this.validateAssets(assets, assetDefMap);
    
    this.assetDefMapCache.set(cacheKey, assetDefMap);
    return { validAssets, assetDefMap };
  }

  /**
   * Validates assets against an asset definition map
   */
  private static validateAssets(
    assets: Asset[], 
    assetDefMap: Map<string, AssetDefinition>
  ): Asset[] {
    return assets.filter(asset => {
      const quantity = getCurrentQuantity(asset);
      const hasValidQuantity = quantity !== 0;
      const hasValidDate = !!asset.purchaseDate;
      const hasValidDefinition = !asset.assetDefinitionId || assetDefMap.has(asset.assetDefinitionId);
      
      const isValid = hasValidDate && hasValidQuantity && hasValidDefinition;
      
      if (!isValid) {
        let reason: string;
        if (!hasValidDate) {
          reason = 'no purchase date';
        } else if (!hasValidQuantity) {
          reason = `invalid quantity (${quantity})`;
        } else if (!hasValidDefinition) {
          reason = `missing asset definition ID ${asset.assetDefinitionId}`;
        } else {
          reason = 'unknown reason';
        }
        Logger.warn(`Skipping invalid asset: ${asset.name} - ${reason}`);
      }
      
      return isValid;
    });
  }

  /**
   * Gets all transactions that occurred on a specific date
   */
  static getTransactionsForDate(
    assets: Asset[], 
    assetDefMap: Map<string, AssetDefinition>, 
    date: string
  ): PortfolioServiceTransaction[] {
    const cacheKey = this.getCacheKey(assets, date);
    const cachedTransactions = this.transactionsCache.get(cacheKey);
    
    if (cachedTransactions) {
      Logger.cache(`Cache hit: Using cached transactions for ${date}`);
      return cachedTransactions;
    }

    const normalizedDate = this.normalizeDate(date);
    const transactions = assets
      .filter(asset => this.normalizeDate(asset.purchaseDate) === normalizedDate)
      .map(asset => {
        const assetDef = asset.assetDefinitionId ? assetDefMap.get(asset.assetDefinitionId) : undefined;
        const transactionType = asset.transactionType || 'buy';
        // Use absolute values for amount - the transaction type determines the sign behavior
        const quantity = Math.abs(asset.purchaseQuantity || 0);
        const price = asset.purchasePrice || 0; // Both buy and sell use purchasePrice
        
        Logger.infoService(
          `Transaction on ${normalizedDate}: ${transactionType} ${quantity} ${assetDef?.ticker || asset.name} at €${price}`
        );
        
        return {
          type: transactionType,
          amount: quantity,
          price: price,
          symbol: assetDef?.ticker || 'N/A',
          assetName: assetDef?.fullName || asset.name
        };
      });

    this.transactionsCache.set(cacheKey, transactions);
    return transactions;
  }

  /**
   * Gets relevant dates from assets and price history within a date range with caching
   */
  static getRelevantDatesInRange(
    assets: Asset[], 
    assetDefinitions: AssetDefinition[], 
    startDate: Date, 
    endDate: Date
  ): string[] {
    const cacheKey = `${this.getCacheKey(assets)}-${startDate.toISOString()}-${endDate.toISOString()}`;
    const cachedDates = this.datesCache.get(cacheKey);
    
    if (cachedDates) {
      Logger.cache(`Cache hit: Using cached dates for range ${startDate} to ${endDate}`);
      return cachedDates;
    }

    const dateSet = new Set<string>();

    // Add transaction dates within range
    assets.forEach(asset => {
      if (asset.purchaseDate) {
        const purchaseDate = new Date(asset.purchaseDate);
        if (purchaseDate >= startDate && purchaseDate <= endDate) {
          dateSet.add(this.normalizeDate(asset.purchaseDate));
        }
      }
      if (asset.saleDate) {
        const saleDate = new Date(asset.saleDate);
        if (saleDate >= startDate && saleDate <= endDate) {
          dateSet.add(this.normalizeDate(asset.saleDate));
        }
      }
    });

    // Add historical price dates within range
    assetDefinitions.forEach(assetDef => {
      const priceHistory = assetDef.priceHistory;
      if (priceHistory && priceHistory.length > 0) {
        priceHistory.forEach(priceEntry => {
          const priceDate = new Date(priceEntry.date);
          if (priceDate >= startDate && priceDate <= endDate) {
            dateSet.add(this.normalizeDate(priceEntry.date));
          }
        });
      }
    });

    // Always include today and range boundaries
    dateSet.add(this.normalizeDate(new Date().toISOString()));
    dateSet.add(this.normalizeDate(startDate.toISOString()));
    dateSet.add(this.normalizeDate(endDate.toISOString()));

    const dates = Array.from(dateSet).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    this.datesCache.set(cacheKey, dates);
    
    return dates;
  }

  /**
   * Gets all unique dates from assets and price history with caching
   */
  static getAllUniqueDates(
    assets: Asset[], 
    assetDefinitions: AssetDefinition[]
  ): string[] {
    const cacheKey = this.getCacheKey(assets);
    const cachedDates = this.datesCache.get(cacheKey);
    
    if (cachedDates) {
      Logger.cache('Cache hit: Using cached unique dates');
      return cachedDates;
    }

    const dateSet = new Set<string>();

    // Add all transaction dates
    assets.forEach(asset => {
      if (asset.purchaseDate) {
        dateSet.add(this.normalizeDate(asset.purchaseDate));
      }
      if (asset.saleDate) {
        dateSet.add(this.normalizeDate(asset.saleDate));
      }
    });

    // Add all price history dates
    assetDefinitions.forEach(assetDef => {
      const priceHistory = assetDef.priceHistory;
      if (priceHistory && priceHistory.length > 0) {
        priceHistory.forEach(priceEntry => {
          dateSet.add(this.normalizeDate(priceEntry.date));
        });
      }
    });

    // Always include today
    dateSet.add(this.normalizeDate(new Date().toISOString()));

    const dates = Array.from(dateSet).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    this.datesCache.set(cacheKey, dates);

    return dates;
  }

  /**
   * Normalizes date strings to YYYY-MM-DD format
   */
  static normalizeDate(date: string): string {
    return date.split('T')[0];
  }

  /**
   * Creates a PortfolioHistoryPoint for a specific date with caching (konsolidierte Struktur)
   */
  static createHistoryPoint(
    positions: Map<string, AssetPosition>,
    date: string
  ): PortfolioHistoryPoint {
    // Für die konsolidierte Struktur: Berechne alle Felder
    // (Hier: Beispielhafte Berechnung, ggf. anpassen je nach Logik)
    // totalValue = Summe der aktuellen Werte aller Positionen
    // totalInvested = Summe der Investitionen
    // totalReturn = totalValue - totalInvested
    // totalReturnPercentage = (totalReturn / totalInvested) * 100
    // positions = aktuelle AssetPositionen für das Datum

    // Dummy-Implementierung für die Struktur, Logik ggf. anpassen
    const assetPositions: AssetPosition[] = Array.from(positions.values());
    const totalValue = assetPositions.reduce((sum, p) => sum + p.currentValue, 0);
    const totalInvested = assetPositions.reduce((sum, p) => sum + p.totalInvested, 0);
    const totalReturn = totalValue - totalInvested;
    const totalReturnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

    return {
      date,
      totalValue,
      totalInvested,
      totalReturn,
      totalReturnPercentage,
      positions: assetPositions
    };
  }
}
