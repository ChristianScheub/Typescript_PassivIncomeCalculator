import { Asset, AssetDefinition } from '../../../types';
import { calculatePortfolioPositions, calculatePortfolioTotals } from '../portfolioCalculations';
import Logger from '../../Logger/logger';

export function calculatePortfolio(
  assets: Asset[], 
  assetDefinitions: AssetDefinition[] = [],
  categories: any[] = [],
  categoryOptions: any[] = [],
  categoryAssignments: any[] = []
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
