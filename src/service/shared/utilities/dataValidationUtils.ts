/**
 * Data validation utilities for financial services
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface TransactionInput {
  amount?: number;
  date?: string | Date;
  category?: string;
  description?: string;
}

export interface IncomeInput {
  amount?: number;
  frequency?: string;
  source?: string;
  startDate?: string | Date;
  endDate?: string | Date;
}

export interface AssetInput {
  symbol?: string;
  shares?: number;
  price?: number;
  category?: string;
}

export const dataValidationUtils = {
  // Basic validation helpers
  isValidNumber: (value: any): boolean => {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
  },

  isPositiveNumber: (value: any): boolean => {
    return dataValidationUtils.isValidNumber(value) && value > 0;
  },

  isValidDate: (value: any): boolean => {
    if (!value) return false;
    const date = new Date(value);
    return date instanceof Date && !isNaN(date.getTime());
  },

  isValidString: (value: any, minLength: number = 1): boolean => {
    return typeof value === 'string' && value.trim().length >= minLength;
  },

  // Transaction validation
  validateTransaction: (transaction: TransactionInput): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Amount validation
    if (transaction.amount === undefined || transaction.amount === null) {
      errors.push('Amount is required');
    } else if (!dataValidationUtils.isValidNumber(transaction.amount)) {
      errors.push('Amount must be a valid number');
    } else if (transaction.amount <= 0) {
      errors.push('Amount must be positive');
    } else if (transaction.amount > 1000000) {
      warnings.push('Amount is unusually large');
    }

    // Date validation
    if (transaction.date === undefined || transaction.date === null) {
      errors.push('Date is required');
    } else if (!dataValidationUtils.isValidDate(transaction.date)) {
      errors.push('Date must be a valid date');
    } else {
      const date = new Date(transaction.date);
      const now = new Date();
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(now.getFullYear() + 1);
      
      if (date > oneYearFromNow) {
        warnings.push('Transaction date is more than a year in the future');
      }
    }

    // Category validation
    if (!dataValidationUtils.isValidString(transaction.category)) {
      errors.push('Category is required');
    }

    // Description validation (optional but warn if too long)
    if (transaction.description && transaction.description.length > 500) {
      warnings.push('Description is very long');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  },

  // Income validation
  validateIncome: (income: IncomeInput): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Amount validation
    if (income.amount === undefined || income.amount === null) {
      errors.push('Income amount is required');
    } else if (!dataValidationUtils.isPositiveNumber(income.amount)) {
      errors.push('Income amount must be a positive number');
    } else if (income.amount > 100000) {
      warnings.push('Income amount is unusually high');
    }

    // Frequency validation
    const validFrequencies = ['weekly', 'biweekly', 'monthly', 'quarterly', 'annually'];
    if (!income.frequency) {
      errors.push('Income frequency is required');
    } else if (!validFrequencies.includes(income.frequency)) {
      errors.push('Income frequency must be one of: ' + validFrequencies.join(', '));
    }

    // Source validation
    if (!dataValidationUtils.isValidString(income.source)) {
      errors.push('Income source is required');
    }

    // Date validation
    if (income.startDate && !dataValidationUtils.isValidDate(income.startDate)) {
      errors.push('Start date must be a valid date');
    }

    if (income.endDate && !dataValidationUtils.isValidDate(income.endDate)) {
      errors.push('End date must be a valid date');
    }

    if (income.startDate && income.endDate) {
      const start = new Date(income.startDate);
      const end = new Date(income.endDate);
      if (start >= end) {
        errors.push('End date must be after start date');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  },

  // Asset validation
  validateAsset: (asset: AssetInput): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Symbol validation
    if (!dataValidationUtils.isValidString(asset.symbol)) {
      errors.push('Asset symbol is required');
    } else if (asset.symbol && asset.symbol.length > 10) {
      warnings.push('Asset symbol is unusually long');
    }

    // Shares validation
    if (asset.shares === undefined || asset.shares === null) {
      errors.push('Number of shares is required');
    } else if (!dataValidationUtils.isPositiveNumber(asset.shares)) {
      errors.push('Number of shares must be a positive number');
    } else if (asset.shares % 1 !== 0 && asset.shares < 1) {
      warnings.push('Fractional shares detected');
    }

    // Price validation
    if (asset.price === undefined || asset.price === null) {
      errors.push('Asset price is required');
    } else if (!dataValidationUtils.isPositiveNumber(asset.price)) {
      errors.push('Asset price must be a positive number');
    } else if (asset.price > 10000) {
      warnings.push('Asset price is unusually high');
    }

    // Category validation
    const validCategories = ['stocks', 'bonds', 'etf', 'mutual_fund', 'crypto', 'commodity', 'real_estate'];
    if (!asset.category) {
      errors.push('Asset category is required');
    } else if (!validCategories.includes(asset.category)) {
      errors.push('Asset category must be one of: ' + validCategories.join(', '));
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  },

  // Bulk validation
  validateTransactionBatch: (transactions: TransactionInput[]): ValidationResult => {
    const allErrors: string[] = [];
    const allWarnings: string[] = [];
    let validCount = 0;

    transactions.forEach((transaction, index) => {
      const result = dataValidationUtils.validateTransaction(transaction);
      if (result.isValid) {
        validCount++;
      }

      result.errors.forEach(error => {
        allErrors.push(`Transaction ${index + 1}: ${error}`);
      });

      result.warnings.forEach(warning => {
        allWarnings.push(`Transaction ${index + 1}: ${warning}`);
      });
    });

    if (transactions.length > 0 && validCount / transactions.length < 0.8) {
      allWarnings.push(`Only ${validCount}/${transactions.length} transactions are valid`);
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings
    };
  },

  // Sanitization helpers
  sanitizeNumericInput: (value: any): number | null => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value.replace(/[^0-9.-]/g, ''));
      return isNaN(parsed) ? null : parsed;
    }
    return null;
  },

  sanitizeStringInput: (value: any, maxLength: number = 255): string => {
    if (typeof value !== 'string') return '';
    return value.trim().substring(0, maxLength);
  },

  sanitizeDateInput: (value: any): Date | null => {
    if (!value) return null;
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  },

  // Custom validation rules
  createCustomValidator: (rules: Record<string, (value: any) => string | null>) => {
    return (data: Record<string, any>): ValidationResult => {
      const errors: string[] = [];
      const warnings: string[] = [];

      Object.entries(rules).forEach(([field, validator]) => {
        const value = data[field];
        const result = validator(value);
        if (result) {
          errors.push(`${field}: ${result}`);
        }
      });

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
    };
  }
};