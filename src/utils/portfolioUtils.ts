import { AssetDefinition } from '@/types/domains/assets';
import { CountryAllocation } from '@/types/domains/assets/entities';

/**
 * Berechnet die gewichtete Länder-Allokation für alle AssetDefinitions.
 * Berücksichtigt Multi-Country-Definitionen (countries: CountryAllocation[])
 * und Single-Country (country).
 *
 * @param assetDefinitions AssetDefinition[]
 * @returns Record<string, number> (Land => Prozentanteil am Gesamtwert)
 */
export function getCountryAllocationWeighted(assetDefinitions: AssetDefinition[]): Record<string, number> {
  const total = assetDefinitions.reduce((sum, asset) => sum + (asset.currentPrice || 0), 0);
  const byCountry: Record<string, number> = {};

  assetDefinitions.forEach(asset => {
    const value = asset.currentPrice || 0;
    if (asset.countries && asset.countries.length > 0) {
      asset.countries.forEach((alloc: CountryAllocation) => {
        const country = alloc.country || 'Unbekannt';
        const countryValue = value * (alloc.percentage / 100);
        byCountry[country] = (byCountry[country] || 0) + countryValue;
      });
    } else if (asset.country) {
      const country = asset.country;
      byCountry[country] = (byCountry[country] || 0) + value;
    } else {
      byCountry['Unbekannt'] = (byCountry['Unbekannt'] || 0) + value;
    }
  });

  // In Prozent umrechnen
  Object.keys(byCountry).forEach(country => {
    byCountry[country] = total > 0 ? (byCountry[country] / total) * 100 : 0;
  });
  return byCountry;
}
