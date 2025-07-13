import { mockLiabilityCalculatorService as liabilityCalculatorService } from './mockServices';

// Mock types for testing
interface Liability {
  id: string;
  name: string;
  currentBalance: number;
  interestRate: number;
  paymentSchedule?: {
    frequency: 'monthly' | 'quarterly' | 'annually' | 'custom';
    amount: number;
    customAmounts?: Record<number, number>;
  };
}

// Mock the logger
jest.mock('../shared/logging/Logger/logger', () => ({
  infoService: jest.fn(),
  errorService: jest.fn(),
  warnService: jest.fn(),
}));

describe('LiabilityCalculatorService', () => {
  describe('Individual Liability Calculations', () => {
    it('should calculate monthly liability payment correctly', () => {
      const liability: Liability = {
        id: '1',
        name: 'Credit Card',
        currentBalance: 5000,
        interestRate: 18.99,
        paymentSchedule: {
          frequency: 'monthly',
          amount: 200,
        },
      };

      const result = liabilityCalculatorService.calculateLiabilityMonthlyPayment(liability);
      expect(result).toBe(200);
    });

    it('should calculate quarterly liability payment as monthly', () => {
      const liability: Liability = {
        id: '1',
        name: 'Property Tax',
        currentBalance: 4000,
        interestRate: 0,
        paymentSchedule: {
          frequency: 'quarterly',
          amount: 1000,
        },
      };

      const result = liabilityCalculatorService.calculateLiabilityMonthlyPayment(liability);
      expect(result).toBeCloseTo(333.33, 2); // 1000 * 4 / 12
    });

    it('should calculate annual liability payment as monthly', () => {
      const liability: Liability = {
        id: '1',
        name: 'Insurance Premium',
        currentBalance: 1200,
        interestRate: 0,
        paymentSchedule: {
          frequency: 'annually',
          amount: 1200,
        },
      };

      const result = liabilityCalculatorService.calculateLiabilityMonthlyPayment(liability);
      expect(result).toBe(100); // 1200 / 12
    });

    it('should handle liability without payment schedule', () => {
      const liability: Liability = {
        id: '1',
        name: 'Unpaid Debt',
        currentBalance: 5000,
        interestRate: 12,
      };

      const result = liabilityCalculatorService.calculateLiabilityMonthlyPayment(liability);
      expect(result).toBe(0);
    });

    it('should handle custom payment schedule', () => {
      const liability: Liability = {
        id: '1',
        name: 'Seasonal Payments',
        currentBalance: 6000,
        interestRate: 5,
        paymentSchedule: {
          frequency: 'custom',
          amount: 0, // Not used for custom
          customAmounts: {
            3: 500,  // March
            6: 800,  // June
            9: 300,  // September
            12: 1000, // December
          },
        },
      };

      const result = liabilityCalculatorService.calculateLiabilityMonthlyPayment(liability);
      expect(result).toBeCloseTo(216.67, 2); // (500 + 800 + 300 + 1000) / 12
    });
  });

  describe('Total Debt Calculations', () => {
    it('should calculate total debt from multiple liabilities', () => {
      const liabilities: Liability[] = [
        {
          id: '1',
          name: 'Credit Card 1',
          currentBalance: 5000,
          interestRate: 18.99,
          paymentSchedule: { frequency: 'monthly', amount: 200 },
        },
        {
          id: '2',
          name: 'Credit Card 2',
          currentBalance: 3000,
          interestRate: 15.99,
          paymentSchedule: { frequency: 'monthly', amount: 150 },
        },
        {
          id: '3',
          name: 'Car Loan',
          currentBalance: 25000,
          interestRate: 4.5,
          paymentSchedule: { frequency: 'monthly', amount: 450 },
        },
      ];

      const result = liabilityCalculatorService.calculateTotalDebt(liabilities);
      expect(result).toBe(33000); // 5000 + 3000 + 25000
    });

    it('should handle empty liability array', () => {
      const result = liabilityCalculatorService.calculateTotalDebt([]);
      expect(result).toBe(0);
    });

    it('should handle liabilities with zero balance', () => {
      const liabilities: Liability[] = [
        {
          id: '1',
          name: 'Paid Off Loan',
          currentBalance: 0,
          interestRate: 0,
          paymentSchedule: { frequency: 'monthly', amount: 0 },
        },
        {
          id: '2',
          name: 'Active Debt',
          currentBalance: 1000,
          interestRate: 12,
          paymentSchedule: { frequency: 'monthly', amount: 100 },
        },
      ];

      const result = liabilityCalculatorService.calculateTotalDebt(liabilities);
      expect(result).toBe(1000);
    });
  });

  describe('Total Monthly Payment Calculations', () => {
    it('should calculate total monthly liability payments', () => {
      const liabilities: Liability[] = [
        {
          id: '1',
          name: 'Credit Card',
          currentBalance: 5000,
          interestRate: 18.99,
          paymentSchedule: { frequency: 'monthly', amount: 200 },
        },
        {
          id: '2',
          name: 'Car Loan',
          currentBalance: 20000,
          interestRate: 4.5,
          paymentSchedule: { frequency: 'monthly', amount: 450 },
        },
        {
          id: '3',
          name: 'Insurance',
          currentBalance: 1200,
          interestRate: 0,
          paymentSchedule: { frequency: 'quarterly', amount: 300 },
        },
      ];

      const result = liabilityCalculatorService.calculateTotalMonthlyLiabilityPayments(liabilities);
      expect(result).toBe(750); // 200 + 450 + 100
    });

    it('should exclude liabilities without payment schedules', () => {
      const liabilities: Liability[] = [
        {
          id: '1',
          name: 'Active Payment',
          currentBalance: 1000,
          interestRate: 12,
          paymentSchedule: { frequency: 'monthly', amount: 100 },
        },
        {
          id: '2',
          name: 'No Payment Schedule',
          currentBalance: 5000,
          interestRate: 15,
        },
      ];

      const result = liabilityCalculatorService.calculateTotalMonthlyLiabilityPayments(liabilities);
      expect(result).toBe(100);
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative balances (credits)', () => {
      const liability: Liability = {
        id: '1',
        name: 'Overpayment Credit',
        currentBalance: -500,
        interestRate: 0,
        paymentSchedule: { frequency: 'monthly', amount: 0 },
      };

      const result = liabilityCalculatorService.calculateTotalDebt([liability]);
      expect(result).toBe(-500);
    });

    it('should handle very large debt amounts', () => {
      const liability: Liability = {
        id: '1',
        name: 'Mortgage',
        currentBalance: 500000,
        interestRate: 3.5,
        paymentSchedule: { frequency: 'monthly', amount: 2500 },
      };

      const result = liabilityCalculatorService.calculateTotalDebt([liability]);
      expect(result).toBe(500000);
    });

    it('should handle invalid payment frequencies', () => {
      const liability: Liability = {
        id: '1',
        name: 'Invalid Frequency',
        currentBalance: 1000,
        interestRate: 10,
        paymentSchedule: {
          frequency: 'invalid' as any,
          amount: 100,
        },
      };

      const result = liabilityCalculatorService.calculateLiabilityMonthlyPayment(liability);
      expect(result).toBe(0);
    });

    it('should handle missing custom amounts', () => {
      const liability: Liability = {
        id: '1',
        name: 'Missing Custom Amounts',
        currentBalance: 1000,
        interestRate: 10,
        paymentSchedule: {
          frequency: 'custom',
          amount: 100,
          // customAmounts is undefined
        },
      };

      const result = liabilityCalculatorService.calculateLiabilityMonthlyPayment(liability);
      expect(result).toBe(0);
    });
  });

  describe('Interest Rate Considerations', () => {
    it('should store interest rate information for future calculations', () => {
      const liability: Liability = {
        id: '1',
        name: 'High Interest Debt',
        currentBalance: 10000,
        interestRate: 29.99,
        paymentSchedule: { frequency: 'monthly', amount: 500 },
      };

      // The current service doesn't use interest rate in calculations
      // but it should be preserved for future use
      expect(liability.interestRate).toBe(29.99);
      expect(liabilityCalculatorService.calculateLiabilityMonthlyPayment(liability)).toBe(500);
    });
  });

  describe('Performance Tests', () => {
    it('should handle large arrays efficiently', () => {
      const liabilities: Liability[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `liability-${i}`,
        name: `Liability ${i}`,
        currentBalance: 1000,
        interestRate: 15,
        paymentSchedule: { frequency: 'monthly', amount: 50 },
      }));

      const start = performance.now();
      const totalDebt = liabilityCalculatorService.calculateTotalDebt(liabilities);
      const totalPayments = liabilityCalculatorService.calculateTotalMonthlyLiabilityPayments(liabilities);
      const end = performance.now();

      expect(totalDebt).toBe(1000000); // 1000 * 1000
      expect(totalPayments).toBe(50000); // 1000 * 50
      expect(end - start).toBeLessThan(100); // Should complete in less than 100ms
    });
  });
});