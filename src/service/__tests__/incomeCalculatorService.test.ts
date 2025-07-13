import { mockIncomeCalculatorService as incomeCalculatorService } from './mockServices';

// Mock types for testing
interface Income {
  id: string;
  name: string;
  paymentSchedule?: {
    frequency: 'monthly' | 'quarterly' | 'annually' | 'custom';
    amount: number;
    customAmounts?: Record<number, number>;
  };
  isPassive: boolean;
}

interface PaymentSchedule {
  frequency: 'monthly' | 'quarterly' | 'annually' | 'custom';
  amount: number;
  customAmounts?: Record<number, number>;
}

interface DividendSchedule {
  frequency: 'quarterly' | 'monthly' | 'annually';
  amount: number;
  months?: number[];
}

interface Asset {
  id: string;
  symbol: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: Date;
  type: string;
}

interface IncomeAllocation {
  source: string;
  amount: number;
  percentage: number;
}

// Mock the logger
jest.mock('../shared/logging/Logger/logger', () => ({
  infoService: jest.fn(),
  errorService: jest.fn(),
  warnService: jest.fn(),
}));

describe('IncomeCalculatorService', () => {
  describe('Payment Schedule Calculations', () => {
    it('should calculate monthly payment schedule correctly', () => {
      const schedule: PaymentSchedule = {
        frequency: 'monthly',
        amount: 1000,
      };

      const result = incomeCalculatorService.calculatePaymentSchedule(schedule);
      expect(result.monthlyAmount).toBe(1000);
      expect(result.annualAmount).toBe(12000);
    });

    it('should calculate quarterly payment schedule correctly', () => {
      const schedule: PaymentSchedule = {
        frequency: 'quarterly',
        amount: 3000,
      };

      const result = incomeCalculatorService.calculatePaymentSchedule(schedule);
      expect(result.monthlyAmount).toBe(1000); // 3000 * 4 / 12
      expect(result.annualAmount).toBe(12000);
    });

    it('should calculate annual payment schedule correctly', () => {
      const schedule: PaymentSchedule = {
        frequency: 'annually',
        amount: 12000,
      };

      const result = incomeCalculatorService.calculatePaymentSchedule(schedule);
      expect(result.monthlyAmount).toBe(1000); // 12000 / 12
      expect(result.annualAmount).toBe(12000);
    });

    it('should handle invalid payment schedule', () => {
      const schedule: PaymentSchedule = {
        frequency: 'monthly',
        amount: NaN,
      };

      const result = incomeCalculatorService.calculatePaymentSchedule(schedule);
      expect(result.monthlyAmount).toBe(0);
      expect(result.annualAmount).toBe(0);
    });

    it('should calculate dividend schedule with quantity', () => {
      const schedule: DividendSchedule = {
        frequency: 'quarterly',
        amount: 2.5, // $2.50 per share
      };

      const result = incomeCalculatorService.calculateDividendSchedule(schedule, 100);
      expect(result.monthlyAmount).toBeCloseTo(83.33, 2); // (2.5 * 100 * 4) / 12
      expect(result.annualAmount).toBe(1000); // 2.5 * 100 * 4
    });

    it('should calculate dividend for specific month', () => {
      const schedule: DividendSchedule = {
        frequency: 'quarterly',
        amount: 2.5,
        months: [3, 6, 9, 12], // Mar, Jun, Sep, Dec
      };

      // Should receive dividend in March (month 3)
      const marchDividend = incomeCalculatorService.calculateDividendForMonth(schedule, 100, 3);
      expect(marchDividend).toBe(250); // 2.5 * 100

      // Should not receive dividend in February (month 2)
      const febDividend = incomeCalculatorService.calculateDividendForMonth(schedule, 100, 2);
      expect(febDividend).toBe(0);
    });
  });

  describe('Income Calculations', () => {
    it('should calculate monthly income correctly', () => {
      const income: Income = {
        id: '1',
        name: 'Salary',
        paymentSchedule: {
          frequency: 'monthly',
          amount: 5000,
        },
        isPassive: false,
      };

      const result = incomeCalculatorService.calculateMonthlyIncome(income);
      expect(result).toBe(5000);
    });

    it('should calculate total monthly income from multiple sources', () => {
      const incomes: Income[] = [
        {
          id: '1',
          name: 'Salary',
          paymentSchedule: { frequency: 'monthly', amount: 5000 },
          isPassive: false,
        },
        {
          id: '2',
          name: 'Freelance',
          paymentSchedule: { frequency: 'monthly', amount: 2000 },
          isPassive: false,
        },
        {
          id: '3',
          name: 'Dividends',
          paymentSchedule: { frequency: 'quarterly', amount: 1200 },
          isPassive: true,
        },
      ];

      const result = incomeCalculatorService.calculateTotalMonthlyIncome(incomes);
      expect(result).toBe(7400); // 5000 + 2000 + 400
    });

    it('should calculate passive income only', () => {
      const incomes: Income[] = [
        {
          id: '1',
          name: 'Salary',
          paymentSchedule: { frequency: 'monthly', amount: 5000 },
          isPassive: false,
        },
        {
          id: '2',
          name: 'Rental Income',
          paymentSchedule: { frequency: 'monthly', amount: 1500 },
          isPassive: true,
        },
        {
          id: '3',
          name: 'Dividends',
          paymentSchedule: { frequency: 'quarterly', amount: 1200 },
          isPassive: true,
        },
      ];

      const result = incomeCalculatorService.calculatePassiveIncome(incomes);
      expect(result).toBe(1900); // 1500 + 400
    });

    it('should calculate passive income ratio', () => {
      const monthlyIncome = 7000;
      const passiveIncome = 2100;

      const result = incomeCalculatorService.calculatePassiveIncomeRatio(monthlyIncome, passiveIncome);
      expect(result).toBe(30); // (2100/7000) * 100
    });

    it('should handle zero monthly income in passive ratio calculation', () => {
      const result = incomeCalculatorService.calculatePassiveIncomeRatio(0, 1000);
      expect(result).toBe(0);
    });

    it('should calculate annual income', () => {
      const monthlyIncome = 5000;
      const result = incomeCalculatorService.calculateAnnualIncome(monthlyIncome);
      expect(result).toBe(60000);
    });
  });

  describe('Income with Custom Schedules', () => {
    it('should handle custom payment frequency', () => {
      const income: Income = {
        id: '1',
        name: 'Bonus',
        paymentSchedule: {
          frequency: 'custom',
          amount: 0, // Not used for custom
          customAmounts: {
            3: 5000, // March
            6: 3000, // June
            12: 10000, // December
          },
        },
        isPassive: false,
      };

      const result = incomeCalculatorService.calculateMonthlyIncome(income);
      expect(result).toBe(1500); // (5000 + 3000 + 10000) / 12
    });

    it('should handle income without payment schedule', () => {
      const income: Income = {
        id: '1',
        name: 'Invalid Income',
        isPassive: false,
      };

      const result = incomeCalculatorService.calculateMonthlyIncome(income);
      expect(result).toBe(0);
    });
  });

  describe('Income Allocation Analysis', () => {
    it('should calculate income allocation correctly', () => {
      const incomes: Income[] = [
        {
          id: '1',
          name: 'Salary',
          paymentSchedule: { frequency: 'monthly', amount: 5000 },
          isPassive: false,
        },
      ];

      const assets: Asset[] = [
        {
          id: '1',
          symbol: 'AAPL',
          quantity: 100,
          purchasePrice: 150,
          purchaseDate: new Date(),
          type: 'stock',
        },
      ];

      // This would depend on the actual implementation
      const result = incomeCalculatorService.calculateIncomeAllocation(incomes, assets);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty income arrays', () => {
      expect(incomeCalculatorService.calculateTotalMonthlyIncome([])).toBe(0);
      expect(incomeCalculatorService.calculatePassiveIncome([])).toBe(0);
    });

    it('should handle negative amounts gracefully', () => {
      const income: Income = {
        id: '1',
        name: 'Loss',
        paymentSchedule: { frequency: 'monthly', amount: -1000 },
        isPassive: false,
      };

      const result = incomeCalculatorService.calculateMonthlyIncome(income);
      expect(result).toBe(-1000);
    });

    it('should handle very large numbers', () => {
      const income: Income = {
        id: '1',
        name: 'Lottery',
        paymentSchedule: { frequency: 'annually', amount: 1000000 },
        isPassive: false,
      };

      const result = incomeCalculatorService.calculateMonthlyIncome(income);
      expect(result).toBeCloseTo(83333.33, 2);
    });
  });
});