import type { AssetDefinition } from '@/types/domains/assets/entities';
import type { BatchResult } from '@/types/shared/batch';
import { DividendFrequency } from '@/types/shared';
import { dividendApiService } from '@/service/domain/assets/market-data/dividendAPIService';
import type { ApiConfig } from '@/types/shared/apiConfig';

// Typen für interne Verarbeitung
export type RawDividend = { amount: number; date?: number; lastDividendDate?: string; frequency?: DividendFrequency };
export type DividendEntry = { date: string; amount: number; source: 'api' | 'manual'; currency?: string };

// Hilfsfunktionen für Frequenz, Monate, Wachstum, Forecast
type DividendApiResult = { dividends?: Array<{ frequency?: DividendFrequency }> };
function calculateFrequencyAndMonths(dividendHistory: DividendEntry[], result: DividendApiResult): { frequency?: DividendFrequency, paymentMonths?: number[] } {
  let frequency: DividendFrequency | undefined = undefined;
  let paymentMonths: number[] | undefined = undefined;
  if (dividendHistory.length > 1) {
    const months = dividendHistory.map(d => new Date(d.date).getMonth() + 1); // 1-based
    paymentMonths = Array.from(new Set(months)).sort((a, b) => a - b);
  }
  const dividendsArray = Array.isArray(result.dividends) ? result.dividends : [];
  if (dividendHistory.length > 0 && dividendsArray[0]?.frequency) {
    frequency = dividendsArray[0].frequency;
  }
  return { frequency, paymentMonths };
}

function calculateDividendGrowthPast3Y(dividendHistory: DividendEntry[]): number {
  if (dividendHistory.length < 2) return 0;
  const sortedHistory = [...dividendHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const threeYearsAgo = new Date();
  threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
  const recentDividends = sortedHistory.filter(d => new Date(d.date) >= threeYearsAgo);
  if (recentDividends.length < 2) return 0;
  const firstAmount = recentDividends[0].amount;
  const lastAmount = recentDividends[recentDividends.length - 1].amount;
  const years = (new Date(recentDividends[recentDividends.length - 1].date).getTime() - new Date(recentDividends[0].date).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  if (years > 0 && firstAmount > 0) {
    return (Math.pow(lastAmount / firstAmount, 1 / years) - 1) * 100;
  }
  return 0;
}

export async function updateBatchDividends(
  definitions: AssetDefinition[],
  options = { interval: '1d', range: '2y' },
  apiConfig?: ApiConfig
): Promise<{ type: 'batchResult'; results: BatchResult<AssetDefinition>[] }> {
  const results: BatchResult<AssetDefinition>[] = await Promise.allSettled(
    definitions.filter((def: AssetDefinition) => typeof def.ticker === 'string' && def.ticker).map(async (def: AssetDefinition): Promise<BatchResult<AssetDefinition>> => {
      try {
        let result;
        
        if (apiConfig) {
          // Worker mode: Use direct API provider access
          const { dividendProviders } = await import('@/service/domain/assets/market-data/dividendAPIService/methods/dividendProviders');
          const provider = apiConfig.selectedProvider === 'finnhub' ? 'finnhub' : 'yahoo';
          const apiKey = apiConfig.apiKeys[provider] || '';
          const providerFn = dividendProviders[provider];
          
          if (!providerFn) {
            throw new Error(`No provider implementation for ${provider}`);
          }
          
          result = await providerFn(def.ticker!, {
            apiKey,
            interval: options.interval,
            range: options.range
          });
        } else {
          // Main thread mode: Use configured service
          result = await dividendApiService.fetchDividends(def.ticker!, options);
        }
        
        const { parseDividendHistoryFromApiResult } = await import('@/utils/parseDividendHistoryFromApiResult');
        const currency = def.currency || undefined;
        const rawDividends: RawDividend[] = Array.isArray(result?.dividends) ? result.dividends : [];
        const parsedDividends: DividendEntry[] = rawDividends
          .filter((div) => div.amount != null && (div.date || div.lastDividendDate))
          .map((div) => {
            let dividendDate = '';
            if (div.lastDividendDate) {
              dividendDate = new Date(div.lastDividendDate).toISOString();
            } else if (div.date) {
              dividendDate = new Date(div.date * 1000).toISOString();
            }
            return {
              date: dividendDate,
              amount: div.amount,
              source: 'api' as const,
              currency,
            };
          })
          .filter((entry) => !!entry.date && entry.amount != null);
        const dividendHistory: DividendEntry[] = rawDividends.length > 0 ? parsedDividends : parseDividendHistoryFromApiResult(result, currency);
        dividendHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        // Erweiterte Felder berechnen
        const { frequency, paymentMonths } = calculateFrequencyAndMonths(dividendHistory, result);
        const dividendGrowthPast3Y = calculateDividendGrowthPast3Y(dividendHistory);
        const dividendForecast3Y: DividendEntry[] = [];
        const last = dividendHistory.length > 0 ? dividendHistory[dividendHistory.length - 1] : undefined;
        const updatedDefinition: AssetDefinition = {
          ...def,
          dividendInfo: last
            ? {
                amount: last.amount,
                frequency: frequency || 'quarterly',
                lastDividendDate: last.date,
                paymentMonths,
              }
            : undefined,
          dividendHistory,
          dividendGrowthPast3Y,
          dividendForecast3Y,
        };
        return { success: true, updatedDefinition, symbol: def.ticker };
      } catch (error) {
        return { success: false, symbol: def.ticker, error: error instanceof Error ? error.message : String(error) };
      }
    })
  ).then(settledResults => {
    // Extrahiere erfolgreiche und fehlgeschlagene Ergebnisse aus Promise.allSettled
    return settledResults.map(settledResult => {
      if (settledResult.status === 'fulfilled') {
        return settledResult.value;
      } else {
        // Falls die Promise selbst fehlschlägt (nicht nur die API), erstelle einen Fehler-Eintrag
        return { 
          success: false, 
          symbol: 'unknown', 
          error: settledResult.reason instanceof Error ? settledResult.reason.message : String(settledResult.reason) 
        };
      }
    });
  });
  return { type: 'batchResult', results };
}
