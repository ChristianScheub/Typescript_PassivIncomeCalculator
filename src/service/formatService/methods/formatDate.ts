import Logger from '../../Logger/logger';

export const formatDate = (date: string | Date): string => {
  Logger.info(`Formatting date: ${date}`);
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatMonth = (monthNumber: number, format: 'short' | 'long' = 'short'): string => {
  Logger.info(`Formatting month: ${monthNumber}, format: ${format}`);
  // Use a fixed year (e.g., 2024) to create a date object for the month
  const date = new Date(2024, monthNumber - 1);
  return date.toLocaleString('default', { month: format });
};
