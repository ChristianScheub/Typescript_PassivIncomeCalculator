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
    if (!assetTimestampMap) return null;
    if (assetTimestampMap[targetTimestamp])
      return assetTimestampMap[targetTimestamp];
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
    if (latestPrice !== null) return latestPrice;
    if (assetDefinition.priceHistory) {
      const targetDateStr = targetTimestamp.split("T")[0];
      const sortedHistory = assetDefinition.priceHistory
        .filter((entry: PriceHistoryEntry) => !entry.date.includes("T"))
        .sort(
          (a: PriceHistoryEntry, b: PriceHistoryEntry) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      for (const entry of sortedHistory) {
        if (entry.date <= targetDateStr) {
          return entry.price;
        }
      }
    }
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
