import { AssetDefinition, Transaction as Asset } from '../../../types/domains/assets';
import { AssetCategory, AssetCategoryOption, AssetCategoryAssignment } from '../../../types/domains/assets/categories';
import { calculatePortfolioPositions, calculatePortfolioTotals } from '../portfolioCalculations';
import Logger from '../../../../../shared/logging/Logger/logger';

export function calculatePortfolio(
  assets: Asset[], 
  assetDefinitions: AssetDefinition[] = [],
  categories: AssetCategory[] = [],
  categoryOptions: AssetCategoryOption[] = [],
  categoryAssignments: AssetCategoryAssignment[] = []
) {
  Logger.infoService(`Calculating portfolio with ${assets.length} assets and ${assetDefinitions.length} definitions`);
  
  const positions = calculatePortfolioPositions(assets, assetDefinitions, categories, categoryOptions, categoryAssignments);
  const totals = calculatePortfolioTotals(positions);
  
  Logger.infoService(
    `Portfolio calculated: ${positions.length} positions, total value: ${totals.totalValue}, monthly income: ${totals.monthlyIncome}`
  );

  return {
    positions,
    totals,
    metadata: {
      lastCalculated: new Date().toISOString(),
      assetCount: assets.length,
      definitionCount: assetDefinitions.length,
      positionCount: positions.length
    }
  };
}
