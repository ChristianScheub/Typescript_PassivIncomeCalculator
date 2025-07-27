import { Asset, AssetDefinition } from '@/types/domains/assets';
import { PortfolioHistoryHelper } from './portfolioHistoryHelper';
import Logger from "@/service/shared/logging/Logger/logger";
import { PortfolioHistoryPoint } from '@/types/domains/portfolio';
import { getHistoricalPrice } from './getHistoricalPrice';
import { getCurrentQuantity } from '@/utils/transactionCalculations';

function calculatePortfolioHistory(
  assets: Asset[], 
  assetDefinitions: AssetDefinition[] = []
): PortfolioHistoryPoint[] {
  Logger.infoService(
    `Starting portfolio history calculation for ${assets.length} assets and ${assetDefinitions.length} definitions`
  );

  // Prepare assets and get asset definition map
  const { validAssets, assetDefMap } = PortfolioHistoryHelper.prepareAssets(assets, assetDefinitions);
  if (validAssets.length === 0) return [];

  // Get all unique dates
  const allDates = PortfolioHistoryHelper.getAllUniqueDates(validAssets, assetDefinitions);
  Logger.infoService(`Processing ${allDates.length} unique dates`);

  const historyPoints: PortfolioHistoryPoint[] = [];
  
  // Track last known prices for each asset definition to handle missing price data
  const lastKnownPrices = new Map<string, number>();

  // Process each date to calculate portfolio value
  for (const date of allDates) {
    const normalizedDate = PortfolioHistoryHelper.normalizeDate(date);
    
    // Calculate portfolio value for this date
    let totalValue = 0;
    let totalInvested = 0;
    
    // Group assets by definition for position calculation
    const assetsByDefinition = new Map<string, Asset[]>();
    
    validAssets.forEach(asset => {
      const purchaseDate = PortfolioHistoryHelper.normalizeDate(asset.purchaseDate);
      
      // Only include assets purchased on or before this date
      if (purchaseDate <= normalizedDate) {
        const definitionId = asset.assetDefinitionId || 'unknown';
        if (!assetsByDefinition.has(definitionId)) {
          assetsByDefinition.set(definitionId, []);
        }
        assetsByDefinition.get(definitionId)!.push(asset);
      }
    });

    // Calculate value for each position
    assetsByDefinition.forEach((assetsInPosition, definitionId) => {
      const assetDefinition = assetDefMap.get(definitionId);
      if (!assetDefinition) return;

      // Calculate total quantity for this position on this date
      let totalQuantity = 0;
      let totalCost = 0;

      assetsInPosition.forEach(asset => {
        const quantity = getCurrentQuantity(asset);
        totalQuantity += quantity;
        totalCost += (asset.purchasePrice || 0) * Math.abs(asset.purchaseQuantity || 0);
      });

      if (totalQuantity > 0) {
        // Get historical price for this date
        let price = getHistoricalPrice(assetDefinition, normalizedDate);
        
        // If no price is available or price is 0/invalid, use last known price
        if (price === null || !isFinite(price) || price <= 0) {
          const lastKnownPrice = lastKnownPrices.get(definitionId);
          if (lastKnownPrice !== undefined) {
            price = lastKnownPrice;
            Logger.infoService(
              `Using last known price for ${assetDefinition.ticker || assetDefinition.fullName} on ${normalizedDate}: €${price.toFixed(2)}`
            );
          }
        } else {
          // Update last known price if we have a valid price
          lastKnownPrices.set(definitionId, price);
        }
        
        if (price !== null && isFinite(price) && price > 0) {
          const positionValue = totalQuantity * price;
          totalValue += positionValue;
          totalInvested += totalCost;
          
          Logger.infoService(
            `Position ${assetDefinition.ticker || assetDefinition.fullName} on ${normalizedDate}: ${totalQuantity} × €${price.toFixed(2)} = €${positionValue.toFixed(2)}`
          );
        }
      }
    });

    const totalReturn = totalValue - totalInvested;
    const totalReturnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

    historyPoints.push({
      date: normalizedDate,
      totalValue,
      totalInvested,
      totalReturn,
      totalReturnPercentage,
      positions: [] // Simplified - positions can be calculated separately if needed
    });
  }

  Logger.infoService(`Generated ${historyPoints.length} portfolio history points`);
  return historyPoints;
}

export { calculatePortfolioHistory };
