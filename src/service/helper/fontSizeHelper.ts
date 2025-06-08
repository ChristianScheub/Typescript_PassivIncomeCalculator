import formatService from '../formatService';

/**
 * Helper function to get dynamic font size based on number of digits in currency value
 * @param value - The numeric value to calculate font size for
 * @returns Tailwind CSS classes for responsive font sizing
 */
export const getDynamicFontSize = (value: number): string => {
  const formattedValue = formatService.formatCurrency(value);
  const digitCount = formattedValue.replace(/[^\d]/g, '').length;
  
  if (digitCount >= 7) {
    return 'text-sm sm:text-base'; // 7+ digits: smaller font
  } else if (digitCount >= 6) {
    return 'text-base sm:text-lg'; // 6 digits: medium font
  } else if (digitCount >= 5) {
    return 'text-lg sm:text-xl'; // 5 digits: default-small font
  } else {
    return 'text-xl sm:text-2xl'; // 4 or fewer digits: largest font
  }
};
