import { PortfolioRecommendation } from '@/types/domains/analytics';
import { Transaction as Asset, AssetDefinition } from '@/types/domains/assets/';

// Hilfsfunktionen für Portfolio-Analysen
function getTotalValue(assetDefinitions: AssetDefinition[]): number {
  return assetDefinitions.reduce((sum, asset) => sum + (asset.currentPrice || 0), 0);
}

function getSectorAllocation(assetDefinitions: AssetDefinition[]): Record<string, number> {
  const total = getTotalValue(assetDefinitions);
  const bySector: Record<string, number> = {};
  assetDefinitions.forEach(asset => {
    const sector = asset.sector || 'Unbekannt';
    bySector[sector] = (bySector[sector] || 0) + (asset.currentPrice || 0);
  });
  Object.keys(bySector).forEach(sector => {
    bySector[sector] = total > 0 ? (bySector[sector] / total) * 100 : 0;
  });
  return bySector;
}

function getCountryAllocation(assetDefinitions: AssetDefinition[]): Record<string, number> {
  const total = getTotalValue(assetDefinitions);
  const byCountry: Record<string, number> = {};
  assetDefinitions.forEach(asset => {
    const country = asset.country || 'Unbekannt';
    byCountry[country] = (byCountry[country] || 0) + (asset.currentPrice || 0);
  });
  Object.keys(byCountry).forEach(country => {
    byCountry[country] = total > 0 ? (byCountry[country] / total) * 100 : 0;
  });
  return byCountry;
}

function getCashQuote(assetDefinitions: AssetDefinition[]): number {
  const total = getTotalValue(assetDefinitions);
  const cash = assetDefinitions.filter(a => a.type === 'cash').reduce((sum, a) => sum + (a.currentPrice || 0), 0);
  return total > 0 ? (cash / total) * 100 : 0;
}

function getDividendYield(assetDefinitions: AssetDefinition[]): number {
  // Annahme: dividendInfo.amount ist Jahresdividende, currentPrice ist aktuell
  const dividendSum = assetDefinitions
    .filter(a => a.dividendInfo && typeof a.dividendInfo.amount === 'number')
    .reduce((sum, a) => sum + (a.dividendInfo!.amount || 0), 0);
  const total = getTotalValue(assetDefinitions);
  return total > 0 ? (dividendSum / total) * 100 : 0;
}

function getSpeculativeQuote(assetDefinitions: AssetDefinition[]): number {
  // Annahme: type === 'crypto' oder riskLevel === 'high' ist spekulativ
  const total = getTotalValue(assetDefinitions);
  const speculative = assetDefinitions.filter(a => a.type === 'crypto' || a.riskLevel === 'high').reduce((sum, a) => sum + (a.currentPrice || 0), 0);
  return total > 0 ? (speculative / total) * 100 : 0;
}

function getLossPositions(assets: Asset[]): Asset[] {
  return assets.filter(a => typeof a.totalReturnPercentage === 'number' && a.totalReturnPercentage < -40);
}

