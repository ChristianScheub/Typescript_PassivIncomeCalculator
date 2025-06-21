import { z } from 'zod';
import { 
  FieldType, 
  FieldValidation, 
  ValidationOptions, 
  FieldConfig 
} from '../types/shared/utils/form-validation';

// Basic field types
const baseFields = {
  name: z.string().min(1, 'Name is required'),
  notes: z.string().optional(),
  // Common fields for dates
  startDate: z.string(),
  endDate: z.string().optional(),
};

// Payment schedule validation
export const paymentScheduleSchema = z.object({
  frequency: z.enum(['monthly', 'quarterly', 'annually', 'custom', 'none']),
  amount: z.number().min(0, 'Payment amount must be positive'),
  months: z.array(z.number().min(1).max(12)).optional(),
  customAmounts: z.record(z.number()).optional(),
});

// Form validation utilities with proper typing
export type ValidationSchema<T = unknown> = z.ZodType<T>;

export interface LocalValidationOptions {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  customValidation?: (value: unknown) => boolean;
}

const createStringValidation = (options: ValidationOptions): z.ZodString | z.ZodOptional<z.ZodString> => {
  const schema = z.string();
  const withPattern = options.pattern ? schema.regex(options.pattern) : schema;
  return options.required ? withPattern.min(1, 'Field is required') : withPattern.optional();
};

const createNumberValidation = (options: ValidationOptions): z.ZodNumber | z.ZodOptional<z.ZodNumber> => {
  const schema = z.number();
  
  let withBounds = schema;
  if (options.max !== undefined && options.min !== undefined) {
    withBounds = schema.min(options.min).max(options.max);
  } else if (options.max !== undefined) {
    withBounds = schema.max(options.max);
  } else if (options.min !== undefined) {
    withBounds = schema.min(options.min);
  }
  
  return options.required ? withBounds : withBounds.optional();
};

const createBooleanValidation = (options: ValidationOptions): z.ZodBoolean | z.ZodOptional<z.ZodBoolean> => {
  const schema = z.boolean();
  return options.required ? schema : schema.optional();
};

const createDateValidation = (options: ValidationOptions): z.ZodString | z.ZodOptional<z.ZodString> => {
  const schema = z.string();
  return options.required ? schema.min(1, 'Date is required') : schema.optional();
};

export const createFieldValidation = (
  type: FieldType,
  options: ValidationOptions = {}
): FieldValidation => {
  let schema: FieldValidation;

  switch (type) {
    case 'string':
      schema = createStringValidation(options);
      break;
    case 'number':
      schema = createNumberValidation(options);
      break;
    case 'boolean':
      schema = createBooleanValidation(options);
      break;
    case 'date':
      schema = createDateValidation(options);
      break;
    default:
      throw new Error(`Unsupported field type: ${type}`);
  }

  return options.customValidation ? schema.refine(options.customValidation) : schema;
};

export function createValidationSchema<T extends Record<string, FieldType | FieldConfig>>(
  fields: T
): z.ZodObject<Record<string, FieldValidation>> {
  const shape: Record<string, FieldValidation> = {};

  for (const [key, config] of Object.entries(fields)) {
    const defaultOptions = {};
    if (typeof config === 'string') {
      // Simple field type
      shape[key] = createFieldValidation(config, defaultOptions);
    } else if (typeof config === 'object') {
      // Complex field configuration
      const { type, ...options } = config;
      shape[key] = createFieldValidation(type, options);
    }
  }

  return z.object(shape);
}

// Re-export base fields for use in form schemas
export { baseFields };

// Helper functions for form arrays
export const addArrayItem = <T>(array: T[] | null | undefined, item: T): T[] => {
  return [...(array || []), item];
};

export const removeArrayItem = <T>(array: T[] | null | undefined, index: number): T[] => {
  return (array || []).filter((_, i) => i !== index);
};

export const updateArrayItem = <T>(array: T[] | null | undefined, index: number, item: T): T[] => {
  return (array || []).map((current, i) => (i === index ? item : current));
};

export const getDefaultValues = <T extends Record<string, unknown>>(initialData: Partial<T> | undefined | null, defaultValues: Partial<T>): Partial<T> => {
  if (initialData) {
    return { ...defaultValues, ...initialData };
  }
  return defaultValues;
};
