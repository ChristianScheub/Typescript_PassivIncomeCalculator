import type { Transaction, AssetDefinition } from '@/types/domains/assets/';
import type { PortfolioHistoryPoint } from '@/types/domains/portfolio/performance';
import type { PortfolioPosition } from '@/types/domains/portfolio';
import type { PortfolioIntradayPoint } from '@/service/infrastructure/sqlLitePortfolioHistory/interfaces/IPortfolioHistoryService';



/**
 * Portfolio History Service Interface
 */
export interface IPortfolioHistoryService {
  // Portfolio history calculations
  calculatePortfolioHistory(
    assets: Transaction[],
    assetDefinitions: AssetDefinition[]
  ): PortfolioHistoryPoint[];

  calculatePortfolioIntraday(
    assetDefinitions: AssetDefinition[],
    portfolioPositions: PortfolioPosition[]
  ): PortfolioIntradayPoint[];
}
