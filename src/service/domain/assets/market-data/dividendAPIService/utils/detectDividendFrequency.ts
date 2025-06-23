// Utility to detect dividend frequency from an array of dividend objects with a 'date' property (UNIX timestamp in seconds)
export type DividendFrequency = 'monthly' | 'quarterly' | 'annually';

export function detectDividendFrequency(dividendArray: { date?: number }[]): DividendFrequency {
  if (!dividendArray || dividendArray.length < 2) return 'annually';
  const intervals = dividendArray
    .map((item) => item.date)
    .filter(Boolean)
    .sort((a, b) => a! - b!)
    .map((date, i, arr) => (i > 0 && date && arr[i - 1]) ? date - arr[i - 1]! : null)
    .filter((d) => d !== null) as number[];
  if (!intervals.length) return 'annually';
  const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const days = avg / (60 * 60 * 24);
  if (days < 40) return 'monthly';
  if (days < 130) return 'quarterly';
  return 'annually';
}
