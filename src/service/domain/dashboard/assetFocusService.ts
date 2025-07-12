import { Asset, AssetDefinition } from '@/types/domains/assets/entities';
import { AssetWithValue } from '@/types/domains/portfolio/assetWithValue';
import Logger from '../../shared/logging/Logger/logger';

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
   * Calculate asset values for Asset Focus dashboard (zentraler Typ)
   */
  calculateAssetsWithValues(assets: Asset[], assetDefinitions: AssetDefinition[]): AssetWithValue[] {
    if (!assets || assets.length === 0 || !assetDefinitions || assetDefinitions.length === 0) {
      return [];
    }
    const assetMap = new Map<string, { quantity: number; value: number; assetDefinition: AssetDefinition }>();
    try {
      assets.forEach((asset: Asset) => {
        const assetDef = assetDefinitions.find((def: AssetDefinition) => def.id === asset.assetDefinitionId);
        if (!assetDef) {
          Logger.info(`Asset definition not found for asset ${asset.id}`);
          return;
        }
        const assetKey = assetDef.id;
        const quantity = asset.transactionType === 'sell' ? -(asset.purchaseQuantity || 0) : (asset.purchaseQuantity || 0);
        const value = (asset.purchaseQuantity || 0) * (asset.purchasePrice || 0) * (asset.transactionType === 'sell' ? -1 : 1);
        const existing = assetMap.get(assetKey);
        if (existing) {
          existing.quantity += quantity;
          existing.value += value;
        } else {
          assetMap.set(assetKey, {
            quantity,
            value,
            assetDefinition: assetDef
          });
        }
      });
      // Filter out sold assets (quantity <= 0)
      return Array.from(assetMap.values())
        .filter(entry => entry.quantity > 0)
        .map(entry => ({
          assetDefinition: entry.assetDefinition,
          value: entry.quantity * (entry.assetDefinition.currentPrice || 0),
          quantity: entry.quantity
        }));
    } catch (error) {
      Logger.error('Error calculating assets with values: ' + JSON.stringify(error));
      return [];
    }
  }

  /**
   * Calculate portfolio summary from assets with values
   */
  calculatePortfolioSummary(assetsWithValues: AssetWithValue[]) {
    const totalValue = assetsWithValues.reduce((sum, asset) => sum + asset.value, 0);
    // dayChange und dayChangePercent werden nicht mehr als Property geführt, sondern können on-the-fly berechnet werden
    const totalDayChange = assetsWithValues.reduce((sum, asset) => {
      const priceHistory = asset.assetDefinition.priceHistory;
      if (!priceHistory || priceHistory.length < 2) return sum;
      const sortedHistory = [...priceHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const todayPrice = sortedHistory[0]?.price || asset.assetDefinition.currentPrice || 0;
      const yesterdayPrice = sortedHistory[1]?.price || todayPrice;
      const priceChange = todayPrice - yesterdayPrice;
      return sum + asset.quantity * priceChange;
    }, 0);
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
