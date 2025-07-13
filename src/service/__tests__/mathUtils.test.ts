/**
 * Test for MathUtils - Simple test to verify Jest setup
 */

import { describe, test, expect } from '@jest/globals';
import { mathUtils } from '../shared/utilities/mathUtils';

describe('MathUtils', () => {
  describe('Basic arithmetic operations', () => {
    test('should add numbers correctly', () => {
      expect(mathUtils.add(2, 3)).toBe(5);
      expect(mathUtils.add(-1, 1)).toBe(0);
      expect(mathUtils.add(0, 0)).toBe(0);
    });

    test('should multiply numbers correctly', () => {
      expect(mathUtils.multiply(3, 4)).toBe(12);
      expect(mathUtils.multiply(-2, 3)).toBe(-6);
      expect(mathUtils.multiply(0, 5)).toBe(0);
    });

    test('should divide numbers correctly', () => {
      expect(mathUtils.divide(10, 2)).toBe(5);
      expect(mathUtils.divide(9, 3)).toBe(3);
      expect(mathUtils.divide(-10, 2)).toBe(-5);
    });

    test('should throw error when dividing by zero', () => {
      expect(() => mathUtils.divide(10, 0)).toThrow('Division by zero');
    });

    test('should calculate percentage correctly', () => {
      expect(mathUtils.percentage(25, 100)).toBe(25);
      expect(mathUtils.percentage(50, 200)).toBe(25);
      expect(mathUtils.percentage(0, 100)).toBe(0);
      expect(mathUtils.percentage(100, 0)).toBe(0);
    });
  });

  describe('Edge cases', () => {
    test('should handle floating point numbers', () => {
      expect(mathUtils.add(0.1, 0.2)).toBeCloseTo(0.3);
      expect(mathUtils.multiply(0.1, 0.2)).toBeCloseTo(0.02);
    });

    test('should handle large numbers', () => {
      expect(mathUtils.add(1000000, 2000000)).toBe(3000000);
      expect(mathUtils.multiply(1000, 1000)).toBe(1000000);
    });
  });
});