import Logger from '../../Logger/logger';

export const formatNumber = (value: number, options?: {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}): string => {
  Logger.infoService(`Formatting number: ${value}`);
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: options?.minimumFractionDigits ?? 0,
    maximumFractionDigits: options?.maximumFractionDigits ?? 0,
  }).format(value);
};
