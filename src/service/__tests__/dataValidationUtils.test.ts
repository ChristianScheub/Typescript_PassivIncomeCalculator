import { 
  dataValidationUtils, 
  ValidationResult, 
  TransactionInput, 
  IncomeInput, 
  AssetInput 
} from '../shared/utilities/dataValidationUtils';

describe('DataValidationUtils', () => {
  describe('Basic validation helpers', () => {
    describe('isValidNumber', () => {
      test('should return true for valid numbers', () => {
        expect(dataValidationUtils.isValidNumber(0)).toBe(true);
        expect(dataValidationUtils.isValidNumber(123)).toBe(true);
        expect(dataValidationUtils.isValidNumber(-456)).toBe(true);
        expect(dataValidationUtils.isValidNumber(123.45)).toBe(true);
      });

      test('should return false for invalid numbers', () => {
        expect(dataValidationUtils.isValidNumber(NaN)).toBe(false);
        expect(dataValidationUtils.isValidNumber(Infinity)).toBe(false);
        expect(dataValidationUtils.isValidNumber(-Infinity)).toBe(false);
        expect(dataValidationUtils.isValidNumber('123')).toBe(false);
        expect(dataValidationUtils.isValidNumber(null)).toBe(false);
        expect(dataValidationUtils.isValidNumber(undefined)).toBe(false);
      });
    });

    describe('isPositiveNumber', () => {
      test('should return true for positive numbers', () => {
        expect(dataValidationUtils.isPositiveNumber(1)).toBe(true);
        expect(dataValidationUtils.isPositiveNumber(123.45)).toBe(true);
        expect(dataValidationUtils.isPositiveNumber(0.01)).toBe(true);
      });

      test('should return false for non-positive numbers', () => {
        expect(dataValidationUtils.isPositiveNumber(0)).toBe(false);
        expect(dataValidationUtils.isPositiveNumber(-1)).toBe(false);
        expect(dataValidationUtils.isPositiveNumber(NaN)).toBe(false);
        expect(dataValidationUtils.isPositiveNumber('123')).toBe(false);
      });
    });

    describe('isValidDate', () => {
      test('should return true for valid dates', () => {
        expect(dataValidationUtils.isValidDate('2023-01-01')).toBe(true);
        expect(dataValidationUtils.isValidDate(new Date())).toBe(true);
        expect(dataValidationUtils.isValidDate('2023-12-31T23:59:59')).toBe(true);
      });

      test('should return false for invalid dates', () => {
        expect(dataValidationUtils.isValidDate('')).toBe(false);
        expect(dataValidationUtils.isValidDate(null)).toBe(false);
        expect(dataValidationUtils.isValidDate(undefined)).toBe(false);
        expect(dataValidationUtils.isValidDate('invalid-date')).toBe(false);
        expect(dataValidationUtils.isValidDate('2023-13-01')).toBe(false);
      });
    });

    describe('isValidString', () => {
      test('should return true for valid strings', () => {
        expect(dataValidationUtils.isValidString('hello')).toBe(true);
        expect(dataValidationUtils.isValidString('hello world', 5)).toBe(true);
        expect(dataValidationUtils.isValidString('  hello  ')).toBe(true); // trimmed
      });

      test('should return false for invalid strings', () => {
        expect(dataValidationUtils.isValidString('')).toBe(false);
        expect(dataValidationUtils.isValidString('   ')).toBe(false);
        expect(dataValidationUtils.isValidString('hi', 5)).toBe(false);
        expect(dataValidationUtils.isValidString(123)).toBe(false);
        expect(dataValidationUtils.isValidString(null)).toBe(false);
      });
    });

    describe('isValidEmail', () => {
      test('should return true for valid emails', () => {
        expect(dataValidationUtils.isValidEmail('test@example.com')).toBe(true);
        expect(dataValidationUtils.isValidEmail('user.name@domain.co.uk')).toBe(true);
        expect(dataValidationUtils.isValidEmail('test+tag@example.org')).toBe(true);
      });

      test('should return false for invalid emails', () => {
        expect(dataValidationUtils.isValidEmail('invalid-email')).toBe(false);
        expect(dataValidationUtils.isValidEmail('test@')).toBe(false);
        expect(dataValidationUtils.isValidEmail('@example.com')).toBe(false);
        expect(dataValidationUtils.isValidEmail('test@example')).toBe(false);
        expect(dataValidationUtils.isValidEmail('')).toBe(false);
      });
    });
  });

  describe('Transaction validation', () => {
    test('should validate a correct transaction', () => {
      const transaction: TransactionInput = {
        amount: 100.50,
        date: '2023-01-01',
        category: 'groceries',
        description: 'Weekly shopping'
      };

      const result = dataValidationUtils.validateTransaction(transaction);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should detect missing required fields', () => {
      const transaction: TransactionInput = {};

      const result = dataValidationUtils.validateTransaction(transaction);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Amount is required');
      expect(result.errors).toContain('Date is required');
      expect(result.errors).toContain('Category is required');
    });

    test('should detect invalid amount', () => {
      const transaction: TransactionInput = {
        amount: -100,
        date: '2023-01-01',
        category: 'groceries'
      };

      const result = dataValidationUtils.validateTransaction(transaction);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Amount must be positive');
    });

    test('should warn about large amounts', () => {
      const transaction: TransactionInput = {
        amount: 2000000,
        date: '2023-01-01',
        category: 'investment'
      };

      const result = dataValidationUtils.validateTransaction(transaction);
      expect(result.warnings).toContain('Amount is unusually large');
    });

    test('should detect invalid dates', () => {
      const transaction: TransactionInput = {
        amount: 100,
        date: 'invalid-date',
        category: 'groceries'
      };

      const result = dataValidationUtils.validateTransaction(transaction);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Date must be a valid date');
    });

    test('should warn about future dates', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 2);

      const transaction: TransactionInput = {
        amount: 100,
        date: futureDate.toISOString(),
        category: 'groceries'
      };

      const result = dataValidationUtils.validateTransaction(transaction);
      expect(result.warnings).toContain('Transaction date is more than a year in the future');
    });

    test('should warn about long descriptions', () => {
      const longDescription = 'A'.repeat(600);
      const transaction: TransactionInput = {
        amount: 100,
        date: '2023-01-01',
        category: 'groceries',
        description: longDescription
      };

      const result = dataValidationUtils.validateTransaction(transaction);
      expect(result.warnings).toContain('Description is very long');
    });
  });

  describe('Income validation', () => {
    test('should validate a correct income', () => {
      const income: IncomeInput = {
        amount: 5000,
        frequency: 'monthly',
        source: 'Salary',
        startDate: '2023-01-01',
        endDate: '2023-12-31'
      };

      const result = dataValidationUtils.validateIncome(income);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should detect missing required fields', () => {
      const income: IncomeInput = {};

      const result = dataValidationUtils.validateIncome(income);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Income amount is required');
      expect(result.errors).toContain('Income frequency is required');
      expect(result.errors).toContain('Income source is required');
    });

    test('should validate frequency values', () => {
      const income: IncomeInput = {
        amount: 5000,
        frequency: 'invalid-frequency',
        source: 'Salary'
      };

      const result = dataValidationUtils.validateIncome(income);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Income frequency must be one of');
    });

    test('should warn about high income amounts', () => {
      const income: IncomeInput = {
        amount: 150000,
        frequency: 'monthly',
        source: 'Business'
      };

      const result = dataValidationUtils.validateIncome(income);
      expect(result.warnings).toContain('Income amount is unusually high');
    });

    test('should validate date ranges', () => {
      const income: IncomeInput = {
        amount: 5000,
        frequency: 'monthly',
        source: 'Salary',
        startDate: '2023-12-31',
        endDate: '2023-01-01'
      };

      const result = dataValidationUtils.validateIncome(income);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('End date must be after start date');
    });
  });

  describe('Asset validation', () => {
    test('should validate a correct asset', () => {
      const asset: AssetInput = {
        symbol: 'AAPL',
        shares: 100,
        price: 150.50,
        category: 'stocks'
      };

      const result = dataValidationUtils.validateAsset(asset);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should detect missing required fields', () => {
      const asset: AssetInput = {};

      const result = dataValidationUtils.validateAsset(asset);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Asset symbol is required');
      expect(result.errors).toContain('Number of shares is required');
      expect(result.errors).toContain('Asset price is required');
      expect(result.errors).toContain('Asset category is required');
    });

    test('should warn about long symbols', () => {
      const asset: AssetInput = {
        symbol: 'VERYLONGSYMBOL',
        shares: 100,
        price: 150,
        category: 'stocks'
      };

      const result = dataValidationUtils.validateAsset(asset);
      expect(result.warnings).toContain('Asset symbol is unusually long');
    });

    test('should warn about fractional shares', () => {
      const asset: AssetInput = {
        symbol: 'AAPL',
        shares: 0.5,
        price: 150,
        category: 'stocks'
      };

      const result = dataValidationUtils.validateAsset(asset);
      expect(result.warnings).toContain('Fractional shares detected');
    });

    test('should warn about high prices', () => {
      const asset: AssetInput = {
        symbol: 'BRK.A',
        shares: 1,
        price: 500000,
        category: 'stocks'
      };

      const result = dataValidationUtils.validateAsset(asset);
      expect(result.warnings).toContain('Asset price is unusually high');
    });

    test('should validate category values', () => {
      const asset: AssetInput = {
        symbol: 'AAPL',
        shares: 100,
        price: 150,
        category: 'invalid-category'
      };

      const result = dataValidationUtils.validateAsset(asset);
      expect(result.isValid).toBe(false);
      expect(result.errors[0]).toContain('Asset category must be one of');
    });
  });

  describe('Bulk validation', () => {
    test('should validate transaction batches', () => {
      const transactions: TransactionInput[] = [
        { amount: 100, date: '2023-01-01', category: 'groceries' },
        { amount: 50, date: '2023-01-02', category: 'transport' }
      ];

      const result = dataValidationUtils.validateTransactionBatch(transactions);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should collect errors from multiple transactions', () => {
      const transactions: TransactionInput[] = [
        { amount: -100, date: '2023-01-01', category: 'groceries' },
        { amount: 50, date: 'invalid-date', category: 'transport' }
      ];

      const result = dataValidationUtils.validateTransactionBatch(transactions);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Transaction 1: Amount must be positive');
      expect(result.errors).toContain('Transaction 2: Date must be a valid date');
    });

    test('should warn about low validation success rate', () => {
      const transactions: TransactionInput[] = [
        { amount: -100, date: '2023-01-01', category: 'groceries' },
        { amount: -50, date: 'invalid-date', category: 'transport' },
        { amount: 30, date: '2023-01-03', category: 'food' }
      ];

      const result = dataValidationUtils.validateTransactionBatch(transactions);
      expect(result.warnings.some(w => w.includes('Only 1/3 transactions are valid'))).toBe(true);
    });
  });

  describe('Sanitization helpers', () => {
    describe('sanitizeNumericInput', () => {
      test('should handle valid numbers', () => {
        expect(dataValidationUtils.sanitizeNumericInput(123)).toBe(123);
        expect(dataValidationUtils.sanitizeNumericInput(123.45)).toBe(123.45);
      });

      test('should parse numeric strings', () => {
        expect(dataValidationUtils.sanitizeNumericInput('123')).toBe(123);
        expect(dataValidationUtils.sanitizeNumericInput('$123.45')).toBe(123.45);
        expect(dataValidationUtils.sanitizeNumericInput('1,234.56')).toBe(1234.56);
      });

      test('should return null for invalid inputs', () => {
        expect(dataValidationUtils.sanitizeNumericInput('abc')).toBe(null);
        expect(dataValidationUtils.sanitizeNumericInput(null)).toBe(null);
        expect(dataValidationUtils.sanitizeNumericInput(undefined)).toBe(null);
      });
    });

    describe('sanitizeStringInput', () => {
      test('should trim and limit string length', () => {
        expect(dataValidationUtils.sanitizeStringInput('  hello  ')).toBe('hello');
        expect(dataValidationUtils.sanitizeStringInput('very long string', 5)).toBe('very ');
      });

      test('should handle non-string inputs', () => {
        expect(dataValidationUtils.sanitizeStringInput(123)).toBe('');
        expect(dataValidationUtils.sanitizeStringInput(null)).toBe('');
        expect(dataValidationUtils.sanitizeStringInput(undefined)).toBe('');
      });
    });

    describe('sanitizeDateInput', () => {
      test('should handle valid dates', () => {
        const date = new Date('2023-01-01');
        expect(dataValidationUtils.sanitizeDateInput('2023-01-01')).toEqual(date);
        expect(dataValidationUtils.sanitizeDateInput(date)).toEqual(date);
      });

      test('should return null for invalid dates', () => {
        expect(dataValidationUtils.sanitizeDateInput('invalid-date')).toBe(null);
        expect(dataValidationUtils.sanitizeDateInput(null)).toBe(null);
        expect(dataValidationUtils.sanitizeDateInput('')).toBe(null);
      });
    });
  });

  describe('Custom validators', () => {
    test('should create and execute custom validation rules', () => {
      const validator = dataValidationUtils.createCustomValidator({
        name: (value: any) => {
          if (!value || typeof value !== 'string') return 'Name is required';
          if (value.length < 2) return 'Name must be at least 2 characters';
          return null;
        },
        age: (value: any) => {
          if (typeof value !== 'number') return 'Age must be a number';
          if (value < 0 || value > 150) return 'Age must be between 0 and 150';
          return null;
        }
      });

      const validData = { name: 'John Doe', age: 30 };
      const validResult = validator(validData);
      expect(validResult.isValid).toBe(true);
      expect(validResult.errors).toHaveLength(0);

      const invalidData = { name: 'A', age: -5 };
      const invalidResult = validator(invalidData);
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors).toContain('name: Name must be at least 2 characters');
      expect(invalidResult.errors).toContain('age: Age must be between 0 and 150');
    });
  });
});