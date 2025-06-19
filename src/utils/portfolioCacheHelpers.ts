import { PortfolioPosition } from '../types/domains/portfolio/position';
import { TypedPortfolioCache } from '../types/domains/portfolio/cache';
import { AssetAllocation } from '@/types/domains/portfolio';
import Logger from '../service/Logger/logger';

export const getAssetAllocationFromCache = (positions: PortfolioPosition[]): AssetAllocation[] => {
  if (!positions.length) {
    Logger.cache('No positions available for asset allocation');
    return [];
  }

  // Group positions by asset type and sum values
  const typeMap = new Map<string, { value: number; count: number }>();
  const totalValue = positions.reduce((sum, position) => {
    const current = typeMap.get(position.type) || { value: 0, count: 0 };
    typeMap.set(position.type, {
      value: current.value + position.currentValue,
      count: current.count + 1
    });
    return sum + position.currentValue;
  }, 0);

  const allocation = Array.from(typeMap.entries()).map(([type, data]) => ({
    name: type,
    type: type,
    value: data.value,
    percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0,
    count: data.count
  })).sort((a, b) => b.value - a.value);

  Logger.cache(`Asset allocation calculated from cache: ${allocation.length} types, total: €${totalValue.toFixed(2)}`);
  return allocation;
};

export const getMonthlyIncomeFromCache = (portfolioCache: Partial<TypedPortfolioCache> | null): number => {
  const monthlyIncome = (portfolioCache as any)?.totals?.monthlyIncome || 0;
  Logger.cache(`Monthly income from cache: €${monthlyIncome.toFixed(2)}`);
  return monthlyIncome;
};

export const getTotalValueFromCache = (portfolioCache: Partial<TypedPortfolioCache> | null): number => {
  const totalValue = portfolioCache?.totalValue || (portfolioCache as any)?.totals?.totalValue || 0;
  Logger.cache(`Total value from cache: €${totalValue.toFixed(2)}`);
  return totalValue;
};

export const isPortfolioCacheValid = (portfolioCache: Partial<TypedPortfolioCache> | null, portfolioCacheValid: boolean): boolean => {
  const isValid = !!(portfolioCache && portfolioCacheValid);
  Logger.cache(`Portfolio cache validity: ${isValid}`);
  return isValid;
};

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
