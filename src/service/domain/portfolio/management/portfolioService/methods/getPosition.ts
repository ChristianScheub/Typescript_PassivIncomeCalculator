import { AssetDefinition, Transaction as Asset } from '../../../types/domains/assets';
import { AssetCategory, AssetCategoryOption, AssetCategoryAssignment } from '../../../types/domains/assets/categories';
import { PortfolioPosition } from '../../../types/domains/portfolio/position';
import { calculatePortfolioPositions } from '../portfolioCalculations';

export function getPosition(
  assets: Asset[], 
  assetDefinitions: AssetDefinition[], 
  positionId: string,
  categories: AssetCategory[] = [],
  categoryOptions: AssetCategoryOption[] = [],
  categoryAssignments: AssetCategoryAssignment[] = []
): PortfolioPosition | null {
  const positions = calculatePortfolioPositions(assets, assetDefinitions, categories, categoryOptions, categoryAssignments);
  return positions.find(pos => pos.id === positionId) || null;
}
