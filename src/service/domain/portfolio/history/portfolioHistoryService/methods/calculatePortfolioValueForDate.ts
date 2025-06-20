import { Transaction as Asset, AssetDefinition } from '../../../../../types/domains/assets/entities';
import { getHistoricalPrice } from './getHistoricalPrice';
import { AssetPosition, PortfolioTransaction } from '../interfaces/IPortfolioHistoryService';
import Logger from '../../../../../shared/logging/Logger/logger';

/**
 * Calculates the total portfolio value for a specific date
 * Updates positions based on transactions and calculates total value
 */
export function calculatePortfolioValueForDate(
  assets: Asset[],
  assetDefMap: Map<string, AssetDefinition>,
  date: string,
  positions: Map<string, AssetPosition>,
  dateTransactions: PortfolioTransaction[]
): number {
  const normalizedDate = date.split('T')[0];
  
  Logger.infoService(`Calculating portfolio value for ${normalizedDate}`);
  
  // Update positions with transactions for this date
  updatePositionsWithTransactions(
    assets, 
    assetDefMap, 
    normalizedDate, 
    positions, 
    dateTransactions
  );

  // Calculate total portfolio value using current positions and historical prices
  let totalPortfolioValue = 0;

  positions.forEach((position, assetDefinitionId) => {
    if (position.quantity <= 0) {
      Logger.infoService(`Skipping position ${assetDefinitionId} with zero quantity`);
      return;
    }
    
    const assetDef = assetDefMap.get(assetDefinitionId);
    if (!assetDef) {
      Logger.error(`No asset definition found for ID: ${assetDefinitionId}. Available IDs: [${Array.from(assetDefMap.keys()).join(', ')}]`);
      Logger.warn(`Removing position with invalid asset definition ID: ${assetDefinitionId}`);
      // Remove the invalid position to prevent future errors
      positions.delete(assetDefinitionId);
      return;
    }

    // Get the price for this date
    const priceForDate = getHistoricalPrice(assetDef, normalizedDate);
    
    // Safety check: ensure price is a valid number
    if (priceForDate === null || priceForDate === undefined || !isFinite(priceForDate)) {
      Logger.warn(`Invalid price for ${assetDef.ticker || assetDef.fullName} on ${normalizedDate}, skipping position`);
      return;
    }
    
    position.lastKnownPrice = priceForDate;

    // Calculate position value
    const positionValue = position.quantity * priceForDate;
    totalPortfolioValue += positionValue;
    
    Logger.infoService(
      `Position ${assetDef.ticker || assetDef.fullName}: ${position.quantity} × €${priceForDate.toFixed(2)} = €${positionValue.toFixed(2)}`
    );
  });

  Logger.infoService(`Total portfolio value on ${normalizedDate}: €${totalPortfolioValue.toFixed(2)}`);
  return totalPortfolioValue;
}

/**
 * Updates positions map with transactions that occurred on the given date
 */
function updatePositionsWithTransactions(
  assets: Asset[],
  assetDefMap: Map<string, AssetDefinition>,
  normalizedDate: string,
  positions: Map<string, AssetPosition>,
  dateTransactions: PortfolioTransaction[]
): void {
  dateTransactions.forEach(transaction => {
    // Find the corresponding asset for this transaction
    const asset = findAssetForTransaction(assets, normalizedDate, transaction);
    
    if (!asset?.assetDefinitionId) {
      Logger.warn(
        `No matching asset found for transaction: ${transaction.type} ${transaction.amount} at €${transaction.price}`
      );
      return;
    }

    updateOrCreatePosition(assetDefMap, positions, asset, transaction);
  });
}

/**
 * Finds the asset that corresponds to a specific transaction
 */
function findAssetForTransaction(
  assets: Asset[], 
  normalizedDate: string, 
  transaction: PortfolioTransaction
): Asset | undefined {
  return assets.find(a => {
    const assetDate = a.purchaseDate.split('T')[0];
    const transactionType = a.transactionType || 'buy';
    const quantity = transactionType === 'buy' ? (a.purchaseQuantity || 0) : (a.saleQuantity || 0);
    const price = transactionType === 'sell' ? (a.salePrice || 0) : (a.purchasePrice || 0);
    
    return assetDate === normalizedDate && 
           quantity === transaction.amount && 
           price === transaction.price &&
           transactionType === transaction.type;
  });
}

/**
 * Updates an existing position or creates a new one
 */
function updateOrCreatePosition(
  assetDefMap: Map<string, AssetDefinition>,
  positions: Map<string, AssetPosition>,
  asset: Asset,
  transaction: PortfolioTransaction
): void {
  const existingPosition = positions.get(asset.assetDefinitionId!);
  
  if (transaction.type === 'buy') {
    if (existingPosition) {
      // Update existing position with new purchase
      const totalQuantity = existingPosition.quantity + transaction.amount;
      const totalValue = (existingPosition.quantity * existingPosition.averageBuyPrice) + 
                       (transaction.amount * transaction.price);
      
      existingPosition.quantity = totalQuantity;
      existingPosition.averageBuyPrice = totalQuantity > 0 ? totalValue / totalQuantity : 0;
      
      Logger.infoService(
        `Updated position ${transaction.assetName}: quantity=${totalQuantity}, avgPrice=€${existingPosition.averageBuyPrice.toFixed(2)}`
      );
    } else {
      // Create new position
      const assetDef = assetDefMap.get(asset.assetDefinitionId!);
      const newPosition: AssetPosition = {
        assetDefinitionId: asset.assetDefinitionId!,
        symbol: assetDef?.ticker || transaction.symbol,
        quantity: transaction.amount,
        averageBuyPrice: transaction.price,
        lastKnownPrice: transaction.price
      };
      
      positions.set(asset.assetDefinitionId!, newPosition);
      
      Logger.infoService(
        `Created position ${transaction.assetName}: quantity=${transaction.amount}, price=€${transaction.price}`
      );
    }
  } else if (transaction.type === 'sell' && existingPosition) {
    // Handle sell transactions
    const newQuantity = Math.max(0, existingPosition.quantity - transaction.amount);
    existingPosition.quantity = newQuantity;
    
    Logger.infoService(
      `Sold from position ${transaction.assetName}: remaining quantity=${newQuantity}`
    );
  }
}
