import { Asset, AssetDefinition } from '../../types';
import { 
  calculatePortfolioPositions, 
  calculatePortfolioTotals, 
  PortfolioPosition 
} from './portfolioCalculations';
import Logger from '../Logger/logger';
import { getCurrentQuantity } from '../../utils/transactionCalculations';

export class PortfolioService {
  private static instance: PortfolioService;
  
  static getInstance(): PortfolioService {
    if (!PortfolioService.instance) {
      PortfolioService.instance = new PortfolioService();
    }
    return PortfolioService.instance;
  }

  /**
   * Calculate complete portfolio data including positions and totals
   */
  calculatePortfolio(assets: Asset[], assetDefinitions: AssetDefinition[] = []) {
    Logger.infoService(`Calculating portfolio with ${assets.length} assets and ${assetDefinitions.length} definitions`);
    
    const positions = calculatePortfolioPositions(assets, assetDefinitions);
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

  /**
   * Get portfolio position by AssetDefinition ID or transaction identifier
   */
  getPosition(assets: Asset[], assetDefinitions: AssetDefinition[], positionId: string): PortfolioPosition | null {
    const positions = calculatePortfolioPositions(assets, assetDefinitions);
    return positions.find(pos => pos.id === positionId) || null;
  }

  /**
   * Get all transactions for a specific position
   */
  getPositionTransactions(assets: Asset[], positionId: string): Asset[] {
    return assets.filter(asset => {
      const key = asset.assetDefinitionId || `fallback_${asset.name}_${asset.type}`;
      return key === positionId;
    });
  }

  /**
   * Calculate what the monthly income would be if dividend info is updated for a position
   */
  calculateProjectedIncome(
    assets: Asset[], 
    assetDefinitions: AssetDefinition[], 
    definitionId: string, 
    newDividendInfo: any
  ): number {
    const positionTransactions = assets.filter(asset => asset.assetDefinitionId === definitionId);
    const totalQuantity = positionTransactions.reduce((sum, t) => {
      return sum + getCurrentQuantity(t);
    }, 0);

    if (totalQuantity <= 0 || !newDividendInfo?.frequency || newDividendInfo.frequency === 'none') {
      return 0;
    }

    // Import calculation function dynamically to avoid circular dependency
    const { calculateDividendSchedule } = require('../calculatorService/methods/calculatePayment');
    const result = calculateDividendSchedule(newDividendInfo, totalQuantity);
    
    return isFinite(result.monthlyAmount) ? result.monthlyAmount : 0;
  }
}

export default PortfolioService.getInstance();
