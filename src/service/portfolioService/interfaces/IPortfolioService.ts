import { Asset, AssetDefinition } from '../../../types';
import { PortfolioPosition } from '../portfolioCalculations';

export interface IPortfolioService {
  /**
   * Calculate complete portfolio data including positions and totals
   */
  calculatePortfolio(
    assets: Asset[], 
    assetDefinitions: AssetDefinition[],
    categories?: any[],
    categoryOptions?: any[],
    categoryAssignments?: any[]
  ): {
    positions: PortfolioPosition[],
    totals: {
      totalValue: number,
      monthlyIncome: number,
      [key: string]: any
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
    categories?: any[],
    categoryOptions?: any[],
    categoryAssignments?: any[]
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
    newDividendInfo: any
  ): number;
}
