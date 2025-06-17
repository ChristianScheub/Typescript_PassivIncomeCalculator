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
  dayOfMonth: z.number().min(1).max(31).optional(), // Tag des Monats für die Zahlung
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
  // Note: currentPrice is now stored in AssetDefinition, not in transactions
};

export const realEstateFields = {
  propertyValue: amountSchema.optional(),
};

export const bondFields = {
  maturityDate: z.string().optional(),
  nominalValue: amountSchema.optional(),
};

export const cryptoFields = {
  symbol: z.string().optional(),
  acquisitionCost: amountSchema.optional(),
};

// Asset Schema - Transaction-focused, references AssetDefinition for master data
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
    
    // Asset Definition reference
    assetDefinitionId: z.string().optional(),
    
    // Transaction type
    transactionType: z.enum(['buy', 'sell'] as const).optional(),
    
    // Transaction specific data
    purchaseDate: z.string().optional(),
    purchasePrice: z.number({
      invalid_type_error: "Purchase price must be a number"
    }).min(0, "Purchase price must be positive").optional(),
    purchaseQuantity: z.number({
      invalid_type_error: "Purchase quantity must be a number"
    }).min(0, "Purchase quantity must be positive").optional(),
    
    // Sale specific data
    saleDate: z.string().optional(),
    salePrice: z.number({
      invalid_type_error: "Sale price must be a number"
    }).min(0, "Sale price must be positive").optional(),
    saleQuantity: z.number({
      invalid_type_error: "Sale quantity must be a number"
    }).min(0, "Sale quantity must be positive").optional(),
    
    transactionCosts: z.number().min(0).optional(),
    
    // Current values (calculated or updated)
    // Note: currentPrice, currentQuantity, and currentValue are now derived values, not stored
    // currentQuantity = purchaseQuantity (can change due to splits, etc.)
    // currentValue = assetDefinition.currentPrice * currentQuantity
    
    // Stock specific fields (for backwards compatibility)
    ticker: z.string().optional(),
    quantity: z.number({
      invalid_type_error: "Quantity must be a number"
    }).min(0, "Quantity must be positive").optional(),
    
    // Real estate specific fields (for backwards compatibility)
    propertyValue: z.number().min(0).optional(),
    
    // Bond specific fields (for backwards compatibility)
    maturityDate: z.string().optional(),
    nominalValue: z.number().min(0).optional(),
    
    // Crypto specific fields (for backwards compatibility)
    symbol: z.string().optional(),
    acquisitionCost: z.number().min(0).optional(),
    
    // Optional fields
    notes: z.string().optional(),
  });

  return assetSchema.superRefine((data, ctx) => {
    if (data.type === 'stock') {
      // For stocks, require quantity and purchase price - current price is in AssetDefinition
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
      // Note: currentPrice is now stored in AssetDefinition, not in transactions
      // Note: value is calculated from purchase data for transactions
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
  type: z.enum(['salary', 'interest', 'dividend', 'rental', 'side_hustle', 'other'] as const),
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
