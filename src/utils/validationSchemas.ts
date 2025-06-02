import { z } from 'zod';

// Payment Schedule Schema
export const createPaymentScheduleSchema = () => z.object({
  frequency: z.enum(['monthly', 'quarterly', 'annually', 'custom', 'none'] as const),
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
  quantity: amountSchema.optional(),
  purchasePrice: amountSchema.optional(),
  currentPrice: amountSchema.optional(),
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
export const createAssetSchema = () => baseEntitySchema.extend({
  type: z.enum(['stock', 'bond', 'real_estate', 'crypto', 'cash', 'other'] as const),
  value: amountSchema,
  country: z.string().optional(),
  continent: z.string().optional(),
  sector: z.string().optional(),
  ...stockFields,
  ...realEstateFields,
  ...bondFields,
  ...cryptoFields,
});

// Liability Schema
export const createLiabilitySchema = () => baseEntitySchema.extend({
  type: z.enum(['mortgage', 'personal_loan', 'credit_card', 'student_loan', 'auto_loan', 'other'] as const),
  principalAmount: amountSchema,
  currentBalance: amountSchema,
  interestRate: amountSchema,
  paymentSchedule: createPaymentScheduleSchema(),
});

// Income Schema
export const createIncomeSchema = () => baseEntitySchema.extend({
  type: z.enum(['salary', 'rental', 'dividend', 'interest', 'side_hustle', 'other'] as const),
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
