import { 
  AssetDefinition, 
  Transaction as Asset,
  DividendInfo
} from '../../../types/domains/assets/';
import { AssetCategory, AssetCategoryOption, AssetCategoryAssignment } from '../../../types/domains/assets/categories';
import { PortfolioPosition } from '../../../types/domains/portfolio/position';

export interface IPortfolioService {
  /**
   * Calculate complete portfolio data including positions and totals
   */
  calculatePortfolio(
    assets: Asset[], 
    assetDefinitions: AssetDefinition[],
    categories?: AssetCategory[],
    categoryOptions?: AssetCategoryOption[],
    categoryAssignments?: AssetCategoryAssignment[]
  ): {
    positions: PortfolioPosition[],
    totals: {
      totalValue: number,
      monthlyIncome: number,
      [key: string]: number | string
    },
    metadata: {
      lastCalculated: string,
      assetCount: number,
      definitionCount: number,
      positionCount: number
    }
  };

  /**
   * Get portfolio position by AssetDefinition ID or transaction identifier
   */
  getPosition(
    assets: Asset[], 
    assetDefinitions: AssetDefinition[], 
    positionId: string,
    categories?: AssetCategory[],
    categoryOptions?: AssetCategoryOption[],
    categoryAssignments?: AssetCategoryAssignment[]
  ): PortfolioPosition | null;

  /**
   * Get all transactions for a specific position
   */
  getPositionTransactions(assets: Asset[], positionId: string): Asset[];

  /**
   * Calculate what the monthly income would be if dividend info is updated for a position
   */
  calculateProjectedIncome(
    assets: Asset[], 
    assetDefinitions: AssetDefinition[], 
    definitionId: string, 
    newDividendInfo: Partial<DividendInfo>
  ): number;
}