export const generateAssetRecommendations = (
  assets: Asset[],
  assetDefinitions: AssetDefinition[] = []
): PortfolioRecommendation[] => {
  const recommendations: PortfolioRecommendation[] = [];
  const total = getTotalValue(assetDefinitions);

  // 1. Klumpenrisiko (Einzelwert >30%)
  const riskyAssets = assetDefinitions.filter(a => total > 0 && (a.currentPrice || 0) / total > 0.3);
  if (riskyAssets.length > 0) {
    recommendations.push({
      id: 'single-asset-risk',
      category: 'assets',
      priority: 'high',
      titleKey: 'recommendations.assets.singleAssetRisk.title',
      descriptionKey: 'recommendations.assets.singleAssetRisk.description',
      actionCategory: 'assets',
      actionSubCategory: 'portfolio',
      metadata: { count: riskyAssets.length }
    });
  }

  // 2. Sektorrisiko (Sektor >40%)
  const sectorAlloc = getSectorAllocation(assetDefinitions);
  const maxSector = Object.entries(sectorAlloc).reduce((max, curr) => curr[1] > max[1] ? curr : max, ["", 0]);
  if (maxSector[1] > 40) {
    recommendations.push({
      id: 'sector-risk',
      category: 'assets',
      priority: 'medium',
      titleKey: 'recommendations.assets.sectorRisk.title',
      descriptionKey: 'recommendations.assets.sectorRisk.description',
      actionCategory: 'assets',
      actionSubCategory: 'portfolio',
      metadata: { sector: maxSector[0], percentage: Math.round(maxSector[1]) }
    });
  }

  // 3. Regionale Diversifikation (Land >60%)
  const countryAlloc = getCountryAllocation(assetDefinitions);
  const maxCountry = Object.entries(countryAlloc).reduce((max, curr) => curr[1] > max[1] ? curr : max, ["", 0]);
  if (maxCountry[1] > 60) {
    recommendations.push({
      id: 'country-risk',
      category: 'assets',
      priority: 'medium',
      titleKey: 'recommendations.assets.countryRisk.title',
      descriptionKey: 'recommendations.assets.countryRisk.description',
      actionCategory: 'assets',
      actionSubCategory: 'portfolio',
      metadata: { country: maxCountry[0], percentage: Math.round(maxCountry[1]) }
    });
  }

  // 4. Cashquote zu hoch/niedrig
  const cashQuote = getCashQuote(assetDefinitions);
  if (cashQuote > 30) {
    recommendations.push({
      id: 'cash-too-high',
      category: 'assets',
      priority: 'low',
      titleKey: 'recommendations.assets.cashTooHigh.title',
      descriptionKey: 'recommendations.assets.cashTooHigh.description',
      actionCategory: 'assets',
      actionSubCategory: 'management',
      metadata: { cashQuote: Math.round(cashQuote) }
    });
  } else if (cashQuote < 2) {
    recommendations.push({
      id: 'cash-too-low',
      category: 'assets',
      priority: 'low',
      titleKey: 'recommendations.assets.cashTooLow.title',
      descriptionKey: 'recommendations.assets.cashTooLow.description',
      actionCategory: 'assets',
      actionSubCategory: 'management',
      metadata: { cashQuote: Math.round(cashQuote) }
    });
  }

  // 5. Dividendenrendite unter 1% (nur wenn Dividenden vorhanden)
  const divYield = getDividendYield(assetDefinitions);
  if (divYield > 0 && divYield < 1) {
    recommendations.push({
      id: 'dividend-yield-low',
      category: 'assets',
      priority: 'low',
      titleKey: 'recommendations.assets.dividendYieldLow.title',
      descriptionKey: 'recommendations.assets.dividendYieldLow.description',
      actionCategory: 'assets',
      actionSubCategory: 'management',
      metadata: { dividendYield: Math.round(divYield * 100) / 100 }
    });
  }

  // 6. Spekulative Assets >20%
  const specQuote = getSpeculativeQuote(assetDefinitions);
  if (specQuote > 20) {
    recommendations.push({
      id: 'speculative-assets',
      category: 'assets',
      priority: 'medium',
      titleKey: 'recommendations.assets.speculativeAssets.title',
      descriptionKey: 'recommendations.assets.speculativeAssets.description',
      actionCategory: 'assets',
      actionSubCategory: 'portfolio',
      metadata: { speculativeQuote: Math.round(specQuote) }
    });
  }

  // 7. Verlustpositionen >40% im Minus
  const lossPositions = getLossPositions(assets);
  if (lossPositions.length > 0) {
    recommendations.push({
      id: 'loss-positions',
      category: 'assets',
      priority: 'medium',
      titleKey: 'recommendations.assets.lossPositions.title',
      descriptionKey: 'recommendations.assets.lossPositions.description',
      actionCategory: 'assets',
      actionSubCategory: 'management',
      metadata: { count: lossPositions.length }
    });
  }

  // 8. Rebalancing-Hinweis (wenn Aktienquote >90% oder <30%)
  const stockValue = assetDefinitions.filter(a => a.type === 'stock').reduce((sum, a) => sum + (a.currentPrice || 0), 0);
  const stockQuote = total > 0 ? (stockValue / total) * 100 : 0;
  if (stockQuote > 90 || stockQuote < 30) {
    recommendations.push({
      id: 'rebalancing',
      category: 'assets',
      priority: 'medium',
      titleKey: 'recommendations.assets.rebalancing.title',
      descriptionKey: 'recommendations.assets.rebalancing.description',
      actionCategory: 'assets',
      actionSubCategory: 'portfolio',
      metadata: { stockQuote: Math.round(stockQuote) }
    });
  }

  return recommendations;
};
