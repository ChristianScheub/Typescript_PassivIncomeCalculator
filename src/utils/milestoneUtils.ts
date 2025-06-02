/**
 * Utility functions for milestone handling
 */

/**
 * Gets the highest achieved milestone level based on percentage
 * @param percentage The current percentage achieved
 * @returns The highest milestone level (25, 50, 75, 100) or null if none achieved
 */
export const getHighestMilestone = (percentage: number): number | null => {
  if (percentage >= 100) return 100;
  if (percentage >= 75) return 75;
  if (percentage >= 50) return 50;
  if (percentage >= 25) return 25;
  return null;
};

/**
 * Gets the highest achieved buffer milestone level based on percentage
 * @param percentage The current percentage achieved
 * @returns The highest milestone level (33, 66, 100) or null if none achieved
 */
export const getHighestBufferMilestone = (percentage: number): number | null => {
  if (percentage >= 100) return 6; // 6 months
  if (percentage >= 66.66) return 4; // 4 months
  if (percentage >= 33.33) return 2; // 2 months
  return null;
};

/**
 * Gets milestone key for translation based on milestone level
 * @param milestone The milestone level (25, 50, 75, 100)
 * @returns The translation key suffix
 */
export const getMilestoneKey = (milestone: number): string => {
  return `milestone${milestone}`;
};

/**
 * Gets buffer milestone key for translation based on milestone level
 * @param months The number of months (2, 4, 6)
 * @returns The translation key suffix
 */
export const getBufferMilestoneKey = (months: number): string => {
  return `milestone${months}`;
};
