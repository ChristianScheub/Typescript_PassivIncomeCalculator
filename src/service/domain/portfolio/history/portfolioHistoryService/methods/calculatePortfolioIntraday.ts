import { PortfolioPosition } from "@/types/domains/portfolio";
import { PortfolioIntradayPoint } from "@/service/infrastructure/sqlLitePortfolioHistory";
import { PriceHistoryEntry, AssetDefinition } from "@/types/domains/assets";
import Logger from "@/service/shared/logging/Logger/logger";

export function calculatePortfolioIntraday(
  assetDefinitions: AssetDefinition[],
  portfolioPositions: PortfolioPosition[]
): PortfolioIntradayPoint[] {
  if (!portfolioPositions || portfolioPositions.length === 0) {
    Logger.warnService(
      "calculatePortfolioIntraday: EARLY RETURN - No portfolioPositions"
    );
    return [];
  }

  const today = new Date();
  const datesRange: string[] = [];
  for (let i = 0; i < 5; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    datesRange.push(date.toISOString().split("T")[0]);
  }

  const allTimestamps = new Set<string>();
  const assetDataMap: Record<string, Record<string, number>> = {};

  assetDefinitions.forEach((definition, index) => {
    if (!definition.priceHistory || definition.priceHistory.length === 0) {
      Logger.warnService(
        `calculatePortfolioIntraday: Asset ${index} (${definition.id}) has no priceHistory`
      );
      return;
    }
    const ticker = definition.ticker || definition.id;
    assetDataMap[ticker] = {};

    const intradayEntries = definition.priceHistory.filter((entry) => {
      const entryDate = entry.date.split("T")[0];
      const hasTime = entry.date.includes("T") && entry.date.length > 10;
      const isInRange = datesRange.includes(entryDate);
      return isInRange && hasTime;
    });

    intradayEntries.forEach((entry) => {
      allTimestamps.add(entry.date);
      assetDataMap[ticker][entry.date] = entry.price;
    });
  });

  const findLastAvailablePrice = (
    assetDefinition: AssetDefinition,
    targetTimestamp: string
  ): number | null => {
    const ticker = assetDefinition.ticker || assetDefinition.id;
    const assetTimestampMap = assetDataMap[ticker];
    
    // First, try to find intraday price from the timestamp map
    if (assetTimestampMap) {
      // Check exact timestamp match
      if (assetTimestampMap[targetTimestamp]) {
        return assetTimestampMap[targetTimestamp];
      }
      
      // Find the latest intraday price before target timestamp
      let latestPrice: number | null = null;
      let latestTimestamp: Date | null = null;
      const targetDate = new Date(targetTimestamp);
      
      Object.entries(assetTimestampMap).forEach(([timestamp, price]) => {
        const entryDate = new Date(timestamp);
        if (entryDate <= targetDate) {
          if (!latestTimestamp || entryDate > latestTimestamp) {
            latestTimestamp = entryDate;
            latestPrice = price;
          }
        }
      });
      
      if (latestPrice !== null) {
        return latestPrice;
      }
    }
    
    // Second, try to find historical daily prices from priceHistory
    if (assetDefinition.priceHistory && assetDefinition.priceHistory.length > 0) {
      const targetDateStr = targetTimestamp.split("T")[0];
      const targetDate = new Date(targetDateStr);
      
      // Sort by date descending (newest first) and find the most recent price before or on target date
      const sortedHistory = [...assetDefinition.priceHistory]
        .sort((a: PriceHistoryEntry, b: PriceHistoryEntry) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      
      for (const entry of sortedHistory) {
        const entryDate = new Date(entry.date.split("T")[0]);
        if (entryDate <= targetDate && entry.price > 0) {
          Logger.infoService(`[findLastAvailablePrice] Using historical price for ${ticker}: €${entry.price.toFixed(2)} from ${entry.date}`);
          return entry.price;
        }
      }
      
      // If no price found before target date, use the earliest available price as fallback
      if (sortedHistory.length > 0 && sortedHistory[sortedHistory.length - 1].price > 0) {
        const fallbackEntry = sortedHistory[sortedHistory.length - 1];
        Logger.infoService(`[findLastAvailablePrice] No price before ${targetDateStr}, using earliest available price for ${ticker}: €${fallbackEntry.price.toFixed(2)} from ${fallbackEntry.date}`);
        return fallbackEntry.price;
      }
    }
    
    // Third, use currentPrice as final fallback
    if (assetDefinition.currentPrice && assetDefinition.currentPrice > 0) {
      Logger.infoService(`[findLastAvailablePrice] Using currentPrice as fallback for ${ticker}: €${assetDefinition.currentPrice.toFixed(2)}`);
      return assetDefinition.currentPrice;
    }
    
    // Last resort: no price available
    console.warn(`[findLastAvailablePrice] No price available for ${ticker} at ${targetTimestamp}`);
    return null;
  };

  const portfolioData: PortfolioIntradayPoint[] = [];

  allTimestamps.forEach((timestamp) => {
    let portfolioValue = 0;
    let assetsWithPrices = 0;
    let totalAssets = 0;

    portfolioPositions.forEach((position) => {
      totalAssets++;
      const definition = assetDefinitions.find(
        (def) => def.id === position.assetDefinitionId
      );
      if (!definition) {
        return;
      }

      const price = findLastAvailablePrice(definition, timestamp);

      if (price !== null && !isNaN(price) && price > 0) {
        const positionValue = price * position.totalQuantity;
        if (!isNaN(positionValue)) {
          portfolioValue += positionValue;
          assetsWithPrices++;
        }
      }
    });

    // Calculate coverage percentage
    const coveragePercentage =
      totalAssets > 0 ? assetsWithPrices / totalAssets : 0;

    // Accept if we have prices for at least 80% of assets and total value is reasonable
    if (
      assetsWithPrices > 0 &&
      coveragePercentage >= 0.8 &&
      !isNaN(portfolioValue) &&
      portfolioValue > 0
    ) {
      const date = timestamp.split("T")[0];
      portfolioData.push({ timestamp, date, value: portfolioValue });
    }
  });
  portfolioData.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  return portfolioData;
}
