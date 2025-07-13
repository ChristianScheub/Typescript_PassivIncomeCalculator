/**
 * Simple math utility for testing purposes
 */

export const mathUtils = {
  add: (a: number, b: number): number => a + b,
  multiply: (a: number, b: number): number => a * b,
  divide: (a: number, b: number): number => {
    if (b === 0) {
      throw new Error('Division by zero');
    }
    return a / b;
  },
  percentage: (value: number, total: number): number => {
    if (total === 0) return 0;
    return (value / total) * 100;
  },
};