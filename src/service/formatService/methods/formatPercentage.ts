import Logger from '../../Logger/logger';

export const formatPercentage = (value: number, options?: {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}): string => {
  Logger.infoService(`Formatting percentage: ${value}`);
  return new Intl.NumberFormat('de-DE', {
    style: 'percent',
    minimumFractionDigits: options?.minimumFractionDigits ?? 2,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  }).format(value / 100)
};
