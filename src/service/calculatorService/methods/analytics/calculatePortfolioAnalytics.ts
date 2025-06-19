import { PortfolioPosition } from '../../../../types/domains/portfolio/position';
import Logger from '../../../Logger/logger';

export interface AllocationData {
  name: string;
  value: number;
  percentage: number;
}

export interface CategoryBreakdownData {
  categoryName: string;
  categoryId: string;
  totalValue: number;
  totalPercentage: number;
  options: AllocationData[];
}

export interface PortfolioAnalyticsData {
  assetAllocation: AllocationData[];
  sectorAllocation: AllocationData[];
  countryAllocation: AllocationData[];
  categoryAllocation: AllocationData[];
  categoryBreakdown: CategoryBreakdownData[];
}

export const calculatePortfolioAnalytics = (positions: PortfolioPosition[]): PortfolioAnalyticsData => {
  Logger.infoService('Calculating portfolio analytics from positions');
  
  // Calculate total portfolio value for percentage calculations
  const totalValue = positions.reduce((sum, pos) => sum + pos.currentValue, 0);
  
  if (totalValue <= 0) {
    Logger.infoService('No portfolio value found, returning empty analytics');
    return {
      assetAllocation: [],
      sectorAllocation: [],
      countryAllocation: [],
      categoryAllocation: [],
      categoryBreakdown: []
    };
  }

  // Asset Type Allocation
  const assetTypeMap = new Map<string, number>();
  positions.forEach(position => {
    const type = position.type;
    const currentValue = assetTypeMap.get(type) || 0;
    assetTypeMap.set(type, currentValue + position.currentValue);
  });

  const assetAllocation = Array.from(assetTypeMap.entries())
    .map(([type, value]) => ({
      name: type,
      type,
      value,
      percentage: (value / totalValue) * 100
    }))
    .sort((a, b) => b.value - a.value);

  // Sector Allocation - Supporting both single and multi-sector assets
  const sectorMap = new Map<string, number>();
  positions.forEach(position => {
    // Check if asset has multi-sector allocation
    const sectors = position.assetDefinition?.sectors;
    if (sectors && sectors.length > 0) {
      // Multi-sector asset: distribute value proportionally
      sectors.forEach(sectorAllocation => {
        const sectorName = sectorAllocation.sectorName || 'Unknown';
        const proportionalValue = (position.currentValue * sectorAllocation.percentage) / 100;
        const currentValue = sectorMap.get(sectorName) || 0;
        sectorMap.set(sectorName, currentValue + proportionalValue);
      });
    } else {
      // Single sector asset (legacy or no sectors)
      const sector = position.sector || 'Unknown';
      const currentValue = sectorMap.get(sector) || 0;
      sectorMap.set(sector, currentValue + position.currentValue);
    }
  });

  const sectorAllocation = Array.from(sectorMap.entries())
    .map(([sector, value]) => ({
      name: sector,
      value,
      percentage: (value / totalValue) * 100
    }))
    .sort((a, b) => b.value - a.value);

  // Country Allocation
  const countryMap = new Map<string, number>();
  positions.forEach(position => {
    const country = position.country || 'Unknown';
    const currentValue = countryMap.get(country) || 0;
    countryMap.set(country, currentValue + position.currentValue);
  });

  const countryAllocation = Array.from(countryMap.entries())
    .map(([country, value]) => ({
      name: country,
      value,
      percentage: (value / totalValue) * 100
    }))
    .sort((a, b) => b.value - a.value);

  // Category Allocation
  const categoryMap = new Map<string, number>();
  positions.forEach(position => {
    if (position.categoryAssignments && position.categoryAssignments.length > 0) {
      position.categoryAssignments.forEach(assignment => {
        // Use only the option name, not category:option combination
        const optionName = assignment.option.name;
        const currentValue = categoryMap.get(optionName) || 0;
        categoryMap.set(optionName, currentValue + position.currentValue);
      });
    } else {
      const currentValue = categoryMap.get('Uncategorized') || 0;
      categoryMap.set('Uncategorized', currentValue + position.currentValue);
    }
  });

  const categoryAllocation = Array.from(categoryMap.entries())
    .map(([category, value]) => ({
      name: category,
      value,
      percentage: (value / totalValue) * 100
    }))
    .sort((a, b) => b.value - a.value);

  // Category Breakdown - Hierarchical structure showing categories and their options
  const categoryBreakdownMap = new Map<string, { categoryData: { name: string; id: string }, optionMap: Map<string, number> }>();
  
  positions.forEach(position => {
    if (position.categoryAssignments && position.categoryAssignments.length > 0) {
      position.categoryAssignments.forEach(assignment => {
        const categoryKey = assignment.category.id;
        const categoryName = assignment.category.name;
        const optionName = assignment.option.name;
        
        if (!categoryBreakdownMap.has(categoryKey)) {
          categoryBreakdownMap.set(categoryKey, {
            categoryData: { name: categoryName, id: categoryKey },
            optionMap: new Map<string, number>()
          });
        }
        
        const categoryInfo = categoryBreakdownMap.get(categoryKey)!;
        const currentValue = categoryInfo.optionMap.get(optionName) || 0;
        categoryInfo.optionMap.set(optionName, currentValue + position.currentValue);
      });
    } else {
      // Handle uncategorized assets
      const uncategorizedKey = 'uncategorized';
      if (!categoryBreakdownMap.has(uncategorizedKey)) {
        categoryBreakdownMap.set(uncategorizedKey, {
          categoryData: { name: 'Uncategorized', id: uncategorizedKey },
          optionMap: new Map<string, number>()
        });
      }
      
      const categoryInfo = categoryBreakdownMap.get(uncategorizedKey)!;
      const currentValue = categoryInfo.optionMap.get('Uncategorized') || 0;
      categoryInfo.optionMap.set('Uncategorized', currentValue + position.currentValue);
    }
  });

  const categoryBreakdown = Array.from(categoryBreakdownMap.entries())
    .map(([, { categoryData, optionMap }]) => {
      const totalCategoryValue = Array.from(optionMap.values()).reduce((sum, value) => sum + value, 0);
      const options = Array.from(optionMap.entries())
        .map(([optionName, value]) => ({
          name: optionName,
          value,
          percentage: totalCategoryValue > 0 ? (value / totalCategoryValue) * 100 : 0
        }))
        .sort((a, b) => b.value - a.value);
      
      return {
        categoryName: categoryData.name,
        categoryId: categoryData.id,
        totalValue: totalCategoryValue,
        totalPercentage: totalValue > 0 ? (totalCategoryValue / totalValue) * 100 : 0,
        options
      };
    })
    .sort((a, b) => b.totalValue - a.totalValue);

  Logger.infoService(
    `Portfolio analytics calculated: ${assetAllocation.length} asset types, ${sectorAllocation.length} sectors, ${countryAllocation.length} countries, ${categoryAllocation.length} categories, ${categoryBreakdown.length} category breakdowns`
  );

  return {
    assetAllocation,
    sectorAllocation,
    countryAllocation,
    categoryAllocation,
    categoryBreakdown
  };
};

