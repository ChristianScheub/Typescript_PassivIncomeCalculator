import type { PortfolioHistoryPoint, AssetPosition } from '@/types/domains/portfolio/performance';
import { Transaction as Asset, AssetDefinition } from '@/types/domains/assets/';
import { PortfolioHistoryHelper } from './portfolioHistoryHelper';
import Logger from "@/service/shared/logging/Logger/logger";

function calculatePortfolioHistoryForDays(
  assets: Asset[], 
  assetDefinitions: AssetDefinition[] = [],
  daysBack: number = 30
): PortfolioHistoryPoint[] {
  if (daysBack <= 0) {
    Logger.warn(`Invalid daysBack parameter: ${daysBack}. Using default value of 30.`);
    daysBack = 30;
  }

  Logger.infoService(
    `Starting portfolio history calculation for ${assets.length} assets, ${assetDefinitions.length} definitions, ${daysBack} days back`
  );

  // Prepare assets and get asset definition map
  const { validAssets } = PortfolioHistoryHelper.prepareAssets(assets, assetDefinitions);
  if (validAssets.length === 0) return [];

  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - daysBack);

  // Get relevant dates within the specified range
  const relevantDates = PortfolioHistoryHelper.getRelevantDatesInRange(
    validAssets, 
    assetDefinitions, 
    startDate, 
    endDate
  );

  Logger.infoService(`Processing ${relevantDates.length} relevant dates in ${daysBack} day range`);

  const historyPoints: PortfolioHistoryPoint[] = [];
  const positions: Map<string, AssetPosition> = new Map();

  // Process each date to calculate portfolio value
  for (const date of relevantDates) {
    historyPoints.push(
      PortfolioHistoryHelper.createHistoryPoint(positions, date)
    );
  }

  Logger.infoService(`Generated ${historyPoints.length} portfolio history points for ${daysBack} days`);
  return historyPoints;
}

export { calculatePortfolioHistoryForDays };
