import Logger from '../../Logger/logger';

export const formatPercentage = (value: number, options?: {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}): string => {
  Logger.info(`Formatting percentage: ${value}`);
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: options?.minimumFractionDigits ?? 0,
    maximumFractionDigits: options?.maximumFractionDigits ?? 0,
  }).format(value)};
