import { Asset, AssetDefinition } from '../../../types/domains/assets/entities';
import Logger from '../../shared/logging/Logger/logger';

export interface AssetWithValue {
  asset: Asset;
  currentValue: number;
  totalInvestment: number;
  dayChange: number;
  dayChangePercent: number;
  assetDefinition: AssetDefinition;
}

export interface AssetFocusData {
  assetsWithValues: AssetWithValue[];
  portfolioSummary: {
    totalValue: number;
    totalDayChange: number;
    totalDayChangePercent: number;
  };
}

/**
 * Service for Asset Focus Dashboard calculations
 */
class AssetFocusService {
  /**
   * Calculate asset values with day changes for Asset Focus dashboard
   */
  calculateAssetsWithValues(assets: Asset[], assetDefinitions: AssetDefinition[]): AssetWithValue[] {
    if (!assets || assets.length === 0 || !assetDefinitions || assetDefinitions.length === 0) {
      return [];
    }

    const assetMap = new Map<string, AssetWithValue>();

    try {
      // Group assets by assetDefinitionId and calculate totals
      assets.forEach((asset: any) => {
        const assetDef = assetDefinitions.find((def: any) => def.id === asset.assetDefinitionId);
        if (!assetDef) {
          Logger.info(`Asset definition not found for asset ${asset.id}`);
          return;
        }

        const assetKey = assetDef.id;
        const existing = assetMap.get(assetKey);
        const quantity = asset.transactionType === 'sell' ? -(asset.purchaseQuantity || 0) : (asset.purchaseQuantity || 0);
        const investment = asset.transactionType === 'sell' ? -asset.value : asset.value;

        if (existing) {
          existing.asset.purchaseQuantity = (existing.asset.purchaseQuantity || 0) + quantity;
          existing.totalInvestment += investment;
        } else {
          assetMap.set(assetKey, {
            asset: {
              ...asset,
              purchaseQuantity: quantity
            },
            currentValue: 0,
            totalInvestment: investment,
            dayChange: 0,
            dayChangePercent: 0,
            assetDefinition: assetDef
          });
        }
      });

      // Calculate current values and day changes
      const result: AssetWithValue[] = [];
      assetMap.forEach((assetWithValue) => {
        const { asset, assetDefinition } = assetWithValue;
        
        const quantity = asset.purchaseQuantity || 0;
        if (quantity <= 0) return; // Skip sold assets

        // Get current price (latest price from price history or stored current price)
        const currentPrice = assetDefinition.currentPrice || 0;
        const currentValue = quantity * currentPrice;

        // Calculate day change from price history
        let dayChange = 0;
        let dayChangePercent = 0;

        if (assetDefinition.priceHistory && assetDefinition.priceHistory.length >= 2) {
          const sortedHistory = [...assetDefinition.priceHistory].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          
          const todayPrice = sortedHistory[0]?.price || currentPrice;
          const yesterdayPrice = sortedHistory[1]?.price || todayPrice;
          
          const priceChange = todayPrice - yesterdayPrice;
          dayChange = quantity * priceChange;
          dayChangePercent = yesterdayPrice > 0 ? (priceChange / yesterdayPrice) * 100 : 0;
        }

        result.push({
          ...assetWithValue,
          currentValue,
          dayChange,
          dayChangePercent
        });
      });

      // Sort by current value (descending)
      return result.sort((a, b) => b.currentValue - a.currentValue);
    } catch (error) {
      Logger.error('Error calculating assets with values: ' + JSON.stringify(error));
      return [];
    }
  }

  /**
   * Calculate portfolio summary from assets with values
   */
  calculatePortfolioSummary(assetsWithValues: AssetWithValue[]) {
    const totalValue = assetsWithValues.reduce((sum, asset) => sum + asset.currentValue, 0);
    const totalDayChange = assetsWithValues.reduce((sum, asset) => sum + asset.dayChange, 0);
    const totalDayChangePercent = totalValue > 0 ? (totalDayChange / (totalValue - totalDayChange)) * 100 : 0;

    return {
      totalValue,
      totalDayChange,
      totalDayChangePercent
    };
  }

  /**
   * Calculate complete Asset Focus data
   */
  calculateAssetFocusData(assets: Asset[], assetDefinitions: AssetDefinition[]): AssetFocusData {
    const assetsWithValues = this.calculateAssetsWithValues(assets, assetDefinitions);
    const portfolioSummary = this.calculatePortfolioSummary(assetsWithValues);

    return {
      assetsWithValues,
      portfolioSummary
    };
  }
}

const assetFocusService = new AssetFocusService();
export default assetFocusService;
