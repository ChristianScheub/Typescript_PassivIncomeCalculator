import { Asset, AssetDefinition } from '@/types/domains/assets';
import { PortfolioHistoryHelper } from './portfolioHistoryHelper';
import Logger from "@/service/shared/logging/Logger/logger";
import { AssetPosition, PortfolioHistoryPoint } from '@/types/domains/portfolio';

function calculatePortfolioHistory(
  assets: Asset[], 
  assetDefinitions: AssetDefinition[] = []
): PortfolioHistoryPoint[] {
  Logger.infoService(
    `Starting portfolio history calculation for ${assets.length} assets and ${assetDefinitions.length} definitions`
  );

  // Prepare assets and get asset definition map
  const { validAssets } = PortfolioHistoryHelper.prepareAssets(assets, assetDefinitions);
  if (validAssets.length === 0) return [];

  // Get all unique dates
  const allDates = PortfolioHistoryHelper.getAllUniqueDates(validAssets, assetDefinitions);
  Logger.infoService(`Processing ${allDates.length} unique dates`);

  const historyPoints: PortfolioHistoryPoint[] = [];
  // Use AssetPosition instead of ServiceAssetPosition
  const positions: Map<string, AssetPosition> = new Map();

  // Process each date to calculate portfolio value
  for (const date of allDates) {
    historyPoints.push(
      PortfolioHistoryHelper.createHistoryPoint(positions, date)
    );
  }

  Logger.infoService(`Generated ${historyPoints.length} portfolio history points`);
  return historyPoints;
}

export { calculatePortfolioHistory };
