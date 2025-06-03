import { z } from 'zod';

// Payment Schedule Schema
export const createPaymentScheduleSchema = () => z.object({
  frequency: z.enum(['monthly', 'quarterly', 'annually', 'custom'] as const, {
    required_error: "Payment frequency is required",
    invalid_type_error: "Please select a valid payment frequency"
  }),
  amount: z.number().min(0, 'Amount must be positive'),
  months: z.array(z.number().min(1).max(12)).optional(),
  customAmounts: z.record(z.number()).optional(),
  paymentMonths: z.array(z.number().min(1).max(12)).optional(),
});

// Base Entity Schema
export const baseEntitySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  startDate: z.string(),
  endDate: z.string().optional(),
  notes: z.string().optional(),
});

// Amount Schema
export const amountSchema = z.number().min(0, 'Amount must be positive');

// Asset Specific Schemas
export const stockFields = {
  ticker: z.string().optional(),
  quantity: amountSchema,  // Required for stocks
  purchasePrice: amountSchema,  // Required for stocks
  currentPrice: amountSchema,  // Required for stocks
  dividendFrequency: z.enum(['monthly', 'quarterly', 'annually', 'custom', 'none'] as const).optional(),
  dividendAmount: amountSchema.optional(),
  dividendMonths: z.array(z.number()).optional(),
  dividendPaymentMonths: z.array(z.number()).optional(),
  customDividendAmounts: z.record(z.number()).optional(),
};

export const realEstateFields = {
  propertyValue: amountSchema.optional(),
  rentalAmount: amountSchema.optional(),
};

export const bondFields = {
  interestRate: amountSchema.optional(),
  maturityDate: z.string().optional(),
  nominalValue: amountSchema.optional(),
};

export const cryptoFields = {
  symbol: z.string().optional(),
  acquisitionCost: amountSchema.optional(),
};

// Asset Schema
// Asset Schema - separate from baseEntitySchema since assets don't have start/end dates
export const createAssetSchema = () => {
  const assetSchema = z.object({
    name: z.string({
      required_error: "Asset name is required",
      invalid_type_error: "Asset name must be a string"
    }).min(1, "Asset name is required"),
    type: z.enum(['stock', 'bond', 'real_estate', 'crypto', 'cash', 'other'] as const, {
      required_error: "Asset type is required",
      invalid_type_error: "Please select a valid asset type"
    }),
    value: z.number({
      required_error: "Asset value is required",
      invalid_type_error: "Asset value must be a number"
    }).min(0, "Asset value must be positive").optional(),  // Optional for stocks as it's calculated
    // Optional fields
    notes: z.string().optional(),
    country: z.string().optional(),
    continent: z.string().optional(),
    sector: z.string().optional(),
    // Stock specific fields
    ticker: z.string().optional(),
    quantity: z.number({
      invalid_type_error: "Quantity must be a number"
    }).min(0, "Quantity must be positive").optional(),
    purchasePrice: z.number({
      invalid_type_error: "Purchase price must be a number"
    }).min(0, "Purchase price must be positive").optional(),
    currentPrice: z.number({
      invalid_type_error: "Current price must be a number"
    }).min(0, "Current price must be positive").optional(),
    // Real estate specific fields
    propertyValue: z.number().min(0).optional(),
    rentalAmount: z.number().min(0).optional(),
    // Bond specific fields
    interestRate: z.number().min(0).optional(),
    maturityDate: z.string().optional(),
    nominalValue: z.number().min(0).optional(),
    // Crypto specific fields
    symbol: z.string().optional(),
    acquisitionCost: z.number().min(0).optional(),
    // Dividend related fields
    dividendFrequency: z.enum(['monthly', 'quarterly', 'annually', 'custom', 'none'] as const).optional(),
    dividendAmount: z.number().min(0).optional(),
    dividendMonths: z.array(z.number().min(1).max(12)).optional(),
    dividendPaymentMonths: z.array(z.number().min(1).max(12)).optional(),
    customDividendAmounts: z.record(z.number()).optional(),
  });

  return assetSchema.superRefine((data, ctx) => {
    if (data.type === 'stock') {
      // For stocks, require quantity and prices - value will be calculated automatically
      if (!data.quantity || data.quantity <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Quantity is required for stocks",
          path: ["quantity"]
        });
      }
      if (!data.purchasePrice || data.purchasePrice <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Purchase price is required for stocks",
          path: ["purchasePrice"]
        });
      }
      if (!data.currentPrice || data.currentPrice <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Current price is required for stocks",
          path: ["currentPrice"]
        });
      }
      // Note: value is not required for stocks as it's calculated from quantity * currentPrice
    } else if (!data.value || data.value <= 0) {
      // For non-stocks, require value
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Value is required for non-stock assets",
        path: ["value"]
      });
    }
  });
};

// Liability Schema
export const createLiabilitySchema = () => baseEntitySchema.extend({
  type: z.enum(['mortgage', 'personal_loan', 'credit_card', 'student_loan', 'auto_loan', 'other'] as const),
  initialBalance: amountSchema,
  currentBalance: amountSchema,
  interestRate: amountSchema,
  paymentSchedule: createPaymentScheduleSchema(),
});

// Income Schema
export const createIncomeSchema = () => baseEntitySchema.extend({
  type: z.enum(['salary', 'interest', 'side_hustle', 'other'] as const),
  paymentSchedule: createPaymentScheduleSchema(),
  isPassive: z.boolean(),
  sourceId: z.string().optional(),
});

// Expense Schema
export const createExpenseSchema = () => baseEntitySchema.extend({
  category: z.enum([
    'housing',
    'transportation',
    'food',
    'utilities',
    'insurance',
    'healthcare',
    'entertainment',
    'personal',
    'debt_payments',
    'education',
    'subscriptions',
    'other'
  ] as const),
  paymentSchedule: createPaymentScheduleSchema(),
});

// Generic Validation Schema Creator
export const createValidationSchema = <T extends z.ZodRawShape>(additionalFields: T) => {
  return baseEntitySchema.extend(additionalFields);
};

export type ValidationSchema<T extends z.ZodRawShape> = ReturnType<typeof createValidationSchema<T>>;
