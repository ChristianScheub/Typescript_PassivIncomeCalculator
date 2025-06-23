// Dividend history entry for an asset
export interface DividendHistoryEntry {
  date: string; // ISO date
  amount: number;
  source: 'api' | 'manual';
  currency?: string;
  note?: string;
}
