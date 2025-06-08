/**
 * Utility functions for calculating derived values from Transaction/Asset data
 * These functions replace the removed currentQuantity and currentValue fields
 */

import { Transaction, Asset } from '../types';

/**
 * Gets the current quantity for a transaction
 * In most cases this is the purchaseQuantity, but could change due to stock splits, etc.
 */
export function getCurrentQuantity(transaction: Transaction | Asset): number {
  // For now, return purchaseQuantity as currentQuantity
  // In the future, this could account for stock splits and other adjustments
  return transaction.purchaseQuantity || 0;
}

/**
 * Calculates the current value of a transaction based on:
 * - Current market price from AssetDefinition
 * - Current quantity (accounting for splits, etc.)
 */
export function getCurrentValue(transaction: Transaction | Asset): number {
  const currentPrice = transaction.assetDefinition?.currentPrice;
  const quantity = getCurrentQuantity(transaction);
  
  if (!currentPrice || !quantity) {
    // Fallback to original transaction value if no current price available
    return transaction.value || 0;
  }
  
  return currentPrice * quantity;
}

/**
 * Calculates the total return for a transaction
 * Total Return = Current Value - Total Investment
 */
export function getTotalReturn(transaction: Transaction | Asset): number {
  const currentValue = getCurrentValue(transaction);
  const totalInvestment = (transaction.purchasePrice || 0) * getCurrentQuantity(transaction) + (transaction.transactionCosts || 0);
  
  return currentValue - totalInvestment;
}

/**
 * Calculates the total return percentage for a transaction
 * Total Return % = (Total Return / Total Investment) * 100
 */
export function getTotalReturnPercentage(transaction: Transaction | Asset): number {
  const totalReturn = getTotalReturn(transaction);
  const quantity = getCurrentQuantity(transaction);
  const totalInvestment = (transaction.purchasePrice || 0) * quantity + (transaction.transactionCosts || 0);
  
  if (totalInvestment === 0) {
    return 0;
  }
  
  return (totalReturn / totalInvestment) * 100;
}

/**
 * Gets the effective current price for a transaction
 * Either from AssetDefinition or falls back to purchase price
 */
export function getEffectiveCurrentPrice(transaction: Transaction | Asset): number {
  return transaction.assetDefinition?.currentPrice || transaction.purchasePrice || 0;
}
