import { Transaction as Asset, AssetDefinition } from '@/types/domains/assets/';
import { Income } from '@/types/domains/financial/';
import { calculatorService } from '@/service/';
import { PortfolioRecommendation } from '@/types/domains/analytics';
import Logger from '@/service/shared/logging/Logger/logger';

export const generateIncomeRecommendations = (
  assets: Asset[],
  income: Income[],
  assetDefinitions: AssetDefinition[] = [],
  portfolioCache?: { totals: { monthlyIncome: number } } | null // Optional portfolio cache
): PortfolioRecommendation[] => {
  const recommendations: PortfolioRecommendation[] = [];

  // Calculate income metrics
  const totalMonthlyIncome = calculatorService.calculateTotalMonthlyIncome(income);
  
  // OPTIMIZATION: Use portfolio cache if available to avoid asset recalculations
  let passiveIncomeFromAssets: number;
  if (portfolioCache?.totals?.monthlyIncome !== undefined) {
    passiveIncomeFromAssets = portfolioCache.totals.monthlyIncome;
    Logger.cache(`Using portfolio cache for asset income in recommendations: ${passiveIncomeFromAssets} [CACHE HIT]`);
  } else {
    Logger.cache(`Portfolio cache not available, falling back to asset calculations [CACHE MISS]`);
    passiveIncomeFromAssets = calculatorService.calculateTotalMonthlyAssetIncome(assets);
  }
  
  const passiveIncomeFromSources = calculatorService.calculatePassiveIncome(income);
  
  const totalPassiveIncome = passiveIncomeFromAssets + passiveIncomeFromSources;
  const passiveRatio = totalMonthlyIncome > 0 ? (totalPassiveIncome / totalMonthlyIncome) * 100 : 0;

  Logger.infoService(`Income recommendations: passiveFromAssets=${passiveIncomeFromAssets}, passiveFromSources=${passiveIncomeFromSources}, ratio=${passiveRatio.toFixed(1)}%`);

  // 9. Passive Income Increase
  if (passiveRatio < 10) {
    recommendations.push({
      id: 'increase-passive-income',
      category: 'income',
      priority: 'high',
      titleKey: 'recommendations.income.increasePassiveIncome.title',
      descriptionKey: 'recommendations.income.increasePassiveIncome.description',
      actionCategory: 'income',
      actionSubCategory: 'passive',
      metadata: { currentRatio: Math.round(passiveRatio) }
    });
  }

  // 10. Dividend Assets
  const dividendAssets = findDividendAssets(assets, assetDefinitions);
  if (dividendAssets.length === 0 && assets.length > 0) {
    recommendations.push({
      id: 'add-dividend-assets',
      category: 'income',
      priority: 'medium',
      titleKey: 'recommendations.income.addDividendAssets.title',
      descriptionKey: 'recommendations.income.addDividendAssets.description',
      actionCategory: 'assets',
      actionSubCategory: 'management',
      metadata: { assetCount: assets.length }
    });
  }

  // 11. Rental Income Optimization
  const realEstateAssets = findRealEstateAssets(assets, assetDefinitions);
  const assetsWithoutIncome = findAssetsWithoutIncome(realEstateAssets, assetDefinitions);
  if (
    (realEstateAssets.length < 4 && assetsWithoutIncome.length >= 2) ||
    (realEstateAssets.length >= 4 && assetsWithoutIncome.length / realEstateAssets.length > 0.4)
  ) {
    recommendations.push({
      id: 'optimize-rental-income',
      category: 'income',
      priority: 'medium',
      titleKey: 'recommendations.income.optimizeRentalIncome.title',
      descriptionKey: 'recommendations.income.optimizeRentalIncome.description',
      actionCategory: 'assets',
      actionSubCategory: 'definitions',
      metadata: { count: assetsWithoutIncome.length }
    });
  }

  // 12. Income Source Diversification
  if (income.length < 2) {
    recommendations.push({
      id: 'diversify-income-sources',
      category: 'income',
      priority: 'high',
      titleKey: 'recommendations.income.diversifyIncomeSources.title',
      descriptionKey: 'recommendations.income.diversifyIncomeSources.description',
      actionCategory: 'income',
      actionSubCategory: 'sources',
      metadata: { currentSources: income.length }
    });
  }

  // 13. Interest Income
  // Now: If user has >5 assets, but none generate any income (no bonds, no dividend stocks, no rental, etc.)
  const incomeGeneratingAssets = assets.filter(asset => {
    // This should be replaced with real logic: asset generates income if it's a bond, dividend stock, or rental property
    // For now, we assume findBondAssets, findDividendAssets, and realEstateAssets with income
    return (
      findBondAssets([asset], assetDefinitions).length > 0 ||
      findDividendAssets([asset], assetDefinitions).length > 0 ||
      (findRealEstateAssets([asset], assetDefinitions).length > 0 && findAssetsWithoutIncome([asset], assetDefinitions).length === 0)
    );
  });
  if (incomeGeneratingAssets.length === 0 && assets.length > 5) {
    recommendations.push({
      id: 'add-interest-income',
      category: 'income',
      priority: 'low',
      titleKey: 'recommendations.income.addInterestIncome.title',
      descriptionKey: 'recommendations.income.addInterestIncome.description',
      actionCategory: 'assets',
      actionSubCategory: 'management'
    });
  }

  // 15. Side Hustle Development
  const sideHustleIncome = income.filter(inc => inc.type === 'side_hustle');
  if (sideHustleIncome.length === 0 && income.filter(inc => inc.type === 'salary').length > 0) {
    recommendations.push({
      id: 'develop-side-hustle',
      category: 'income',
      priority: 'medium',
      titleKey: 'recommendations.income.developSideHustle.title',
      descriptionKey: 'recommendations.income.developSideHustle.description',
      actionCategory: 'income',
      actionSubCategory: 'sources'
    });
  }

  // 16. Income Timing Optimization
  const irregularIncome = findIrregularIncome(income);
  if (irregularIncome.length > 0) {
    recommendations.push({
      id: 'optimize-income-timing',
      category: 'income',
      priority: 'low',
      titleKey: 'recommendations.income.optimizeIncomeTiming.title',
      descriptionKey: 'recommendations.income.optimizeIncomeTiming.description',
      actionCategory: 'income',
      actionSubCategory: 'scheduling',
      metadata: { count: irregularIncome.length }
    });
  }

  return recommendations;
};

// Helper functions
const findDividendAssets = (_assets: Asset[], _assetDefinitions: AssetDefinition[]): Asset[] => {
  // TODO: Find assets with dividend information
  return [];
};

const findRealEstateAssets = (_assets: Asset[], _assetDefinitions: AssetDefinition[]): Asset[] => {
  // TODO: Find real estate assets
  return [];
};

const findAssetsWithoutIncome = (_assets: Asset[], _assetDefinitions: AssetDefinition[]): Asset[] => {
  // TODO: Find assets without configured income
  return [];
};

const findBondAssets = (_assets: Asset[], _assetDefinitions: AssetDefinition[]): Asset[] => {
  // TODO: Find bond assets
  return [];
};

const findIrregularIncome = (_income: Income[]): Income[] => {
  // TODO: Find income with irregular payment schedules
  return [];
};