export interface IncomeAnalyticsData {
  assetTypeIncome: AllocationData[];
  sectorIncome: AllocationData[];
  countryIncome: AllocationData[];
  categoryIncome: AllocationData[];
  categoryIncomeBreakdown: CategoryBreakdownData[];
}

export const calculateIncomeAnalytics = (positions: PortfolioPosition[]): IncomeAnalyticsData => {
  Logger.infoService('Calculating income analytics from positions');
  
  // Calculate total monthly income for percentage calculations
  const totalIncome = positions.reduce((sum, pos) => sum + pos.monthlyIncome, 0);
  
  if (totalIncome <= 0) {
    Logger.infoService('No monthly income found, returning empty income analytics');
    return {
      assetTypeIncome: [],
      sectorIncome: [],
      countryIncome: [],
      categoryIncome: [],
      categoryIncomeBreakdown: []
    };
  }

  // Asset Type Income Distribution
  const assetTypeIncomeMap = new Map<string, number>();
  positions.forEach(position => {
    if (position.monthlyIncome > 0) {
      const type = position.type;
      const currentIncome = assetTypeIncomeMap.get(type) || 0;
      assetTypeIncomeMap.set(type, currentIncome + position.monthlyIncome);
    }
  });

  const assetTypeIncome = Array.from(assetTypeIncomeMap.entries())
    .map(([type, income]) => ({
      name: type,
      value: income,
      percentage: (income / totalIncome) * 100
    }))
    .sort((a, b) => b.value - a.value);

  // Sector Income Distribution - Supporting both single and multi-sector assets
  const sectorIncomeMap = new Map<string, number>();
  positions.forEach(position => {
    if (position.monthlyIncome > 0) {
      // Check if asset has multi-sector allocation
      const sectors = position.assetDefinition?.sectors;
      if (sectors && sectors.length > 0) {
        // Multi-sector asset: distribute income proportionally
        sectors.forEach(sectorAllocation => {
          const sectorName = sectorAllocation.sectorName || 'Unknown';
          const proportionalIncome = (position.monthlyIncome * sectorAllocation.percentage) / 100;
          const currentIncome = sectorIncomeMap.get(sectorName) || 0;
          sectorIncomeMap.set(sectorName, currentIncome + proportionalIncome);
        });
      } else {
        // Single sector asset (legacy or no sectors)
        const sector = position.sector || 'Unknown';
        const currentIncome = sectorIncomeMap.get(sector) || 0;
        sectorIncomeMap.set(sector, currentIncome + position.monthlyIncome);
      }
    }
  });

  const sectorIncome = Array.from(sectorIncomeMap.entries())
    .map(([sector, income]) => ({
      name: sector,
      value: income,
      percentage: (income / totalIncome) * 100
    }))
    .sort((a, b) => b.value - a.value);

  // Country Income Distribution
  const countryIncomeMap = new Map<string, number>();
  positions.forEach(position => {
    if (position.monthlyIncome > 0) {
      const country = position.country || 'Unknown';
      const currentIncome = countryIncomeMap.get(country) || 0;
      countryIncomeMap.set(country, currentIncome + position.monthlyIncome);
    }
  });

  const countryIncome = Array.from(countryIncomeMap.entries())
    .map(([country, income]) => ({
      name: country,
      value: income,
      percentage: (income / totalIncome) * 100
    }))
    .sort((a, b) => b.value - a.value);

  // Category Income Distribution
  const categoryIncomeMap = new Map<string, number>();
  positions.forEach(position => {
    if (position.monthlyIncome > 0) {
      if (position.categoryAssignments && position.categoryAssignments.length > 0) {
        position.categoryAssignments.forEach(assignment => {
          // Use only the option name, not category:option combination
          const optionName = assignment.option.name;
          const currentIncome = categoryIncomeMap.get(optionName) || 0;
          categoryIncomeMap.set(optionName, currentIncome + position.monthlyIncome);
        });
      } else {
        const currentIncome = categoryIncomeMap.get('Uncategorized') || 0;
        categoryIncomeMap.set('Uncategorized', currentIncome + position.monthlyIncome);
      }
    }
  });

  const categoryIncome = Array.from(categoryIncomeMap.entries())
    .map(([category, income]) => ({
      name: category,
      value: income,
      percentage: (income / totalIncome) * 100
    }))
    .sort((a, b) => b.value - a.value);

  // Category Income Breakdown - Hierarchical structure showing categories and their option income
  const categoryIncomeBreakdownMap = new Map<string, { categoryData: { name: string; id: string }, optionMap: Map<string, number> }>();
  
  positions.forEach(position => {
    if (position.monthlyIncome > 0) {
      if (position.categoryAssignments && position.categoryAssignments.length > 0) {
        position.categoryAssignments.forEach(assignment => {
          const categoryKey = assignment.category.id;
          const categoryName = assignment.category.name;
          const optionName = assignment.option.name;
          
          if (!categoryIncomeBreakdownMap.has(categoryKey)) {
            categoryIncomeBreakdownMap.set(categoryKey, {
              categoryData: { name: categoryName, id: categoryKey },
              optionMap: new Map<string, number>()
            });
          }
          
          const categoryInfo = categoryIncomeBreakdownMap.get(categoryKey)!;
          const currentIncome = categoryInfo.optionMap.get(optionName) || 0;
          categoryInfo.optionMap.set(optionName, currentIncome + position.monthlyIncome);
        });
      } else {
        // Handle uncategorized assets
        const uncategorizedKey = 'uncategorized';
        if (!categoryIncomeBreakdownMap.has(uncategorizedKey)) {
          categoryIncomeBreakdownMap.set(uncategorizedKey, {
            categoryData: { name: 'Uncategorized', id: uncategorizedKey },
            optionMap: new Map<string, number>()
          });
        }
        
        const categoryInfo = categoryIncomeBreakdownMap.get(uncategorizedKey)!;
        const currentIncome = categoryInfo.optionMap.get('Uncategorized') || 0;
        categoryInfo.optionMap.set('Uncategorized', currentIncome + position.monthlyIncome);
      }
    }
  });

  const categoryIncomeBreakdown = Array.from(categoryIncomeBreakdownMap.entries())
    .map(([, { categoryData, optionMap }]) => {
      const totalCategoryIncome = Array.from(optionMap.values()).reduce((sum, income) => sum + income, 0);
      const options = Array.from(optionMap.entries())
        .map(([optionName, income]) => ({
          name: optionName,
          value: income,
          percentage: totalCategoryIncome > 0 ? (income / totalCategoryIncome) * 100 : 0
        }))
        .sort((a, b) => b.value - a.value);
      
      return {
        categoryName: categoryData.name,
        categoryId: categoryData.id,
        totalValue: totalCategoryIncome,
        totalPercentage: totalIncome > 0 ? (totalCategoryIncome / totalIncome) * 100 : 0,
        options
      };
    })
    .sort((a, b) => b.totalValue - a.totalValue);

  Logger.infoService(
    `Income analytics calculated: ${assetTypeIncome.length} asset types, ${sectorIncome.length} sectors, ${countryIncome.length} countries, ${categoryIncome.length} categories, ${categoryIncomeBreakdown.length} category breakdowns, total income: ${totalIncome}`
  );

  return {
    assetTypeIncome,
    sectorIncome,
    countryIncome,
    categoryIncome,
    categoryIncomeBreakdown
  };
};
