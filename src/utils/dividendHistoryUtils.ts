import { DividendHistoryEntry } from '@/types/domains/assets/dividends';

/**
 * Filters dividend history for the last N years.
 */
export function filterDividendHistoryByYears(history: DividendHistoryEntry[], years: number): DividendHistoryEntry[] {
  const now = new Date();
  const cutoff = new Date(now.getFullYear() - years, now.getMonth(), now.getDate());
  return history.filter(entry => new Date(entry.date) >= cutoff);
}

/**
 * Calculates the average annual growth rate (CAGR) of dividends.
 * Assumes entries are sorted by date ascending.
 */
export function calculateDividendCAGR(history: DividendHistoryEntry[]): number | null {
  if (history.length < 2) return null;
  const sorted = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const years = (new Date(last.date).getTime() - new Date(first.date).getTime()) / (365.25 * 24 * 3600 * 1000);
  if (years <= 0) return null;
  if (first.amount <= 0) return null;
  return Math.pow(last.amount / first.amount, 1 / years) - 1;
}

/**
 * Generates a dividend forecast for the next N years based on history and CAGR.
 * Returns a list of forecasted DividendHistoryEntry (source: 'forecast').
 * Each forecasted entry is based on the actual payout months and amounts in the last year, grown by CAGR.
 */
export function generateDividendForecast(history: DividendHistoryEntry[], years: number): DividendHistoryEntry[] {
  if (history.length === 0) return [];
  // Finde die letzten 12 Monate mit Dividenden
  const lastYear = new Date(new Date().getFullYear() - 1, 0, 1);
  const lastYearDivs = history.filter(e => new Date(e.date) >= lastYear);
  if (lastYearDivs.length === 0) return [];
  // Wachstumsrate berechnen
  const cagr = calculateDividendCAGR(history) ?? 0;
  // Prognose für jeden Eintrag im letzten Jahr, für die nächsten N Jahre
  const forecast: DividendHistoryEntry[] = [];
  for (let y = 1; y <= years; y++) {
    lastYearDivs.forEach(div => {
      const origDate = new Date(div.date);
      const forecastDate = new Date(origDate.getFullYear() + y, origDate.getMonth(), origDate.getDate());
      forecast.push({
        date: forecastDate.toISOString(),
        amount: div.amount * Math.pow(1 + cagr, y),
        source: 'manual', // oder 'forecast', wenn du das Feld erlaubst
        currency: div.currency,
        note: 'Forecast'
      });
    });
  }
  return forecast;
}
