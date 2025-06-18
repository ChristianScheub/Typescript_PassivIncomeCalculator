/**
 * 🎯 CACHE-FIRST ARCHITECTURE
 * 
 * Cache-first helper functions to eliminate redundant wrapper functions.
 * These functions provide direct, optimized access to portfolio cache data.
 * 
 * Benefits:
 * - ✅ O(1) performance instead of O(n) calculations
 * - ✅ No redundant wrapper functions
 * - ✅ Simplified cache access patterns
 * - ✅ Type-safe direct data access
 */

import { PortfolioPosition } from '../service/portfolioService/portfolioCalculations';
import { AssetAllocation } from '../types';
import Logger from '../service/Logger/logger';

// ✅ CACHE-FIRST: Direct asset allocation from portfolio positions
export const getAssetAllocationFromCache = (positions: PortfolioPosition[]): AssetAllocation[] => {
  if (!positions.length) {
    Logger.cache('No positions available for asset allocation');
    return [];
  }

  // Group positions by asset type and sum values
  const typeMap = new Map<string, number>();
  const totalValue = positions.reduce((sum, position) => {
    const currentValue = typeMap.get(position.type) || 0;
    typeMap.set(position.type, currentValue + position.currentValue);
    return sum + position.currentValue;
  }, 0);

  const allocation = Array.from(typeMap.entries()).map(([type, value]) => ({
    name: type,
    type: type,
    value: value,
    percentage: totalValue > 0 ? (value / totalValue) * 100 : 0
  })).sort((a, b) => b.value - a.value);

  Logger.cache(`Asset allocation calculated from cache: ${allocation.length} types, total: €${totalValue.toFixed(2)}`);
  return allocation;
};

// ✅ CACHE-FIRST: Direct monthly income from portfolio totals
export const getMonthlyIncomeFromCache = (portfolioCache: any): number => {
  const monthlyIncome = portfolioCache?.totals?.monthlyIncome || 0;
  Logger.cache(`Monthly income from cache: €${monthlyIncome.toFixed(2)}`);
  return monthlyIncome;
};

// ✅ CACHE-FIRST: Direct total value from portfolio totals
export const getTotalValueFromCache = (portfolioCache: any): number => {
  const totalValue = portfolioCache?.totals?.totalValue || 0;
  Logger.cache(`Total value from cache: €${totalValue.toFixed(2)}`);
  return totalValue;
};

// ✅ CACHE-FIRST: Portfolio validity check
export const isPortfolioCacheValid = (portfolioCache: any, portfolioCacheValid: boolean): boolean => {
  const isValid = !!(portfolioCache && portfolioCacheValid);
  Logger.cache(`Portfolio cache validity: ${isValid}`);
  return isValid;
};

// ✅ CACHE-FIRST: Get sector allocation from cached positions
export const getSectorAllocationFromCache = (positions: PortfolioPosition[]): Array<{name: string; value: number; percentage: number}> => {
  if (!positions.length) return [];

  const sectorMap = new Map<string, number>();
  const totalValue = positions.reduce((sum, position) => {
    const sector = position.sector || 'Unknown';
    const currentValue = sectorMap.get(sector) || 0;
    sectorMap.set(sector, currentValue + position.currentValue);
    return sum + position.currentValue;
  }, 0);

  return Array.from(sectorMap.entries()).map(([sector, value]) => ({
    name: sector,
    value,
    percentage: totalValue > 0 ? (value / totalValue) * 100 : 0
  })).sort((a, b) => b.value - a.value);
};

// ✅ CACHE-FIRST: Get country allocation from cached positions
export const getCountryAllocationFromCache = (positions: PortfolioPosition[]): Array<{name: string; value: number; percentage: number}> => {
  if (!positions.length) return [];

  const countryMap = new Map<string, number>();
  const totalValue = positions.reduce((sum, position) => {
    const country = position.country || 'Unknown';
    const currentValue = countryMap.get(country) || 0;
    countryMap.set(country, currentValue + position.currentValue);
    return sum + position.currentValue;
  }, 0);

  return Array.from(countryMap.entries()).map(([country, value]) => ({
    name: country,
    value,
    percentage: totalValue > 0 ? (value / totalValue) * 100 : 0
  })).sort((a, b) => b.value - a.value);
};

/**
 * 🎯 CACHE-FIRST BEST PRACTICES:
 * 
 * ✅ DO:
 * - Use these helpers instead of calculator service wrappers
 * - Check cache validity before using
 * - Use direct cache access for O(1) performance
 * - Add logging for cache hits/misses
 * 
 * ❌ DON'T:
 * - Create wrapper functions that just return cache values
 * - Use complex fallback logic in multiple places
 * - Repeat calculations when cache is available
 * - Ignore cache validity checks
 */
