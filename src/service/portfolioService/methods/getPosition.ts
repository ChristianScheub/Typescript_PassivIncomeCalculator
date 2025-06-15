import { Asset, AssetDefinition } from '../../../types';
import { calculatePortfolioPositions, PortfolioPosition } from '../portfolioCalculations';

export function getPosition(
  assets: Asset[], 
  assetDefinitions: AssetDefinition[], 
  positionId: string,
  categories: any[] = [],
  categoryOptions: any[] = [],
  categoryAssignments: any[] = []
): PortfolioPosition | null {
  const positions = calculatePortfolioPositions(assets, assetDefinitions, categories, categoryOptions, categoryAssignments);
  return positions.find(pos => pos.id === positionId) || null;
}
